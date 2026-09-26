// Design Flow Harness — Figma plugin main thread (has full Figma API access).
// Reusable: the pasted spec's `op` field selects the action.
//   op: "extract"    -> produce a snapshot JSON identical in schema to scripts/figma/extract-snapshot.js
//   op: "create"     -> build variables/text styles/frames from a declarative spec, return created node IDs
//   op: "screenshot" -> export target frames as base64 PNG for local saving
//   op: "rebind"     -> ensure variables/text styles exist, then walk a page and re-bind
//                       raw hex fills/strokes and text styles to semantic tokens by a mapping table.
//                       Alpha is preserved as paint opacity. Returns a per-node change report.
//   op: "duplicate"  -> exact-clone an existing node, apply strict minimal patches, and verify preservation.
//   op: "update"     -> patch existing nodes in place by exact nodeId, without recreating structure.
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
    else if (spec.op === 'update') result = await runUpdate(spec);
    else throw new Error('알 수 없는 op: ' + spec.op + ' (create/extract/screenshot/rebind/duplicate/update 중 하나)');
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

  function effects(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((e) => e.visible !== false)
      .map((e) => ({
        type: e.type,
        radius: typeof e.radius === 'number' ? e.radius : null,
        spread: typeof e.spread === 'number' ? e.spread : null,
        offset: e.offset ? { x: e.offset.x, y: e.offset.y } : null,
        color: e.color ? rgba(e.color) : null,
        blendMode: e.blendMode || null,
      }));
  }

  async function instanceInfo(node) {
    if (node.type !== 'INSTANCE') return null;
    let mainComponentId = null;
    if (typeof node.getMainComponentAsync === 'function') {
      const main = await node.getMainComponentAsync();
      mainComponentId = main?.id || null;
    } else if ('mainComponent' in node) {
      mainComponentId = node.mainComponent?.id || null;
    }
    return {
      mainComponentId,
      componentProperties: 'componentProperties' in node ? node.componentProperties : null,
      variantProperties: 'variantProperties' in node ? node.variantProperties : null,
    };
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
      const instance = await instanceInfo(n);
      nodes.push({
        id: n.id,
        name: n.name,
        type: n.type,
        parentId,
        bounds: { x: b.x - origin.x, y: b.y - origin.y, width: n.width, height: n.height },
        fills: await paints('fills' in n ? n.fills : []),
        strokes: await paints('strokes' in n ? n.strokes : []),
        effects: effects('effects' in n ? n.effects : []),
        opacity: 'opacity' in n && typeof n.opacity === 'number' ? n.opacity : null,
        blendMode: 'blendMode' in n ? n.blendMode : null,
        strokeWeight: 'strokeWeight' in n && typeof n.strokeWeight === 'number' ? n.strokeWeight : null,
        strokeAlign: 'strokeAlign' in n ? n.strokeAlign : null,
        metrics,
        bindings,
        textStyle: style,
        font,
        text: n.type === 'TEXT'
          ? {
              characters: n.characters,
              autoResize: 'textAutoResize' in n ? n.textAutoResize : null,
              alignHorizontal: 'textAlignHorizontal' in n ? n.textAlignHorizontal : null,
              alignVertical: 'textAlignVertical' in n ? n.textAlignVertical : null,
              letterSpacing: n.letterSpacing && n.letterSpacing !== figma.mixed ? n.letterSpacing : null,
            }
          : null,
        layout: {
          mode: 'layoutMode' in n ? n.layoutMode : 'NONE',
          horizontal: 'layoutSizingHorizontal' in n ? n.layoutSizingHorizontal : null,
          vertical: 'layoutSizingVertical' in n ? n.layoutSizingVertical : null,
          primaryAxisSizingMode: 'primaryAxisSizingMode' in n ? n.primaryAxisSizingMode : null,
          counterAxisSizingMode: 'counterAxisSizingMode' in n ? n.counterAxisSizingMode : null,
          primaryAxisAlignItems: 'primaryAxisAlignItems' in n ? n.primaryAxisAlignItems : null,
          counterAxisAlignItems: 'counterAxisAlignItems' in n ? n.counterAxisAlignItems : null,
          layoutWrap: 'layoutWrap' in n ? n.layoutWrap : null,
        },
        constraints: 'constraints' in n ? n.constraints : null,
        clipsContent: 'clipsContent' in n && n.clipsContent === true,
        scrollable:
          'overflowDirection' in n && ['HORIZONTAL', 'VERTICAL', 'BOTH'].includes(n.overflowDirection),
        instance,
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

  const created = { page: { id: page.id, name: page.name }, collections: {}, variables: {}, textStyles: {}, nodes: {}, instances: {}, clones: {} };
  const reused = { collections: {}, variables: {}, textStyles: {} };
  const varRef = new Map(); // logical name -> Variable

  // 1) Variable collections + primitives + semantic aliases
  // Existing Design System assets are reused when they are identical.
  // Same-name but different definitions fail closed instead of creating duplicates or overwriting.
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionByName = new Map();
  const variableByKey = new Map();

  for (const c of existingCollections) {
    if (collectionByName.has(c.name))
      throw new Error('동일 이름 variable collection 중복: ' + c.name);
    collectionByName.set(c.name, c);

    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) continue;
      const key = c.name + '/' + v.name;
      if (variableByKey.has(key))
        throw new Error('동일 collection 내 variable 이름 중복: ' + key);
      variableByKey.set(key, v);
      if (c.name === 'primitives') varRef.set('primitives/' + v.name, v);
      if (c.name === 'semantic') varRef.set('semantic/' + v.name, v);
    }
  }

  async function ensureCollection(name) {
    let c = collectionByName.get(name);
    if (!c) {
      c = figma.variables.createVariableCollection(name);
      collectionByName.set(name, c);
      created.collections[name] = c.id;
    } else {
      reused.collections[name] = c.id;
    }
    return c;
  }

  function colorClose(a, b) {
    if (!a || !b) return false;
    const aa = typeof a.a === 'number' ? a.a : 1;
    const ba = typeof b.a === 'number' ? b.a : 1;
    return Math.abs(a.r - b.r) < 0.0001 &&
      Math.abs(a.g - b.g) < 0.0001 &&
      Math.abs(a.b - b.b) < 0.0001 &&
      Math.abs(aa - ba) < 0.0001;
  }

  function primitiveMatches(v, type, desired, modeId) {
    if (!v || v.resolvedType !== type) return false;
    const actual = v.valuesByMode?.[modeId];
    if (actual?.type === 'VARIABLE_ALIAS') return false;
    if (type === 'COLOR') return colorClose(actual, desired);
    return typeof actual === 'number' && Math.abs(actual - desired) < 0.0001;
  }

  if (spec.variables?.primitives) {
    const c = await ensureCollection('primitives');
    const modeId = c.modes[0].modeId;

    for (const [name, def] of Object.entries(spec.variables.primitives)) {
      const type = def.type === 'COLOR' ? 'COLOR' : 'FLOAT';
      const desired = type === 'COLOR' ? hexToRgb(def.value) : def.value;
      const key = 'primitives/' + name;
      let v = variableByKey.get(key) || null;

      if (v) {
        if (!primitiveMatches(v, type, desired, modeId))
          throw new Error('기존 primitive와 create 스펙 충돌: ' + key);
        reused.variables[key] = v.id;
      } else {
        v = figma.variables.createVariable(name, c, type);
        v.setValueForMode(modeId, desired);
        if (def.scopes) v.scopes = def.scopes;
        variableByKey.set(key, v);
        created.variables[key] = v.id;
      }

      varRef.set(key, v);
    }
  }

  if (spec.variables?.semantic) {
    const c = await ensureCollection('semantic');
    const modeId = c.modes[0].modeId;

    for (const [name, def] of Object.entries(spec.variables.semantic)) {
      const target = varRef.get('primitives/' + def.ref);
      if (!target) throw new Error('semantic ref 대상 primitive 없음: ' + def.ref);

      const key = 'semantic/' + name;
      let v = variableByKey.get(key) || null;

      if (v) {
        const actual = v.valuesByMode?.[modeId];
        const matches =
          v.resolvedType === target.resolvedType &&
          actual?.type === 'VARIABLE_ALIAS' &&
          actual.id === target.id;
        if (!matches)
          throw new Error('기존 semantic과 create 스펙 충돌: ' + key);
        reused.variables[key] = v.id;
      } else {
        v = figma.variables.createVariable(name, c, target.resolvedType);
        v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
        if (def.scopes) v.scopes = def.scopes;
        variableByKey.set(key, v);
        created.variables[key] = v.id;
      }

      varRef.set(key, v);
    }
  }

  // 2) Text styles — same name + same definition is reused; conflicts fail.
  if (spec.textStyles) {
    const existingTextStyles = new Map();
    for (const s of await figma.getLocalTextStylesAsync()) {
      if (existingTextStyles.has(s.name))
        throw new Error('동일 이름 text style 중복: ' + s.name);
      existingTextStyles.set(s.name, s);
    }

    for (const [name, def] of Object.entries(spec.textStyles)) {
      const current = existingTextStyles.get(name);

      if (current) {
        const currentLineHeight =
          current.lineHeight?.unit === 'PIXELS' ? current.lineHeight.value :
          current.lineHeight?.unit === 'PERCENT' ? (current.fontSize * current.lineHeight.value) / 100 :
          null;
        const desiredLineHeight = typeof def.lineHeight === 'number' ? def.lineHeight : null;
        const same =
          current.fontName?.family === def.fontFamily &&
          current.fontName?.style === def.fontStyle &&
          current.fontSize === def.fontSize &&
          (
            desiredLineHeight === null
              ? currentLineHeight === null
              : typeof currentLineHeight === 'number' && Math.abs(currentLineHeight - desiredLineHeight) < 0.01
          );

        if (!same)
          throw new Error('기존 text style과 create 스펙 충돌: ' + name);

        reused.textStyles[name] = current.id;
        continue;
      }

      await figma.loadFontAsync({ family: def.fontFamily, style: def.fontStyle });
      const s = figma.createTextStyle();
      s.name = name;
      s.fontName = { family: def.fontFamily, style: def.fontStyle };
      s.fontSize = def.fontSize;
      if (typeof def.lineHeight === 'number') s.lineHeight = { unit: 'PIXELS', value: def.lineHeight };
      existingTextStyles.set(name, s);
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

  async function resolveInstanceComponent(node) {
    if (!node.componentNodeId)
      throw new Error('INSTANCE에 componentNodeId 필요: ' + (node.name || node.key || '(unnamed)'));

    const source = await figma.getNodeByIdAsync(node.componentNodeId);
    if (!source)
      throw new Error('componentNodeId 노드 없음: ' + node.componentNodeId);

    if (source.type === 'COMPONENT') return source;

    if (source.type !== 'COMPONENT_SET')
      throw new Error('componentNodeId는 COMPONENT 또는 COMPONENT_SET이어야 함: ' + node.componentNodeId + ' (' + source.type + ')');

    const variants = source.children.filter((child) => child.type === 'COMPONENT');
    if (!variants.length)
      throw new Error('COMPONENT_SET에 variant COMPONENT가 없음: ' + node.componentNodeId);

    if (node.variantName) {
      const exact = variants.filter((child) => child.name === node.variantName);
      if (exact.length !== 1)
        throw new Error(
          'variantName 매칭 실패/중복: ' + node.variantName +
          ' actual=' + exact.length + ' componentSet=' + node.componentNodeId
        );
      return exact[0];
    }

    if (node.variantProperties && typeof node.variantProperties === 'object') {
      const entries = Object.entries(node.variantProperties);
      if (!entries.length)
        throw new Error('variantProperties는 최소 1개 속성이 필요: ' + node.componentNodeId);

      const matched = variants.filter((child) => {
        const props = child.variantProperties || {};
        return entries.every(([key, value]) => String(props[key]) === String(value));
      });

      if (matched.length !== 1)
        throw new Error(
          'variantProperties 매칭 실패/중복: componentSet=' + node.componentNodeId +
          ' actual=' + matched.length +
          ' requested=' + JSON.stringify(node.variantProperties)
        );
      return matched[0];
    }

    if (variants.length === 1) return variants[0];

    throw new Error(
      'COMPONENT_SET instance 생성에는 variantName 또는 variantProperties 필요: ' +
      node.componentNodeId + ' variants=' + variants.length
    );
  }

  async function applyInstancePatches(instance, sourceComponent, patches) {
    if (!Array.isArray(patches) || !patches.length) return [];

    const sourcePathById = buildRelativePathMap(sourceComponent);
    const instancePathById = buildRelativePathMap(instance);
    const instanceNodeByPath = new Map();
    for (const [instanceNodeId, path] of instancePathById) {
      const target = findNodeByIdInTree(instance, instanceNodeId);
      if (target) instanceNodeByPath.set(path, target);
    }

    const report = [];
    for (let index = 0; index < patches.length; index++) {
      const patch = patches[index];
      const hasNodeName = patch && typeof patch.nodeName === 'string' && patch.nodeName.trim();
      const hasSourceNodeId = patch && typeof patch.sourceNodeId === 'string' && patch.sourceNodeId.trim();
      if (!hasNodeName && !hasSourceNodeId)
        throw new Error('INSTANCE patch[' + index + '] nodeName 또는 sourceNodeId 필요');
      if (hasNodeName && hasSourceNodeId)
        throw new Error('INSTANCE patch[' + index + '] nodeName/sourceNodeId 동시 지정 금지');
      if (patch.fillBinding !== undefined || patch.fillColor !== undefined ||
          patch.variantProperties !== undefined || patch.componentProperties !== undefined)
        throw new Error('INSTANCE child patch에서 visual/state 직접 변경 금지. variantProperties/componentProperties는 INSTANCE 상위 필드로 사용');

      let targets;
      let selectorLabel;
      if (hasSourceNodeId) {
        const sourcePath = sourcePathById.get(patch.sourceNodeId);
        if (!sourcePath)
          throw new Error('INSTANCE patch sourceNodeId가 resolved component subtree에 없음: ' + patch.sourceNodeId);
        const target = instanceNodeByPath.get(sourcePath);
        if (!target)
          throw new Error('INSTANCE patch sourceNodeId 대응 instance path 없음: ' + patch.sourceNodeId);
        targets = [target];
        selectorLabel = 'sourceNodeId=' + patch.sourceNodeId;
      } else {
        targets = findNodesByName(instance, patch.nodeName);
        selectorLabel = 'nodeName=' + patch.nodeName;
      }

      if (!targets.length)
        throw new Error('INSTANCE patch 대상 노드 없음: ' + selectorLabel);

      if (patch.expectedMatches !== undefined &&
          (!Number.isInteger(patch.expectedMatches) || patch.expectedMatches < 1))
        throw new Error('INSTANCE patch expectedMatches는 1 이상의 정수: ' + selectorLabel);

      if (patch.expectedMatches !== undefined && targets.length !== patch.expectedMatches)
        throw new Error(
          'INSTANCE patch 대상 개수 불일치: ' + selectorLabel +
          ' expected=' + patch.expectedMatches + ' actual=' + targets.length
        );

      const targetIds = [];
      for (const target of targets) {
        targetIds.push(target.id);
        if (patch.characters !== undefined) {
          if (target.type !== 'TEXT')
            throw new Error('INSTANCE characters patch 대상이 TEXT가 아님: ' + selectorLabel);
          if (target.fontName === figma.mixed) {
            const segments = target.getStyledTextSegments(['fontName']);
            const seen = new Set();
            for (const seg of segments) {
              const key = seg.fontName.family + '::' + seg.fontName.style;
              if (!seen.has(key)) {
                await figma.loadFontAsync(seg.fontName);
                seen.add(key);
              }
            }
          } else {
            await figma.loadFontAsync(target.fontName);
          }
          target.characters = patch.characters;
        }
        if (patch.rename !== undefined) target.name = patch.rename;
        if (patch.visible !== undefined && 'visible' in target) target.visible = patch.visible;
      }

      report.push({
        index,
        selector: selectorLabel,
        matchedCount: targets.length,
        targetIds,
        applied: true,
      });
    }
    return report;
  }

  async function build(node, parent) {
    let n;
    let instanceSource = null;
    let cloneBuildResult = null;
    let cloneBeforeAttach = null;
    switch (node.type) {
      case 'FRAME': n = figma.createFrame(); break;
      case 'TEXT': n = figma.createText(); break;
      case 'RECTANGLE': n = figma.createRectangle(); break;
      case 'ELLIPSE': n = figma.createEllipse(); break;
      case 'LINE': n = figma.createLine(); break;
      case 'COMPONENT': n = figma.createComponent(); break;
      case 'INSTANCE':
        if ((node.children || []).length)
          throw new Error('INSTANCE는 children을 직접 생성하지 않음. componentProperties를 사용: ' + (node.name || node.key || node.componentNodeId));
        if (node.fills || node.strokes || node.metrics)
          throw new Error('INSTANCE visual을 직접 재구성하지 않음. 기존 component를 그대로 재사용: ' + (node.name || node.key || node.componentNodeId));
        instanceSource = await resolveInstanceComponent(node);
        n = instanceSource.createInstance();
        break;
      case 'CLONE': {
        if (!node.sourceNodeId)
          throw new Error('CLONE에 sourceNodeId 필요: ' + (node.name || node.key || '(unnamed)'));
        if ((node.children || []).length)
          throw new Error('CLONE은 원본 children을 그대로 보존함. children 직접 생성 금지: ' + node.sourceNodeId);
        if (node.fills || node.strokes || node.metrics)
          throw new Error('CLONE visual을 직접 재구성하지 않음. patches만 사용: ' + node.sourceNodeId);
        const sourceNode = await figma.getNodeByIdAsync(node.sourceNodeId);
        if (!sourceNode)
          throw new Error('sourceNodeId 노드 없음: ' + node.sourceNodeId);
        cloneBuildResult = await cloneAndPatchNode(sourceNode, {
          name: node.name || null,
          patches: node.patches || [],
        });
        n = cloneBuildResult.clone;
        // Composition parent로 이동하기 전 baseline. 이후 reparent가 구조/style을 바꾸지 않는지 다시 확인한다.
        cloneBeforeAttach = await captureCloneVerificationTree(n);
        break;
      }
      default: throw new Error('지원하지 않는 노드 타입: ' + node.type);
    }
    if (node.name) n.name = node.name;
    // Attach to parent BEFORE sizing so auto-layout sizing applies correctly.
    if (parent) parent.appendChild(n);
    else page.appendChild(n);

    if (node.type === 'CLONE') {
      // 새 parent로 reparent한 뒤에도 구조/style invariant가 보존되는지 확인한다.
      const cloneAfterAttach = await captureCloneVerificationTree(n);
      const compositionDiffs = compareCloneTrees(cloneBeforeAttach, cloneAfterAttach, {
        mode: 'postPatch',
        allowed: new Map(),
      });
      const compositionUnexpected = compositionDiffs.filter((d) => d.category !== 'geometry');
      const compositionGeometry = compositionDiffs.filter((d) => d.category === 'geometry');

      if (compositionUnexpected.length) {
        try { n.remove(); } catch {}
        throw new Error(
          'CLONE compose 보존 검증 실패(reparent 후): ' +
          summarizeVerificationDiffs(compositionUnexpected)
        );
      }

      const cloneKey = node.key || node.name || n.id;
      created.clones[cloneKey] = {
        id: n.id,
        sourceNodeId: node.sourceNodeId,
        patches: cloneBuildResult?.patchReport || [],
        verification: {
          ...(cloneBuildResult?.verification || {}),
          composition: {
            passed: true,
            unexpectedChanges: [],
            geometryChanges: compositionGeometry,
          },
        },
      };
    }

    if (node.type === 'INSTANCE') {
      if (node.componentProperties !== undefined) {
        if (!node.componentProperties || typeof node.componentProperties !== 'object' || Array.isArray(node.componentProperties))
          throw new Error('componentProperties는 객체여야 함: ' + (node.name || node.key || node.componentNodeId));
        if (typeof n.setProperties !== 'function')
          throw new Error('INSTANCE setProperties 미지원: ' + n.id);
        n.setProperties(node.componentProperties);
      }
      const instancePatchReport = await applyInstancePatches(n, instanceSource, node.patches || []);
      const instanceKey = node.key || node.name || n.id;
      created.instances[instanceKey] = {
        id: n.id,
        componentNodeId: node.componentNodeId,
        resolvedComponentId: instanceSource?.id || null,
        resolvedComponentName: instanceSource?.name || null,
        componentSetId: instanceSource?.parent?.type === 'COMPONENT_SET' ? instanceSource.parent.id : null,
        requestedVariantName: node.variantName || null,
        requestedVariantProperties: node.variantProperties || null,
        appliedComponentProperties: node.componentProperties || null,
        patches: instancePatchReport,
      };
    }

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

    // Auto layout / visual construction rules.
    // CLONE은 exact source geometry/layout/style을 보존하고 generic create 속성으로 재설정하지 않는다.
    if (node.type !== 'CLONE') {
      if (node.layout && 'layoutMode' in n) {
        n.layoutMode = node.layout.mode || 'NONE';
        if (node.layout.mode && node.layout.mode !== 'NONE') {
          if (node.layout.primaryAxisSizingMode) n.primaryAxisSizingMode = node.layout.primaryAxisSizingMode;
          if (node.layout.counterAxisSizingMode) n.counterAxisSizingMode = node.layout.counterAxisSizingMode;
        }
      }

      // Size (before HUG/FILL constraints)
      // INSTANCE는 명시적으로 allowResize:true인 경우만 resize한다. 기본은 component geometry 보존.
      if (typeof node.width === 'number' && typeof node.height === 'number') {
        if (node.type === 'INSTANCE' && node.allowResize !== true)
          throw new Error('INSTANCE width/height 직접 resize 금지. 필요하면 allowResize:true를 명시: ' + (node.name || node.key || n.id));
        n.resize(node.width, node.height);
      }

      if (node.fills) n.fills = node.fills.map((p) => paintFrom(p, semanticByName, imageHashes));
      if (node.strokes) n.strokes = node.strokes.map((p) => paintFrom(p, semanticByName, imageHashes));
      applyMetrics(n, node.metrics, node.bindings, semanticByName);
    } else if (typeof node.width === 'number' || typeof node.height === 'number' || node.layout) {
      throw new Error('CLONE geometry/layout 직접 재설정 금지. 원본 패턴 geometry를 보존: ' + node.sourceNodeId);
    }

    // clip / scroll
    if (node.type === 'CLONE' && (node.clipsContent !== undefined || node.overflowDirection !== undefined))
      throw new Error('CLONE clip/scroll 직접 재설정 금지. 원본 패턴을 보존: ' + node.sourceNodeId);
    if (node.type !== 'CLONE') {
      if (typeof node.clipsContent === 'boolean' && 'clipsContent' in n) n.clipsContent = node.clipsContent;
      if (node.overflowDirection && 'overflowDirection' in n) n.overflowDirection = node.overflowDirection;
    }

    // Sizing constraints (HUG/FILL) after append
    if (node.type !== 'CLONE') {
      if (node.layoutSizingVertical && 'layoutSizingVertical' in n) n.layoutSizingVertical = node.layoutSizingVertical;
      if (node.layoutSizingHorizontal && 'layoutSizingHorizontal' in n) n.layoutSizingHorizontal = node.layoutSizingHorizontal;
    }

    // Metadata (shared plugin data)
    if (node.metadata) n.setSharedPluginData('designHarness', 'metadata', JSON.stringify(node.metadata));

    if (node.key) created.nodes[node.key] = n.id;

    if (node.type !== 'CLONE') {
      for (const child of node.children || []) await build(child, n);
    }
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
    reused,
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
async function cloneAndPatchNode(source, options = {}) {
  if (!source || typeof source.clone !== 'function')
    throw new Error('clone 가능한 source 노드 필요');

  let clone = null;
  try {
    const sourceBefore = await captureCloneVerificationTree(source);

    clone = source.clone();

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

    const patches = Array.isArray(options.patches) ? options.patches : [];
    const patchPlans = [];
    const sourcePathById = buildRelativePathMap(source);
    const clonePathByNodeId = buildRelativePathMap(clone);
    const cloneNodeByPath = new Map();
    for (const [cloneNodeId, path] of clonePathByNodeId) {
      const target = findNodeByIdInTree(clone, cloneNodeId);
      if (target) cloneNodeByPath.set(path, target);
    }

    for (let index = 0; index < patches.length; index++) {
      const patch = patches[index];
      const hasNodeName = patch && typeof patch.nodeName === 'string' && patch.nodeName.trim();
      const hasSourceNodeId = patch && typeof patch.sourceNodeId === 'string' && patch.sourceNodeId.trim();
      if (!hasNodeName && !hasSourceNodeId)
        throw new Error('patch[' + index + '] nodeName 또는 sourceNodeId 필요');
      if (hasNodeName && hasSourceNodeId)
        throw new Error('patch[' + index + '] nodeName/sourceNodeId 동시 지정 금지');

      let targets;
      let selectorLabel;
      if (hasSourceNodeId) {
        const sourcePath = sourcePathById.get(patch.sourceNodeId);
        if (!sourcePath)
          throw new Error(
            'patch sourceNodeId가 source subtree에 없음: ' + patch.sourceNodeId +
            ' (sourceId=' + source.id + ', patchIndex=' + index + ')'
          );
        const target = cloneNodeByPath.get(sourcePath);
        if (!target)
          throw new Error('patch sourceNodeId 대응 clone path 없음: ' + patch.sourceNodeId);
        targets = [target];
        selectorLabel = 'sourceNodeId=' + patch.sourceNodeId;
      } else {
        targets = findNodesByName(clone, patch.nodeName);
        selectorLabel = 'nodeName=' + patch.nodeName;
      }

      const expectedMatches = patch.expectedMatches;

      if (!targets.length)
        throw new Error(
          'patch 대상 노드 없음: ' + selectorLabel +
          ' (sourceId=' + source.id + ', patchIndex=' + index + ')'
        );

      if (
        expectedMatches !== undefined &&
        (!Number.isInteger(expectedMatches) || expectedMatches < 1)
      ) throw new Error('expectedMatches는 1 이상의 정수여야 함: ' + selectorLabel);

      if (expectedMatches !== undefined && targets.length !== expectedMatches)
        throw new Error(
          'patch 대상 개수 불일치: ' + selectorLabel +
          ' expected=' + expectedMatches + ' actual=' + targets.length
        );

      patchPlans.push({ index, patch, targets });
    }

    const clonePathById = buildRelativePathMap(clone);
    const allowedChanges = new Map();
    const allowedSubtrees = [];
    if (options.name) allowCloneChange(allowedChanges, '0', 'name');

    for (const plan of patchPlans) {
      for (const target of plan.targets) {
        const path = clonePathById.get(target.id);
        if (!path) throw new Error('patch 대상 path 계산 실패: ' + target.id);
        if (plan.patch.rename !== undefined) allowCloneChange(allowedChanges, path, 'name');
        if (plan.patch.visible !== undefined) allowCloneChange(allowedChanges, path, 'visible');
        if (plan.patch.characters !== undefined) allowCloneChange(allowedChanges, path, 'characters');
        if (plan.patch.fillBinding !== undefined || plan.patch.fillColor !== undefined)
          allowCloneChange(allowedChanges, path, 'fills');
        // variant/componentProperties 전환은 인스턴스 자신과 그 하위 노드의
        // 스타일/구조/텍스트를 통째로 바꾼다(디자인시스템 정의를 따름). 따라서 해당
        // 인스턴스 subtree 전체 변경을 보존 검증에서 허용한다. 색을 수동 지정하지 않고
        // 컴포넌트 정의를 따르게 하는 것이 목적이므로 이는 의도된 변경이다.
        if (plan.patch.variantProperties !== undefined || plan.patch.componentProperties !== undefined) {
          allowedSubtrees.push(path);
        }
      }
    }

    if (options.name) clone.name = options.name;

    const patchReport = [];
    for (const plan of patchPlans) {
      const { index, patch, targets } = plan;
      const targetIds = [];

      for (const target of targets) {
        targetIds.push(target.id);

        if (patch.rename !== undefined) target.name = patch.rename;
        if (patch.visible !== undefined && 'visible' in target) target.visible = patch.visible;

        if (patch.characters !== undefined) {
          if (target.type !== 'TEXT')
            throw new Error('characters patch 대상이 TEXT가 아님: ' + patch.nodeName + ' (' + target.type + ')');
          if (target.fontName === figma.mixed) {
            const len = target.characters.length;
            for (let i = 0; i < len; i++)
              await figma.loadFontAsync(target.getRangeFontName(i, i + 1));
          } else {
            await figma.loadFontAsync(target.fontName);
          }
          target.characters = patch.characters;
        }

        if (patch.fillBinding !== undefined) {
          if (!('fills' in target))
            throw new Error('fillBinding patch 대상에 fills 없음: ' + patch.nodeName);
          const v = await resolveSemanticVar(patch.fillBinding);
          if (!v) throw new Error('fillBinding semantic 변수 없음: ' + patch.fillBinding);
          const base =
            (Array.isArray(target.fills) && target.fills[0] && target.fills[0].type === 'SOLID')
              ? {
                  type: 'SOLID',
                  color: target.fills[0].color,
                  opacity: target.fills[0].opacity ?? 1,
                }
              : {
                  type: 'SOLID',
                  color: { r: 0, g: 0, b: 0 },
                  opacity: 1,
                };
          target.fills = [figma.variables.setBoundVariableForPaint(base, 'color', v)];
        } else if (patch.fillColor !== undefined) {
          if (!('fills' in target))
            throw new Error('fillColor patch 대상에 fills 없음: ' + patch.nodeName);
          const color = hexToRgb(patch.fillColor);
          target.fills = [{
            type: 'SOLID',
            color: { r: color.r, g: color.g, b: color.b },
            opacity: color.a ?? 1,
          }];
        }

        // variant/componentProperties 전환: 상태색(disabled/hover 등)은 수동으로 칠하지
        // 않고 컴포넌트 정의를 따르도록 한다. INSTANCE에만 적용 가능.
        const props = patch.variantProperties !== undefined ? patch.variantProperties : patch.componentProperties;
        if (props !== undefined) {
          if (target.type !== 'INSTANCE')
            throw new Error('variantProperties/componentProperties patch 대상이 INSTANCE가 아님: ' + (patch.sourceNodeId || patch.nodeName) + ' (' + target.type + ')');
          if (!props || typeof props !== 'object' || Array.isArray(props))
            throw new Error('variantProperties/componentProperties는 객체여야 함: ' + (patch.sourceNodeId || patch.nodeName));
          if (typeof target.setProperties !== 'function')
            throw new Error('INSTANCE setProperties 미지원: ' + target.id);
          target.setProperties(props);
        }
      }

      patchReport.push({
        patchIndex: index,
        nodeName: patch.nodeName || null,
        sourceNodeId: patch.sourceNodeId || null,
        expectedMatches: patch.expectedMatches ?? null,
        matchedCount: targets.length,
        targetIds,
        applied: true,
      });
    }

    const cloneAfter = await captureCloneVerificationTree(clone);
    const postPatchDiffs = compareCloneTrees(sourceBefore, cloneAfter, {
      mode: 'postPatch',
      allowed: allowedChanges,
      allowedSubtrees,
    });
    const unexpectedChanges = postPatchDiffs.filter((d) => d.category !== 'geometry');
    const geometryChanges = postPatchDiffs.filter((d) => d.category === 'geometry');

    if (unexpectedChanges.length) {
      throw new Error(
        'clone 보존 검증 실패(patch 후): ' +
        summarizeVerificationDiffs(unexpectedChanges)
      );
    }

    return {
      clone,
      patchReport,
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
    };
  } catch (error) {
    if (clone && !clone.removed) {
      try { clone.remove(); } catch {}
    }
    throw error;
  }
}

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
      const cloned = await cloneAndPatchNode(source, {
        name: item.name || null,
        patches: item.patches || [],
      });
      clone = cloned.clone;

      // destination page로 이동하기 전 baseline.
      const beforeAttach = await captureCloneVerificationTree(clone);
      page.appendChild(clone);

      // reparent 후에도 구조/style invariant는 동일해야 한다.
      const afterAttach = await captureCloneVerificationTree(clone);
      const compositionDiffs = compareCloneTrees(beforeAttach, afterAttach, {
        mode: 'postPatch',
        allowed: new Map(),
      });
      const compositionUnexpected = compositionDiffs.filter((d) => d.category !== 'geometry');
      const compositionGeometry = compositionDiffs.filter((d) => d.category === 'geometry');

      if (compositionUnexpected.length) {
        throw new Error(
          'duplicate compose 보존 검증 실패(reparent 후): ' +
          summarizeVerificationDiffs(compositionUnexpected)
        );
      }

      if (typeof item.x === 'number') clone.x = item.x;
      if (typeof item.y === 'number') clone.y = item.y;

      const key = item.name || clone.id;
      created[key] = clone.id;
      items.push({
        sourceId: item.sourceId,
        cloneId: clone.id,
        name: clone.name,
        requestedPatchCount: Array.isArray(item.patches) ? item.patches.length : 0,
        appliedPatchCount: cloned.patchReport.length,
        patches: cloned.patchReport,
        verification: {
          ...cloned.verification,
          composition: {
            passed: true,
            unexpectedChanges: [],
            geometryChanges: compositionGeometry,
          },
        },
        success: true,
      });
    } catch (error) {
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
      verifiedItems: items.filter(
        (item) =>
          item.verification?.prePatch?.passed &&
          item.verification?.postPatch?.passed &&
          item.verification?.composition?.passed
      ).length,
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
  const allowedSubtrees = Array.isArray(options.allowedSubtrees) ? options.allowedSubtrees : [];
  // path가 허용된 subtree 루트 자신이거나 그 하위인지 검사한다.
  const inAllowedSubtree = (path) =>
    allowedSubtrees.some((root) => path === root || path.startsWith(root + '.'));

  for (const path of allPaths) {
    // variant/componentProperties 전환이 적용된 인스턴스 subtree는 컴포넌트 정의를
    // 따르는 의도된 변경이므로 postPatch 검증에서 통째로 제외한다.
    if (options.mode === 'postPatch' && inAllowedSubtree(path)) continue;

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

function findNodeByIdInTree(root, id) {
  const queue = [root];
  while (queue.length) {
    const n = queue.shift();
    if (n.id === id) return n;
    if ('children' in n) queue.push(...n.children);
  }
  return null;
}


// ===========================================================================
// op: "update"
// 기존 노드 구조를 유지한 채 exact nodeId로 최소 patch한다.
// PRD 노트/고정 화면처럼 clone이 불필요하고 기존 노드 자체가 canonical인 경우 사용.
// ===========================================================================
async function runUpdate(spec) {
  if (!spec.pageName) throw new Error('update 스펙에 pageName 필요');
  if (figma.fileKey && spec.fileKey && figma.fileKey !== spec.fileKey)
    throw new Error('다른 Figma 파일');

  const page = figma.root.children.find((p) => p.name === spec.pageName);
  if (!page) throw new Error('페이지 없음: ' + spec.pageName);
  await figma.setCurrentPageAsync(page);

  const root = spec.rootId ? await figma.getNodeByIdAsync(spec.rootId) : page;
  if (!root) throw new Error('update rootId 노드 없음: ' + spec.rootId);

  const isInsideRoot = (node) => {
    if (!node) return false;
    if (node.id === root.id) return true;
    let p = node.parent;
    while (p) {
      if (p.id === root.id) return true;
      p = p.parent;
    }
    return false;
  };

  const changed = [];
  for (let index = 0; index < (spec.patches || []).length; index++) {
    const patch = spec.patches[index];
    if (!patch || typeof patch.nodeId !== 'string' || !patch.nodeId.trim())
      throw new Error('update patch[' + index + '] nodeId 필요');

    const target = await figma.getNodeByIdAsync(patch.nodeId);
    if (!target) throw new Error('update 대상 노드 없음: ' + patch.nodeId);
    if (!isInsideRoot(target))
      throw new Error('update 대상이 root subtree 밖임: ' + patch.nodeId + ' root=' + root.id);

    if (patch.expectedType && target.type !== patch.expectedType)
      throw new Error(
        'update 대상 type 불일치: ' + patch.nodeId +
        ' expected=' + patch.expectedType + ' actual=' + target.type
      );
    if (patch.expectedName && target.name !== patch.expectedName)
      throw new Error(
        'update 대상 name 불일치: ' + patch.nodeId +
        ' expected=' + patch.expectedName + ' actual=' + target.name
      );
    if (
      patch.expectedCharacters !== undefined &&
      (!('characters' in target) || target.characters !== patch.expectedCharacters)
    ) throw new Error('update 대상 원문 불일치: ' + patch.nodeId);

    const fields = [];

    if (patch.characters !== undefined) {
      if (target.type !== 'TEXT')
        throw new Error('characters update 대상이 TEXT가 아님: ' + patch.nodeId + ' (' + target.type + ')');
      if (target.fontName === figma.mixed) {
        const segments = target.getStyledTextSegments(['fontName']);
        const seen = new Set();
        for (const seg of segments) {
          const key = seg.fontName.family + '::' + seg.fontName.style;
          if (!seen.has(key)) {
            await figma.loadFontAsync(seg.fontName);
            seen.add(key);
          }
        }
      } else {
        await figma.loadFontAsync(target.fontName);
      }
      target.characters = patch.characters;
      fields.push('characters');
    }

    if (patch.rename !== undefined) {
      target.name = patch.rename;
      fields.push('name');
    }

    if (patch.visible !== undefined) {
      if (!('visible' in target)) throw new Error('visible update 불가: ' + patch.nodeId);
      target.visible = patch.visible;
      fields.push('visible');
    }

    if (patch.width !== undefined || patch.height !== undefined) {
      if (!('resize' in target)) throw new Error('resize update 불가: ' + patch.nodeId);
      const nextWidth = patch.width !== undefined ? patch.width : target.width;
      const nextHeight = patch.height !== undefined ? patch.height : target.height;
      target.resize(nextWidth, nextHeight);
      if (patch.width !== undefined) fields.push('width');
      if (patch.height !== undefined) fields.push('height');
    }

    if (patch.fillBinding !== undefined) {
      if (!('fills' in target)) throw new Error('fillBinding update 대상에 fills 없음: ' + patch.nodeId);
      const v = await resolveSemanticVar(patch.fillBinding);
      if (!v) throw new Error('fillBinding semantic 변수 없음: ' + patch.fillBinding);
      const base =
        (Array.isArray(target.fills) && target.fills[0] && target.fills[0].type === 'SOLID')
          ? { type: 'SOLID', color: target.fills[0].color, opacity: target.fills[0].opacity ?? 1 }
          : { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 };
      target.fills = [figma.variables.setBoundVariableForPaint(base, 'color', v)];
      fields.push('fills');
    } else if (patch.fillColor !== undefined) {
      if (!('fills' in target)) throw new Error('fillColor update 대상에 fills 없음: ' + patch.nodeId);
      const color = hexToRgb(patch.fillColor);
      target.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a ?? 1 }];
      fields.push('fills');
    }

    changed.push({ nodeId: target.id, name: target.name, type: target.type, fields });
  }

  let rootResize = null;
  if (spec.fitRootHeightToContents === true) {
    if (!('children' in root) || !('resize' in root))
      throw new Error('fitRootHeightToContents는 children/resize 가능한 root에만 사용 가능');
    let maxBottom = 0;
    for (const child of root.children) {
      maxBottom = Math.max(maxBottom, child.y + child.height);
    }
    const paddingBottom = typeof root.paddingBottom === 'number' ? root.paddingBottom : 0;
    const nextHeight = Math.ceil(maxBottom + paddingBottom);
    const before = { width: root.width, height: root.height };
    root.resize(root.width, nextHeight);
    rootResize = { before, after: { width: root.width, height: root.height } };
  }

  return {
    op: 'update',
    fileKey: figma.fileKey || spec.fileKey || null,
    rootId: root.id,
    changed,
    rootResize,
  };
}
