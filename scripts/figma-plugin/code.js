// Design Flow Harness — Figma plugin main thread (has full Figma API access).
// Reusable: the pasted spec's `op` field selects the action.
//   op: "extract"    -> produce a snapshot JSON identical in schema to scripts/figma/extract-snapshot.js
//   op: "create"     -> build variables/text styles/frames from a declarative spec, return created node IDs
//   op: "screenshot" -> export target frames as base64 PNG for local saving
//   op: "rebind"     -> ensure variables/text styles exist, then walk a page and re-bind
//                       raw hex fills/strokes and text styles to semantic tokens by a mapping table.
//                       Alpha is preserved as paint opacity. Returns a per-node change report.
// The UI (ui.html) handles clipboard in/out. This file never touches the filesystem.

figma.showUI(__html__, { width: 460, height: 560 });

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== 'run') return;
  let spec;
  try {
    spec = typeof msg.spec === 'string' ? JSON.parse(msg.spec) : msg.spec;
  } catch (e) {
    return figma.ui.postMessage({ type: 'error', message: 'JSON 파싱 실패: ' + e.message });
  }
  try {
    let result;
    if (spec.op === 'extract') result = await runExtract(spec);
    else if (spec.op === 'create') result = await runCreate(spec);
    else if (spec.op === 'screenshot') result = await runScreenshot(spec);
    else if (spec.op === 'rebind') result = await runRebind(spec);
    else if (spec.op === 'duplicate') result = await runDuplicate(spec);
    else throw new Error('알 수 없는 op: ' + spec.op + ' (create/extract/screenshot/rebind/duplicate 중 하나)');
    figma.ui.postMessage({ type: 'result', op: spec.op, result });
  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: e.message });
  }
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
const rgba = (c) =>
  '#' +
  [c.r, c.g, c.b, ...((c.a ?? 1) < 1 ? [c.a] : [])]
    .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

function hexToRgb(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(hex);
  if (!m) throw new Error('색상 형식 오류: ' + hex);
  const v = (h) => parseInt(h, 16) / 255;
  return { r: v(m[1]), g: v(m[2]), b: v(m[3]), ...(m[4] ? { a: v(m[4]) } : {}) };
}

// ===========================================================================
// EXTRACT — schema-identical to scripts/figma/extract-snapshot.js
// ===========================================================================
async function runExtract(spec) {
  const CONFIG = {
    fileKey: spec.fileKey,
    pageName: spec.pageName,
    stage: spec.stage,
    inputDigest: spec.inputDigest,
    frameIds: Array.isArray(spec.frameIds) ? spec.frameIds : [],
    capturedAt: spec.capturedAt || null,
  };
  for (const [k, v] of Object.entries(CONFIG)) {
    if (typeof v === 'string' && v.startsWith('__')) throw new Error('CONFIG 치환 필요: ' + k);
  }
  if (!CONFIG.fileKey || !CONFIG.pageName || !CONFIG.stage || !CONFIG.inputDigest)
    throw new Error('extract 스펙에 fileKey/pageName/stage/inputDigest 필요');
  if (figma.fileKey && figma.fileKey !== CONFIG.fileKey) throw new Error('다른 Figma 파일');

  const page = figma.root.children.find((p) => p.name === CONFIG.pageName);
  if (!page) throw new Error('페이지 없음: ' + CONFIG.pageName);
  await figma.setCurrentPageAsync(page);

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionNames = new Map(collections.map((c) => [c.id, c.name]));
  const variables = {};
  const variableCache = new Map();

  async function variable(id) {
    if (!variableCache.has(id)) {
      const v = await figma.variables.getVariableByIdAsync(id);
      let collection = v ? collectionNames.get(v.variableCollectionId) : null;
      if (v && !collection) {
        const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
        collection = c?.name;
      }
      variableCache.set(id, v ? { name: v.name, collection } : null);
    }
    return variableCache.get(id);
  }

  for (const c of collections) {
    if (variables[c.name]) throw new Error('변수 컬렉션 이름 중복');
    variables[c.name] = {};
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) throw new Error('변수 없음');
      if (variables[c.name][v.name]) throw new Error('변수 이름 중복');
      const valuesByMode = {};
      const aliasesByMode = {};
      for (const [mode, value] of Object.entries(v.valuesByMode)) {
        if (value?.type === 'VARIABLE_ALIAS') aliasesByMode[mode] = await variable(value.id);
        else valuesByMode[mode] = v.resolvedType === 'COLOR' ? rgba(value) : value;
      }
      variables[c.name][v.name] = { type: v.resolvedType, valuesByMode, aliasesByMode };
    }
  }

  const textStyles = {};
  for (const s of await figma.getLocalTextStylesAsync()) {
    if (textStyles[s.name]) throw new Error('텍스트 스타일 이름 중복');
    textStyles[s.name] = {
      fontFamily: s.fontName.family,
      fontStyle: s.fontName.style,
      fontSize: s.fontSize,
      lineHeight:
        s.lineHeight.unit === 'PIXELS'
          ? s.lineHeight.value
          : s.lineHeight.unit === 'PERCENT'
          ? (s.fontSize * s.lineHeight.value) / 100
          : null,
    };
  }

  async function paints(list) {
    const result = [];
    if (!Array.isArray(list)) return result;
    for (const p of list) {
      if (p.visible === false) continue;
      result.push({
        type: p.type,
        ...(p.type === 'SOLID'
          ? {
              color: rgba({ ...p.color, a: p.opacity ?? 1 }),
              binding: p.boundVariables?.color ? await variable(p.boundVariables.color.id) : null,
            }
          : {}),
        ...(p.type === 'IMAGE' ? { imageHash: p.imageHash, scaleMode: p.scaleMode } : {}),
      });
    }
    return result;
  }

  function metadata(node) {
    const shared =
      'getSharedPluginData' in node && typeof node.getSharedPluginData === 'function'
        ? node.getSharedPluginData('designHarness', 'metadata')
        : '';
    let local = '';
    if (typeof node.getPluginData === 'function') {
      try {
        local = node.getPluginData('designHarness');
      } catch (error) {
        if (!String(error.message).includes('getPluginData is not supported')) throw error;
      }
    }
    if (shared && local && shared !== local)
      throw new Error('designHarness 메타데이터 충돌: ' + node.id);
    const raw = shared || local;
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('designHarness 메타데이터 파싱 오류: ' + node.id);
    }
  }

  async function extract(root) {
    const origin = root.absoluteBoundingBox;
    if (!origin) throw new Error('프레임 경계 없음');
    const nodes = [];
    const queue = [{ node: root, parentId: null }];
    while (queue.length) {
      const { node: n, parentId } = queue.shift();
      if (n.visible === false) continue;
      const b = n.absoluteBoundingBox;
      if (!b) throw new Error('경계 없음: ' + n.id);
      const meta = metadata(n);
      const metrics = {};
      const bindings = {};
      for (const prop of [
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing',
        'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius',
      ]) {
        if (!(prop in n) || typeof n[prop] !== 'number') continue;
        metrics[prop] = n[prop];
        const binding =
          n.boundVariables?.[prop] || (/Radius$/.test(prop) ? n.boundVariables?.cornerRadius : null);
        bindings[prop] = binding?.id ? await variable(binding.id) : null;
      }
      for (const prop of ['width', 'height'])
        if (n.boundVariables?.[prop]?.id) {
          metrics[prop] = n[prop];
          bindings[prop] = await variable(n.boundVariables[prop].id);
        }
      let style = null;
      let font = null;
      if (n.type === 'TEXT') {
        if (typeof n.textStyleId === 'string' && n.textStyleId) {
          const s = await figma.getStyleByIdAsync(n.textStyleId);
          style = s?.name || null;
        }
        // Capture font properties for unstyled text so styles can be assigned by size/weight.
        // Figma returns figma.mixed when a text run has multiple values; guard against that.
        const fs = n.fontSize;
        const fn = n.fontName;
        const lh = n.lineHeight;
        const fw = n.fontWeight;
        font = {
          size: typeof fs === 'number' ? fs : null,
          family: fn && fn !== figma.mixed ? fn.family : null,
          style: fn && fn !== figma.mixed ? fn.style : null,
          weight: typeof fw === 'number' ? fw : null,
          lineHeight: lh && lh !== figma.mixed && lh.unit !== 'AUTO' ? lh.value : null,
          mixed: fs === figma.mixed || fn === figma.mixed,
        };
      }
      nodes.push({
        id: n.id,
        name: n.name,
        type: n.type,
        parentId,
        bounds: { x: b.x - origin.x, y: b.y - origin.y, width: n.width, height: n.height },
        fills: await paints('fills' in n ? n.fills : []),
        strokes: await paints('strokes' in n ? n.strokes : []),
        metrics,
        bindings,
        textStyle: style,
        font,
        layout: {
          mode: 'layoutMode' in n ? n.layoutMode : 'NONE',
          vertical: 'layoutSizingVertical' in n ? n.layoutSizingVertical : null,
        },
        clipsContent: 'clipsContent' in n && n.clipsContent === true,
        scrollable:
          'overflowDirection' in n && ['HORIZONTAL', 'VERTICAL', 'BOTH'].includes(n.overflowDirection),
        role: meta.role || null,
        componentId: meta.componentId || null,
        reusable: meta.reusable === true,
        tapTarget: meta.tapTarget === true,
        primaryActionId: meta.primaryActionId || null,
        slotId: meta.slotId || null,
        assetId: meta.assetId || null,
      });
      for (const child of 'children' in n ? n.children : []) queue.push({ node: child, parentId: n.id });
    }
    const meta = metadata(root);
    return {
      id: root.id,
      name: root.name,
      width: root.width,
      height: root.height,
      screenId: meta.screenId || null,
      state: meta.state || null,
      viewportId: meta.viewportId || null,
      nodes,
      truncated: false,
    };
  }

  const all = page.children.filter(
    (n) => n.visible !== false && ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION'].includes(n.type)
  );
  const targets = CONFIG.frameIds.length ? all.filter((n) => CONFIG.frameIds.includes(n.id)) : all;
  if (CONFIG.frameIds.length && targets.length !== new Set(CONFIG.frameIds).size)
    throw new Error('요청한 프레임 없음');
  const frames = [];
  for (const target of targets) frames.push(await extract(target));

  return {
    schemaVersion: 1,
    fileKey: CONFIG.fileKey,
    stage: CONFIG.stage,
    inputDigest: CONFIG.inputDigest,
    capturedAt: CONFIG.capturedAt || new Date().toISOString(),
    pageId: page.id,
    expectedFrameIds: all.map((f) => f.id),
    complete: targets.length === all.length,
    frames,
    variables,
    textStyles,
  };
}

// ===========================================================================
// CREATE — interpret a declarative spec into variables, text styles, and frames
// ===========================================================================
async function runCreate(spec) {
  if (!spec.pageName) throw new Error('create 스펙에 pageName 필요');
  if (figma.fileKey && spec.fileKey && figma.fileKey !== spec.fileKey)
    throw new Error('다른 Figma 파일');

  let page = figma.root.children.find((p) => p.name === spec.pageName);
  if (!page) {
    page = figma.createPage();
    page.name = spec.pageName;
  }
  await figma.setCurrentPageAsync(page);

  const created = { page: { id: page.id, name: page.name }, collections: {}, variables: {}, textStyles: {}, nodes: {} };
  const varRef = new Map(); // logical name -> Variable

  // 1) Variable collections + primitives + semantic aliases
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionByName = new Map(existingCollections.map((c) => [c.name, c]));

  async function ensureCollection(name) {
    let c = collectionByName.get(name);
    if (!c) {
      c = figma.variables.createVariableCollection(name);
      collectionByName.set(name, c);
    }
    created.collections[name] = c.id;
    return c;
  }

  if (spec.variables?.primitives) {
    const c = await ensureCollection('primitives');
    const modeId = c.modes[0].modeId;
    for (const [name, def] of Object.entries(spec.variables.primitives)) {
      const type = def.type === 'COLOR' ? 'COLOR' : 'FLOAT';
      const v = figma.variables.createVariable(name, c, type);
      v.setValueForMode(modeId, type === 'COLOR' ? hexToRgb(def.value) : def.value);
      if (def.scopes) v.scopes = def.scopes;
      varRef.set('primitives/' + name, v);
      created.variables['primitives/' + name] = v.id;
    }
  }
  if (spec.variables?.semantic) {
    const c = await ensureCollection('semantic');
    const modeId = c.modes[0].modeId;
    for (const [name, def] of Object.entries(spec.variables.semantic)) {
      const target = varRef.get('primitives/' + def.ref);
      if (!target) throw new Error('semantic ref 대상 primitive 없음: ' + def.ref);
      const v = figma.variables.createVariable(name, c, target.resolvedType);
      v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
      if (def.scopes) v.scopes = def.scopes;
      varRef.set('semantic/' + name, v);
      created.variables['semantic/' + name] = v.id;
    }
  }

  // 2) Text styles
  if (spec.textStyles) {
    for (const [name, def] of Object.entries(spec.textStyles)) {
      await figma.loadFontAsync({ family: def.fontFamily, style: def.fontStyle });
      const s = figma.createTextStyle();
      s.name = name;
      s.fontName = { family: def.fontFamily, style: def.fontStyle };
      s.fontSize = def.fontSize;
      if (typeof def.lineHeight === 'number') s.lineHeight = { unit: 'PIXELS', value: def.lineHeight };
      created.textStyles[name] = s.id;
    }
  }

  // 3) Images (base64) -> imageHash
  const imageHashes = {};
  if (spec.images) {
    for (const [assetId, base64] of Object.entries(spec.images)) {
      const bytes = base64ToBytes(base64);
      const image = figma.createImage(bytes);
      imageHashes[assetId] = image.hash;
    }
  }
  created.imageHashes = imageHashes;

  // 4) Node tree(s)
  const textStyleByName = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  const semanticByName = new Map();
  // Load EXISTING local semantic variables so nodes can bind to already-extracted tokens.
  {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    for (const c of cols) {
      if (c.name !== 'semantic') continue;
      for (const id of c.variableIds) {
        const v = await figma.variables.getVariableByIdAsync(id);
        if (v) semanticByName.set(v.name, v);
      }
    }
  }
  // Newly created semantic vars (this run) override/add.
  for (const [key, v] of varRef) if (key.startsWith('semantic/')) semanticByName.set(key.slice('semantic/'.length), v);

  async function build(node, parent) {
    let n;
    switch (node.type) {
      case 'FRAME': n = figma.createFrame(); break;
      case 'TEXT': n = figma.createText(); break;
      case 'RECTANGLE': n = figma.createRectangle(); break;
      case 'ELLIPSE': n = figma.createEllipse(); break;
      case 'LINE': n = figma.createLine(); break;
      case 'COMPONENT': n = figma.createComponent(); break;
      default: throw new Error('지원하지 않는 노드 타입: ' + node.type);
    }
    if (node.name) n.name = node.name;
    // Attach to parent BEFORE sizing so auto-layout sizing applies correctly.
    if (parent) parent.appendChild(n);
    else page.appendChild(n);

    if (node.type === 'TEXT') {
      const styleName = node.textStyle;
      if (styleName) {
        const s = textStyleByName.get(styleName);
        if (!s) throw new Error('텍스트 스타일 없음: ' + styleName);
        await figma.loadFontAsync(s.fontName);
        n.fontName = s.fontName;
        n.characters = node.characters || '';
        await n.setTextStyleIdAsync(s.id);
      } else {
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        n.characters = node.characters || '';
      }
    }

    // Auto layout
    if (node.layout && 'layoutMode' in n) {
      n.layoutMode = node.layout.mode || 'NONE';
      if (node.layout.mode && node.layout.mode !== 'NONE') {
        if (node.layout.primaryAxisSizingMode) n.primaryAxisSizingMode = node.layout.primaryAxisSizingMode;
        if (node.layout.counterAxisSizingMode) n.counterAxisSizingMode = node.layout.counterAxisSizingMode;
      }
    }

    // Size (before HUG/FILL constraints)
    if (typeof node.width === 'number' && typeof node.height === 'number') n.resize(node.width, node.height);

    // Fills
    if (node.fills) n.fills = node.fills.map((p) => paintFrom(p, semanticByName, imageHashes));
    if (node.strokes) n.strokes = node.strokes.map((p) => paintFrom(p, semanticByName, imageHashes));

    // Metric bindings (padding/spacing/radius)
    applyMetrics(n, node.metrics, node.bindings, semanticByName);

    // clip / scroll
    if (typeof node.clipsContent === 'boolean' && 'clipsContent' in n) n.clipsContent = node.clipsContent;
    if (node.overflowDirection && 'overflowDirection' in n) n.overflowDirection = node.overflowDirection;

    // Sizing constraints (HUG/FILL) after append
    if (node.layoutSizingVertical && 'layoutSizingVertical' in n) n.layoutSizingVertical = node.layoutSizingVertical;
    if (node.layoutSizingHorizontal && 'layoutSizingHorizontal' in n) n.layoutSizingHorizontal = node.layoutSizingHorizontal;

    // Metadata (shared plugin data)
    if (node.metadata) n.setSharedPluginData('designHarness', 'metadata', JSON.stringify(node.metadata));

    if (node.key) created.nodes[node.key] = n.id;

    for (const child of node.children || []) await build(child, n);
    return n;
  }

  const roots = spec.nodes || spec.frames || [];
  for (const node of roots) {
    // If a top-level node names an existing parent (e.g. a SECTION), append into it.
    let parent = null;
    if (node.parentId) {
      const p = await figma.getNodeByIdAsync(node.parentId);
      if (!p) throw new Error('parentId 노드 없음: ' + node.parentId);
      if (!('appendChild' in p)) throw new Error('parentId 노드가 자식을 가질 수 없음: ' + node.parentId);
      parent = p;
    }
    await build(node, parent);
  }

  return {
    op: 'create',
    fileKey: figma.fileKey || spec.fileKey || null,
    created,
  };
}

function applyMetrics(n, metrics, bindings, semanticByName) {
  if (!metrics) return;
  const radiusProps = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
  for (const [prop, value] of Object.entries(metrics)) {
    if (!(prop in n)) continue;
    n[prop] = value;
    const bindName = bindings?.[prop];
    if (!bindName) continue;
    const v = semanticByName.get(bindName);
    if (!v) throw new Error('바인딩 대상 semantic 변수 없음: ' + bindName);
    const field = radiusProps.includes(prop) ? prop : prop;
    n.setBoundVariable(field, v);
  }
}

function paintFrom(p, semanticByName, imageHashes) {
  if (p.type === 'IMAGE') {
    const hash = p.imageHash || (p.assetId ? imageHashes[p.assetId] : null);
    if (!hash) throw new Error('IMAGE paint에 imageHash/assetId 필요');
    return { type: 'IMAGE', scaleMode: p.scaleMode || 'FIT', imageHash: hash };
  }
  // SOLID
  const color = hexToRgb(p.color || '#000000');
  const paint = { type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a ?? 1 };
  if (p.binding) {
    const v = semanticByName.get(p.binding);
    if (!v) throw new Error('바인딩 대상 semantic 변수 없음: ' + p.binding);
    return figma.variables.setBoundVariableForPaint(paint, 'color', v);
  }
  return paint;
}

function base64ToBytes(b64) {
  const clean = b64.replace(/^data:[^,]+,/, '');
  const bin = atobPolyfill(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Figma's plugin sandbox may lack atob; provide a minimal polyfill.
function atobPolyfill(input) {
  if (typeof atob === 'function') return atob(input);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let str = input.replace(/=+$/, '');
  let output = '';
  for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ) {
    buffer = chars.indexOf(buffer);
    if (buffer === -1) continue;
    bs = bc % 4 ? bs * 64 + buffer : buffer;
    if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
  }
  return output;
}

// ===========================================================================
// SCREENSHOT — export target frames as base64 PNG
// ===========================================================================
async function runScreenshot(spec) {
  if (!spec.pageName) throw new Error('screenshot 스펙에 pageName 필요');
  const page = figma.root.children.find((p) => p.name === spec.pageName);
  if (!page) throw new Error('페이지 없음: ' + spec.pageName);
  await figma.setCurrentPageAsync(page);
  const scale = spec.scale || 2;
  const ids = Array.isArray(spec.frameIds) && spec.frameIds.length ? spec.frameIds : null;
  const targets = page.children.filter(
    (n) => ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'].includes(n.type) && (!ids || ids.includes(n.id))
  );
  const shots = [];
  for (const t of targets) {
    const bytes = await t.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
    shots.push({ id: t.id, name: t.name, pngBase64: bytesToBase64(bytes) });
  }
  return { op: 'screenshot', pageId: page.id, shots };
}

function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? '=' : chars[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? '=' : chars[b2 & 63];
  }
  return out;
}

// ===========================================================================
// REBIND — ensure tokens exist, then auto-bind raw values on a page to semantic
// variables using a mapping table. Alpha is preserved via paint opacity.
// ---------------------------------------------------------------------------
// Spec shape:
// {
//   "op": "rebind",
//   "fileKey": "...",
//   "pageName": "design",
//   "frameIds": [],                       // optional: limit to these top-level frames
//   "dryRun": false,                       // if true, report only, no mutation
//   "ensure": {                            // optional: create missing tokens first
//     "variables": {
//       "primitives": { "award-gold": { "type": "COLOR", "value": "#D4AF37" }, ... },
//       "semantic":   { "award/gold": { "ref": "award-gold" }, ... }
//     },
//     "textStyles": { "Text/body": { "fontFamily":"Inter","fontStyle":"Regular","fontSize":16,"lineHeight":24 } }
//   },
//   "colorMap":  { "D4AF37": "award/gold", "C9A84C": "award/gold", ... },  // base6 hex(UPPER) -> semantic name
//   "textStyleMap": { "Typography/Body L Regular": "Text/body-lg", ... },   // old style name -> new style name
//   "spacingTokens": [ { "name": "space/1", "value": 4 }, ... ],  // semantic name + canonical value for padding/itemSpacing
//   "radiusTokens":  [ { "name": "radius/sm", "value": 8 }, { "name": "radius/full", "value": 999 }, ... ],
//   "radiusFullName": "radius/full",      // radius >= radiusFullThreshold collapses to this token
//   "radiusFullThreshold": 48,            // px; default 48
//   "maxSnapError": 2,                    // px; values farther than this from any token are reported in `unsnappable`, not snapped
//   "bindUnstyledText": false             // (reserved) leave unstyled text as-is unless mapped
// }
// Metric props bound: paddingTop/Right/Bottom/Left, itemSpacing (spacingTokens);
//   topLeftRadius/topRightRadius/bottomLeftRadius/bottomRightRadius (radiusTokens).
//   Zero values and already-bound props are skipped. dryRun reports without mutation.
// ===========================================================================
async function runRebind(spec) {
  if (!spec.pageName) throw new Error('rebind 스펙에 pageName 필요');
  if (figma.fileKey && spec.fileKey && figma.fileKey !== spec.fileKey)
    throw new Error('다른 Figma 파일');
  const page = figma.root.children.find((p) => p.name === spec.pageName);
  if (!page) throw new Error('페이지 없음: ' + spec.pageName);
  await figma.setCurrentPageAsync(page);

  const dryRun = spec.dryRun === true;
  const report = {
    op: 'rebind',
    dryRun,
    fileKey: figma.fileKey || spec.fileKey || null,
    ensured: { collections: {}, variables: {}, textStyles: {} },
    counts: { fillsBound: 0, strokesBound: 0, textStylesSwapped: 0, nodesTouched: 0, metricsSnapped: 0, metricsBound: 0 },
    unmappedColors: {},   // base6 hex -> count (raw colors with no mapping)
    unsnappable: {},      // "prop=value" -> count (metrics too far from any token, need manual fix)
    warnings: [],
  };

  // ---- 1) Ensure tokens exist (skip in dryRun) ------------------------------
  const semanticByName = new Map();       // "award/gold" -> Variable
  const primitiveByName = new Map();      // "award-gold" -> Variable

  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionByName = new Map(existingCollections.map((c) => [c.name, c]));
  // Preload existing variables by "collectionName/variableName".
  for (const c of existingCollections) {
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) continue;
      if (c.name === 'primitives') primitiveByName.set(v.name, v);
      if (c.name === 'semantic') semanticByName.set(v.name, v);
    }
  }

  async function ensureCollection(name) {
    let c = collectionByName.get(name);
    if (!c) {
      if (dryRun) { report.warnings.push('dryRun: 컬렉션 생성 생략 ' + name); return null; }
      c = figma.variables.createVariableCollection(name);
      collectionByName.set(name, c);
    }
    report.ensured.collections[name] = c.id;
    return c;
  }

  const ensure = spec.ensure || {};
  if (ensure.variables?.primitives) {
    const c = await ensureCollection('primitives');
    if (c) {
      const modeId = c.modes[0].modeId;
      for (const [name, def] of Object.entries(ensure.variables.primitives)) {
        if (primitiveByName.has(name)) continue; // add-only, never overwrite
        if (dryRun) { report.ensured.variables['primitives/' + name] = '(dryRun)'; continue; }
        const type = def.type === 'COLOR' ? 'COLOR' : 'FLOAT';
        const v = figma.variables.createVariable(name, c, type);
        v.setValueForMode(modeId, type === 'COLOR' ? hexToRgb(def.value) : def.value);
        primitiveByName.set(name, v);
        report.ensured.variables['primitives/' + name] = v.id;
      }
    }
  }
  if (ensure.variables?.semantic) {
    const c = await ensureCollection('semantic');
    if (c) {
      const modeId = c.modes[0].modeId;
      for (const [name, def] of Object.entries(ensure.variables.semantic)) {
        if (semanticByName.has(name)) continue;
        const target = primitiveByName.get(def.ref);
        if (!target) { report.warnings.push('semantic ref 대상 primitive 없음: ' + def.ref); continue; }
        if (dryRun) { report.ensured.variables['semantic/' + name] = '(dryRun)'; continue; }
        const v = figma.variables.createVariable(name, c, target.resolvedType);
        v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
        semanticByName.set(name, v);
        report.ensured.variables['semantic/' + name] = v.id;
      }
    }
  }
  if (ensure.textStyles) {
    const existing = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    for (const [name, def] of Object.entries(ensure.textStyles)) {
      if (existing.has(name)) { report.ensured.textStyles[name] = existing.get(name).id; continue; }
      if (dryRun) { report.ensured.textStyles[name] = '(dryRun)'; continue; }
      await figma.loadFontAsync({ family: def.fontFamily, style: def.fontStyle });
      const s = figma.createTextStyle();
      s.name = name;
      s.fontName = { family: def.fontFamily, style: def.fontStyle };
      s.fontSize = def.fontSize;
      if (typeof def.lineHeight === 'number') s.lineHeight = { unit: 'PIXELS', value: def.lineHeight };
      existing.set(name, s);
      report.ensured.textStyles[name] = s.id;
    }
  }

  // ---- 2) Build lookups for the mapping walk --------------------------------
  // colorMap 키는 '#' 없는 6자리 대문자 hex(예: "9CA3AF")로 정규화한다.
  // 스펙 키가 '#' 포함이든 아니든, 3자리 축약이든 모두 6자리로 통일.
  const normHex6 = (s) => {
    let h = String(s).trim().toUpperCase().replace(/^#/, '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return h.slice(0, 6);
  };
  const colorMap = {};
  for (const [k, v] of Object.entries(spec.colorMap || {})) colorMap[normHex6(k)] = v;
  const textStyleMap = spec.textStyleMap || {};
  const textStyleByName = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));

  // ---- Size-based text style assignment (for UNSTYLED text) -----------------
  // textSizeMap: { steps:[10,12,14,...], map:{ "12":{Regular,Medium,SemiBold,Bold}, ... } }
  // Unstyled text gets a style by rounding its fontSize to the nearest step,
  // then picking by weight class. Handles scale-distorted sizes (e.g. 13.6 -> 14).
  const textSizeMap = spec.textSizeMap && spec.textSizeMap.map ? spec.textSizeMap : null;
  // Existing-screen rebind must be non-destructive by default.
  // Size-based assignment can change font size/weight/line-height when a style is applied,
  // so it is allowed only in an explicitly approved typography migration.
  const allowVisualTypographyNormalization = spec.allowVisualTypographyNormalization === true;
  const sizeSteps = textSizeMap && Array.isArray(textSizeMap.steps) && textSizeMap.steps.length
    ? textSizeMap.steps.slice().sort((a, b) => a - b)
    : null;
  function snapSize(x) {
    if (!sizeSteps) return null;
    return sizeSteps.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
  }
  function weightClass(styleStr, weightNum) {
    const s = String(styleStr || '').toLowerCase();
    if (s.includes('black') || (s.includes('bold') && !s.includes('semi'))) return 'Bold';
    if (s.includes('semi')) return 'SemiBold';
    if (s.includes('medium')) return 'Medium';
    if (typeof weightNum === 'number') {
      if (weightNum >= 700) return 'Bold';
      if (weightNum >= 600) return 'SemiBold';
      if (weightNum >= 500) return 'Medium';
    }
    return 'Regular';
  }
  function assignBySize(node) {
    if (!textSizeMap) return null;
    const fs = node.fontSize;
    const fn = node.fontName;
    // Skip mixed-run text; those need manual handling.
    if (fs === figma.mixed || fn === figma.mixed || typeof fs !== 'number') return null;
    const sz = snapSize(fs);
    if (sz == null) return null;
    const row = textSizeMap.map[String(sz)];
    if (!row) return null;
    const wc = weightClass(fn && fn.style, node.fontWeight);
    return row[wc] || row.Regular || null;
  }

  // Metric snapping config. spacingTokens/radiusTokens: [{name:"semantic name", value:number}]
  // Each maps a canonical numeric value to the SEMANTIC variable name to bind.
  const spacingTokens = Array.isArray(spec.spacingTokens) ? spec.spacingTokens.slice().sort((a, b) => a.value - b.value) : [];
  const radiusTokens = Array.isArray(spec.radiusTokens) ? spec.radiusTokens.slice().sort((a, b) => a.value - b.value) : [];
  const maxSnapError = typeof spec.maxSnapError === 'number' ? spec.maxSnapError : 2; // px
  const radiusFullThreshold = typeof spec.radiusFullThreshold === 'number' ? spec.radiusFullThreshold : 48;
  // The semantic name to use for "fully rounded" (pill/circle). Must exist in radiusTokens or semanticByName.
  const radiusFullName = spec.radiusFullName || null;
  const doMetrics = spacingTokens.length > 0 || radiusTokens.length > 0;

  const PAD_PROPS = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'];
  const RADIUS_PROPS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

  function nearestToken(value, tokens) {
    let best = null, bestErr = Infinity;
    for (const t of tokens) {
      const err = Math.abs(t.value - value);
      if (err < bestErr) { bestErr = err; best = t; }
    }
    return best ? { token: best, err: bestErr } : null;
  }

  // hex from a SOLID paint's color+opacity -> "#RRGGBB"
  const paintHex6 = (p) => {
    const to2 = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
    return ('#' + to2(p.color.r) + to2(p.color.g) + to2(p.color.b)).toUpperCase();
  };

  function rebindPaintList(list) {
    // returns { changed:boolean, newList, boundCount }
    if (!Array.isArray(list) || list.length === 0) return { changed: false, newList: list, boundCount: 0 };
    let changed = false, boundCount = 0;
    const out = list.map((p) => {
      if (p.type !== 'SOLID' || p.visible === false) return p;
      // already bound? leave it.
      if (p.boundVariables && p.boundVariables.color) return p;
      const hex6 = paintHex6(p);
      const semName = colorMap[normHex6(hex6)];
      if (!semName) {
        report.unmappedColors[hex6] = (report.unmappedColors[hex6] || 0) + 1;
        return p;
      }
      const v = semanticByName.get(semName);
      if (!v) { report.warnings.push('매핑 대상 semantic 없음: ' + semName); return p; }
      // Preserve opacity (alpha) as paint.opacity; bind base color to the variable.
      const base = { type: 'SOLID', color: { r: p.color.r, g: p.color.g, b: p.color.b }, opacity: p.opacity ?? 1 };
      const bound = figma.variables.setBoundVariableForPaint(base, 'color', v);
      changed = true; boundCount++;
      return bound;
    });
    return { changed, newList: out, boundCount };
  }

  // ---- 3) Walk the page (or selected frames) --------------------------------
  // 대상 선택 우선순위: frameIds(정확) > frameNames(이름, ID보다 안정적) > 페이지 전체.
  // frameNames는 대소문자·공백 무시하고 부분일치가 아닌 정확일치로 매칭한다.
  const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
  let roots;
  if (Array.isArray(spec.frameIds) && spec.frameIds.length) {
    roots = page.children.filter((n) => spec.frameIds.includes(n.id));
  } else if (Array.isArray(spec.frameNames) && spec.frameNames.length) {
    const want = new Set(spec.frameNames.map(norm));
    roots = page.children.filter((n) => want.has(norm(n.name)));
  } else {
    roots = page.children.slice();
  }
  // 대상이 하나도 안 잡히면 경고를 남겨 "조용히 0건" 상황을 즉시 알 수 있게 한다.
  if (!roots.length) {
    report.warnings.push(
      'ROOTS_EMPTY: 지정한 frameIds/frameNames와 일치하는 최상위 프레임이 페이지에 없음. ' +
      'page.children 이름=[' + page.children.map((n) => n.name).join(' | ') + ']'
    );
  }

  const queue = roots.slice();
  const visited = new Set();
  while (queue.length) {
    const n = queue.shift();
    if (!n || visited.has(n.id)) continue;
    visited.add(n.id);
    if (n.visible === false) { /* still descend? skip hidden subtrees */ }
    let touched = false;

    // Fills
    if ('fills' in n && Array.isArray(n.fills)) {
      const r = rebindPaintList(n.fills);
      if (r.changed) {
        if (!dryRun) n.fills = r.newList;
        report.counts.fillsBound += r.boundCount;
        touched = true;
      }
    }
    // Strokes
    if ('strokes' in n && Array.isArray(n.strokes)) {
      const r = rebindPaintList(n.strokes);
      if (r.changed) {
        if (!dryRun) n.strokes = r.newList;
        report.counts.strokesBound += r.boundCount;
        touched = true;
      }
    }
    // Text style swap
    if (n.type === 'TEXT' && typeof n.textStyleId === 'string') {
      let currentName = null;
      if (n.textStyleId) {
        const s = await figma.getStyleByIdAsync(n.textStyleId);
        currentName = s?.name || null;
      }
      let targetName = null;
      if (currentName) {
        // Already styled: name-based swap.
        targetName = textStyleMap[currentName] || null;
      } else if (allowVisualTypographyNormalization && textSizeMap) {
        // Explicit migration mode only: may normalize visual typography.
        targetName = assignBySize(n) || textStyleMap['__unstyled__'] || null;
      } else if (allowVisualTypographyNormalization) {
        targetName = textStyleMap['__unstyled__'] || null;
      } else {
        // Default existing-screen mode: preserve unstyled typography exactly.
        // Report it for manual/explicit migration instead of changing visual hierarchy.
        targetName = null;
      }
      if (targetName && targetName !== currentName) {
        const target = textStyleByName.get(targetName);
        if (!target) report.warnings.push('전환 대상 텍스트 스타일 없음: ' + targetName);
        else {
          if (!dryRun) {
            await figma.loadFontAsync(target.fontName);
            await n.setTextStyleIdAsync(target.id);
          }
          report.counts.textStylesSwapped++;
          touched = true;
        }
      }
    }

    // Metric snapping: padding/itemSpacing -> nearest spacing token; radius -> full or nearest.
    if (doMetrics) {
      // spacing-like props
      if (spacingTokens.length) {
        for (const prop of PAD_PROPS) {
          if (!(prop in n) || typeof n[prop] !== 'number') continue;
          const val = n[prop];
          if (val === 0) continue;                                  // 0 is exempt from binding
          if (n.boundVariables && n.boundVariables[prop]) continue; // already bound
          const near = nearestToken(val, spacingTokens);
          if (!near) continue;
          if (near.err > maxSnapError) {
            const key = prop + '=' + round2(val);
            report.unsnappable[key] = (report.unsnappable[key] || 0) + 1;
            continue;
          }
          const v = semanticByName.get(near.token.name);
          if (!v) { report.warnings.push('스냅 대상 semantic 없음: ' + near.token.name); continue; }
          if (near.err !== 0) report.counts.metricsSnapped++;
          if (!dryRun) {
            n[prop] = near.token.value;
            n.setBoundVariable(prop, v);
          }
          report.counts.metricsBound++;
          touched = true;
        }
      }
      // radius props
      if (radiusTokens.length) {
        for (const prop of RADIUS_PROPS) {
          if (!(prop in n) || typeof n[prop] !== 'number') continue;
          const val = n[prop];
          if (val === 0) continue;
          if (n.boundVariables && (n.boundVariables[prop] || n.boundVariables.cornerRadius)) continue;
          // Fully-rounded values collapse to the "full" token.
          let chosen = null, snapped = false;
          if (radiusFullName && val >= radiusFullThreshold) {
            const full = radiusTokens.find((t) => t.name === radiusFullName);
            if (full) { chosen = full; snapped = full.value !== val; }
          }
          if (!chosen) {
            const near = nearestToken(val, radiusTokens);
            if (!near) continue;
            if (near.err > maxSnapError) {
              const key = prop + '=' + round2(val);
              report.unsnappable[key] = (report.unsnappable[key] || 0) + 1;
              continue;
            }
            chosen = near.token; snapped = near.err !== 0;
          }
          const v = semanticByName.get(chosen.name);
          if (!v) { report.warnings.push('스냅 대상 semantic 없음: ' + chosen.name); continue; }
          if (snapped) report.counts.metricsSnapped++;
          if (!dryRun) {
            n[prop] = chosen.value;
            n.setBoundVariable(prop, v);
          }
          report.counts.metricsBound++;
          touched = true;
        }
      }
    }

    if (touched) report.counts.nodesTouched++;
    if ('children' in n) for (const c of n.children) queue.push(c);
  }

  // Sort unmapped colors desc for readability.
  report.unmappedColors = Object.fromEntries(
    Object.entries(report.unmappedColors).sort((a, b) => b[1] - a[1])
  );
  report.unsnappable = Object.fromEntries(
    Object.entries(report.unsnappable).sort((a, b) => b[1] - a[1])
  );
  return report;
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

// ===========================================================================
// op: "duplicate"
// 기존 노드를 복제(clone)한 뒤 이름·텍스트·fill 등을 패치한다.
//
// spec 형식:
// {
//   "op": "duplicate",
//   "fileKey": "...",
//   "pageName": "design",
//   "items": [
//     {
//       "sourceId": "1:23081",          // 복제 원본 노드 ID
//       "name": "Card-SUBMITTED-DONE",  // 복제본 이름
//       "x": 7600, "y": 392,            // 복제본 배치 위치 (optional)
//       "patches": [
//         {
//           "nodeName": "pill-text",    // 패치 대상 노드 이름 (하위 검색)
//           "characters": "제출완료"    // 텍스트 변경 (TEXT 노드)
//         },
//         {
//           "nodeName": "Status Pill",  // 패치 대상 프레임 이름
//           "fillColor": "#DCFCE7"      // fill 색상 변경 (hex)
//         },
//         {
//           "nodeName": "pill-text",
//           "fillColor": "#10B881"      // 텍스트 색상 변경
//         },
//         {
//           "nodeName": "cta",
//           "characters": "제출 내용 보기 →"
//         }
//       ]
//     }
//   ]
// }
// ===========================================================================
async function runDuplicate(spec) {
  if (!spec.pageName) throw new Error('duplicate 스펙에 pageName 필요');
  if (figma.fileKey && spec.fileKey && figma.fileKey !== spec.fileKey)
    throw new Error('다른 Figma 파일');
  const page = figma.root.children.find((p) => p.name === spec.pageName);
  if (!page) throw new Error('페이지 없음: ' + spec.pageName);
  await figma.setCurrentPageAsync(page);

  const created = {};
  const items = [];
  const requestedItems = Array.isArray(spec.items) ? spec.items : [];
  if (!requestedItems.length) throw new Error('duplicate 스펙에 items 필요');

  for (const item of requestedItems) {
    if (!item.sourceId) throw new Error('sourceId 필요');
    const source = await figma.getNodeByIdAsync(item.sourceId);
    if (!source) throw new Error('sourceId 노드 없음: ' + item.sourceId);

    let clone = null;
    try {
      // Source baseline은 clone 전에 잡는다.
      // path는 node id/name이 아니라 child index 기반이라 clone의 새 ID와 무관하게 비교 가능하다.
      const sourceBefore = await captureCloneVerificationTree(source);

      // Exact Clone. 이후 patch 전까지 구조/레이아웃/바인딩을 재설정하지 않는다.
      clone = source.clone();
      page.appendChild(clone);

      // 1) PATCH 전 exact-clone 검증.
      // root position은 parent가 달라질 수 있어 비교하지 않지만,
      // 트리/타입/크기/layout/constraints/component 연결/style/fill/effect 등은 동일해야 한다.
      const cloneBefore = await captureCloneVerificationTree(clone);
      const prePatchDiffs = compareCloneTrees(sourceBefore, cloneBefore, {
        mode: 'prePatch',
        allowed: new Map(),
      });
      if (prePatchDiffs.length) {
        throw new Error(
          'clone 보존 검증 실패(patch 전): ' +
          summarizeVerificationDiffs(prePatchDiffs)
        );
      }

      const patchPlans = [];
      const patches = Array.isArray(item.patches) ? item.patches : [];

      // Preflight: 모든 patch target을 먼저 확인한다.
      // 기본 정책은 silent skip 금지. 하나라도 0건 매칭이면 이 item 전체를 실패시키고 clone을 롤백한다.
      for (let index = 0; index < patches.length; index++) {
        const patch = patches[index];
        if (!patch || typeof patch.nodeName !== 'string' || !patch.nodeName.trim())
          throw new Error('patch[' + index + '] nodeName 필요');

        const targets = findNodesByName(clone, patch.nodeName);
        const expectedMatches = patch.expectedMatches;

        if (!targets.length)
          throw new Error(
            'patch 대상 노드 없음: ' + patch.nodeName +
            ' (sourceId=' + item.sourceId + ', patchIndex=' + index + ')'
          );

        if (
          expectedMatches !== undefined &&
          (!Number.isInteger(expectedMatches) || expectedMatches < 1)
        ) throw new Error('expectedMatches는 1 이상의 정수여야 함: ' + patch.nodeName);

        if (expectedMatches !== undefined && targets.length !== expectedMatches)
          throw new Error(
            'patch 대상 개수 불일치: ' + patch.nodeName +
            ' expected=' + expectedMatches + ' actual=' + targets.length
          );

        patchPlans.push({ index, patch, targets });
      }

      // patch 전 clone의 path map. patch 허용 필드를 path 단위로 기록한다.
      const clonePathById = buildRelativePathMap(clone);
      const allowedChanges = new Map();
      if (item.name) allowCloneChange(allowedChanges, '0', 'name');

      for (const plan of patchPlans) {
        for (const target of plan.targets) {
          const path = clonePathById.get(target.id);
          if (!path) throw new Error('patch 대상 path 계산 실패: ' + target.id);
          if (plan.patch.rename !== undefined) allowCloneChange(allowedChanges, path, 'name');
          if (plan.patch.visible !== undefined) allowCloneChange(allowedChanges, path, 'visible');
          if (plan.patch.characters !== undefined) allowCloneChange(allowedChanges, path, 'characters');
          if (plan.patch.fillBinding !== undefined || plan.patch.fillColor !== undefined)
            allowCloneChange(allowedChanges, path, 'fills');
        }
      }

      // 이름/위치는 patch target 검증이 끝난 뒤에만 변경한다.
      if (item.name) clone.name = item.name;
      if (typeof item.x === 'number') clone.x = item.x;
      if (typeof item.y === 'number') clone.y = item.y;

      const patchReport = [];

      // Preflight를 통과한 patch만 적용한다.
      for (const plan of patchPlans) {
        const { index, patch, targets } = plan;
        const targetIds = [];

        for (const target of targets) {
          targetIds.push(target.id);

          // 노드 이름 변경 (optional)
          if (patch.rename !== undefined) target.name = patch.rename;

          // 노드 표시/숨김 (optional) — PRD 상태에 없는 요소 제거용
          if (patch.visible !== undefined && 'visible' in target) target.visible = patch.visible;

          // 텍스트 변경 (원본 폰트/스타일 유지, 문자열만 교체)
          if (patch.characters !== undefined) {
            if (target.type !== 'TEXT')
              throw new Error('characters patch 대상이 TEXT가 아님: ' + patch.nodeName + ' (' + target.type + ')');
            if (target.fontName === figma.mixed) {
              const len = target.characters.length;
              for (let i = 0; i < len; i++) await figma.loadFontAsync(target.getRangeFontName(i, i + 1));
            } else {
              await figma.loadFontAsync(target.fontName);
            }
            target.characters = patch.characters;
          }

          // fill을 semantic 토큰에 바인딩 (권장 — harness 규칙 준수)
          if (patch.fillBinding !== undefined) {
            if (!('fills' in target))
              throw new Error('fillBinding patch 대상에 fills 없음: ' + patch.nodeName);
            const v = await resolveSemanticVar(patch.fillBinding);
            if (!v) throw new Error('fillBinding semantic 변수 없음: ' + patch.fillBinding);
            const base = (Array.isArray(target.fills) && target.fills[0] && target.fills[0].type === 'SOLID')
              ? { type: 'SOLID', color: target.fills[0].color, opacity: target.fills[0].opacity ?? 1 }
              : { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 };
            target.fills = [figma.variables.setBoundVariableForPaint(base, 'color', v)];
          }
          // fill 색상 변경 (raw hex, 바인딩 제거) — fillBinding이 없을 때만
          else if (patch.fillColor !== undefined) {
            if (!('fills' in target))
              throw new Error('fillColor patch 대상에 fills 없음: ' + patch.nodeName);
            const color = hexToRgb(patch.fillColor);
            target.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a ?? 1 }];
          }
        }

        patchReport.push({
          patchIndex: index,
          nodeName: patch.nodeName,
          expectedMatches: patch.expectedMatches ?? null,
          matchedCount: targets.length,
          targetIds,
          applied: true,
        });
      }

      // 2) PATCH 후 invariant 검증.
      // 명시적으로 허용한 name/visible/characters/fills 외의 구조적 변화가 있으면 실패한다.
      // width/height는 텍스트 길이 + Auto Layout에 의해 파생 변경될 수 있으므로
      // strict failure에서는 제외하고 geometryChanges로 별도 보고한다.
      const cloneAfter = await captureCloneVerificationTree(clone);
      const postPatchDiffs = compareCloneTrees(sourceBefore, cloneAfter, {
        mode: 'postPatch',
        allowed: allowedChanges,
      });
      const unexpectedChanges = postPatchDiffs.filter((d) => d.category !== 'geometry');
      const geometryChanges = postPatchDiffs.filter((d) => d.category === 'geometry');

      if (unexpectedChanges.length) {
        throw new Error(
          'clone 보존 검증 실패(patch 후): ' +
          summarizeVerificationDiffs(unexpectedChanges)
        );
      }

      const key = item.name || clone.id;
      created[key] = clone.id;
      items.push({
        sourceId: item.sourceId,
        cloneId: clone.id,
        name: clone.name,
        requestedPatchCount: patches.length,
        appliedPatchCount: patchReport.length,
        patches: patchReport,
        verification: {
          prePatch: {
            passed: true,
            comparedNodes: sourceBefore.nodes.length,
            differences: [],
          },
          postPatch: {
            passed: true,
            unexpectedChanges: [],
            geometryChanges,
          },
        },
        success: true,
      });
    } catch (error) {
      // 한 item의 patch/검증이 실패하면 부분 수정된 clone을 남기지 않는다.
      if (clone && !clone.removed) {
        try { clone.remove(); } catch {}
      }
      throw new Error(
        'duplicate item 실패 (sourceId=' + item.sourceId +
        (item.name ? ', name=' + item.name : '') +
        '): ' + error.message
      );
    }
  }

  return {
    op: 'duplicate',
    fileKey: figma.fileKey || spec.fileKey || null,
    created,
    items,
    counts: {
      requestedItems: requestedItems.length,
      createdItems: items.length,
      requestedPatches: items.reduce((sum, item) => sum + item.requestedPatchCount, 0),
      appliedPatches: items.reduce((sum, item) => sum + item.appliedPatchCount, 0),
      verifiedItems: items.filter((item) => item.verification?.prePatch?.passed && item.verification?.postPatch?.passed).length,
    },
  };
}

// ---------------------------------------------------------------------------
// Duplicate verification helpers
// ---------------------------------------------------------------------------

function buildRelativePathMap(root) {
  const map = new Map();
  const queue = [{ node: root, path: '0' }];
  while (queue.length) {
    const { node, path } = queue.shift();
    map.set(node.id, path);
    if ('children' in node) {
      node.children.forEach((child, index) => queue.push({ node: child, path: path + '.' + index }));
    }
  }
  return map;
}

function allowCloneChange(allowed, path, field) {
  if (!allowed.has(path)) allowed.set(path, new Set());
  allowed.get(path).add(field);
}

function cloneValue(value) {
  if (value === figma.mixed) return '__MIXED__';
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(cloneValue);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      const v = value[key];
      if (typeof v === 'function' || v === undefined) continue;
      out[key] = cloneValue(v);
    }
    return out;
  }
  return value;
}

function clonePaints(list) {
  if (!Array.isArray(list)) return '__MIXED__';
  return list.map((p) => ({
    type: p.type,
    visible: p.visible !== false,
    opacity: typeof p.opacity === 'number' ? p.opacity : 1,
    blendMode: p.blendMode || null,
    color: p.type === 'SOLID' ? cloneValue(p.color) : null,
    imageHash: p.type === 'IMAGE' ? p.imageHash || null : null,
    scaleMode: p.type === 'IMAGE' ? p.scaleMode || null : null,
    boundColor: p.boundVariables?.color?.id || null,
  }));
}

function cloneEffects(list) {
  if (!Array.isArray(list)) return '__MIXED__';
  return list.map((e) => ({
    type: e.type,
    visible: e.visible !== false,
    radius: typeof e.radius === 'number' ? e.radius : null,
    spread: typeof e.spread === 'number' ? e.spread : null,
    offset: e.offset ? cloneValue(e.offset) : null,
    color: e.color ? cloneValue(e.color) : null,
    blendMode: e.blendMode || null,
  }));
}

async function cloneComponentRef(node) {
  if (node.type !== 'INSTANCE') return null;
  if (typeof node.getMainComponentAsync === 'function') {
    const main = await node.getMainComponentAsync();
    return main?.id || null;
  }
  return node.mainComponent?.id || null;
}

async function captureCloneVerificationTree(root) {
  const nodes = [];
  const queue = [{ node: root, path: '0' }];

  while (queue.length) {
    const { node, path } = queue.shift();

    const record = {
      path,
      type: node.type,
      name: node.name,
      visible: 'visible' in node ? node.visible : true,
      width: typeof node.width === 'number' ? round2(node.width) : null,
      height: typeof node.height === 'number' ? round2(node.height) : null,
      opacity: typeof node.opacity === 'number' ? node.opacity : null,
      blendMode: 'blendMode' in node ? node.blendMode : null,
      layoutMode: 'layoutMode' in node ? node.layoutMode : null,
      primaryAxisSizingMode: 'primaryAxisSizingMode' in node ? node.primaryAxisSizingMode : null,
      counterAxisSizingMode: 'counterAxisSizingMode' in node ? node.counterAxisSizingMode : null,
      primaryAxisAlignItems: 'primaryAxisAlignItems' in node ? node.primaryAxisAlignItems : null,
      counterAxisAlignItems: 'counterAxisAlignItems' in node ? node.counterAxisAlignItems : null,
      layoutSizingHorizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
      layoutSizingVertical: 'layoutSizingVertical' in node ? node.layoutSizingVertical : null,
      itemSpacing: typeof node.itemSpacing === 'number' ? node.itemSpacing : null,
      paddingTop: typeof node.paddingTop === 'number' ? node.paddingTop : null,
      paddingRight: typeof node.paddingRight === 'number' ? node.paddingRight : null,
      paddingBottom: typeof node.paddingBottom === 'number' ? node.paddingBottom : null,
      paddingLeft: typeof node.paddingLeft === 'number' ? node.paddingLeft : null,
      constraints: 'constraints' in node ? cloneValue(node.constraints) : null,
      clipsContent: 'clipsContent' in node ? node.clipsContent : null,
      cornerRadius: 'cornerRadius' in node ? cloneValue(node.cornerRadius) : null,
      strokeWeight: 'strokeWeight' in node ? cloneValue(node.strokeWeight) : null,
      strokeAlign: 'strokeAlign' in node ? node.strokeAlign : null,
      fills: 'fills' in node ? clonePaints(node.fills) : null,
      strokes: 'strokes' in node ? clonePaints(node.strokes) : null,
      effects: 'effects' in node ? cloneEffects(node.effects) : null,
      fillStyleId: typeof node.fillStyleId === 'string' ? node.fillStyleId : null,
      strokeStyleId: typeof node.strokeStyleId === 'string' ? node.strokeStyleId : null,
      effectStyleId: typeof node.effectStyleId === 'string' ? node.effectStyleId : null,
      textStyleId: typeof node.textStyleId === 'string' ? node.textStyleId : null,
      characters: node.type === 'TEXT' ? node.characters : null,
      fontName: node.type === 'TEXT' ? cloneValue(node.fontName) : null,
      fontSize: node.type === 'TEXT' ? cloneValue(node.fontSize) : null,
      fontWeight: node.type === 'TEXT' ? cloneValue(node.fontWeight) : null,
      lineHeight: node.type === 'TEXT' ? cloneValue(node.lineHeight) : null,
      letterSpacing: node.type === 'TEXT' ? cloneValue(node.letterSpacing) : null,
      textAlignHorizontal: node.type === 'TEXT' ? node.textAlignHorizontal : null,
      textAlignVertical: node.type === 'TEXT' ? node.textAlignVertical : null,
      textAutoResize: node.type === 'TEXT' ? node.textAutoResize : null,
      componentRef: await cloneComponentRef(node),
      componentProperties: node.type === 'INSTANCE' ? cloneValue(node.componentProperties) : null,
      childCount: 'children' in node ? node.children.length : 0,
    };

    nodes.push(record);
    if ('children' in node) {
      node.children.forEach((child, index) => queue.push({ node: child, path: path + '.' + index }));
    }
  }

  return { nodes };
}

function stableCloneValue(value) {
  return JSON.stringify(value);
}

function compareCloneTrees(sourceTree, cloneTree, options) {
  const diffs = [];
  const sourceByPath = new Map(sourceTree.nodes.map((n) => [n.path, n]));
  const cloneByPath = new Map(cloneTree.nodes.map((n) => [n.path, n]));

  const allPaths = new Set([...sourceByPath.keys(), ...cloneByPath.keys()]);
  const geometryFields = new Set(['width', 'height']);

  for (const path of allPaths) {
    const a = sourceByPath.get(path);
    const b = cloneByPath.get(path);

    if (!a || !b) {
      diffs.push({
        path,
        field: 'node',
        category: 'structure',
        source: a ? 'present' : 'missing',
        clone: b ? 'present' : 'missing',
      });
      continue;
    }

    const fields = Object.keys(a).filter((key) => key !== 'path');
    for (const field of fields) {
      const allowed = options.allowed?.get(path);
      if (options.mode === 'postPatch' && allowed?.has(field)) continue;

      // patch 후 geometry는 파생 변화로 별도 보고하고 실패 조건에서는 제외한다.
      const category = geometryFields.has(field) ? 'geometry' : 'invariant';

      if (stableCloneValue(a[field]) !== stableCloneValue(b[field])) {
        diffs.push({
          path,
          field,
          category,
          source: a[field],
          clone: b[field],
        });
      }
    }
  }

  return diffs;
}

function summarizeVerificationDiffs(diffs) {
  return diffs
    .slice(0, 5)
    .map((d) => d.path + '/' + d.field)
    .join(', ') +
    (diffs.length > 5 ? ' 외 ' + (diffs.length - 5) + '건' : '');
}

// 현재 파일의 semantic 변수를 이름으로 찾는다 (컬렉션명 무관, 이름 일치)
async function resolveSemanticVar(name) {
  const vars = await figma.variables.getLocalVariablesAsync();
  return vars.find((v) => v.name === name || v.name === 'semantic/' + name) || null;
}

// 노드 트리에서 이름으로 모든 일치 노드 수집 (DFS)
function findNodesByName(root, name) {
  const result = [];
  const queue = [root];
  while (queue.length) {
    const n = queue.shift();
    if (n.name === name) result.push(n);
    if ('children' in n) queue.push(...n.children);
  }
  return result;
}
