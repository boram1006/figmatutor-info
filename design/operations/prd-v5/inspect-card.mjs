import { readFileSync } from 'node:fs';
const s = JSON.parse(readFileSync(new URL('../rebind-v5/snapshot-v5.json', import.meta.url)));
const nodes = s.frames[0].nodes || [];
const byId = new Map(nodes.map((n) => [n.id, n]));

function dump(id, depth) {
  const n = byId.get(id);
  if (!n) return;
  const kids = nodes.filter((x) => x.parentId === id);
  const fill = (n.fills || []).map((p) => (p.binding ? p.binding.name : (p.color || p.type))).join(',');
  const m = n.metrics || {};
  const pad = [m.paddingTop, m.paddingRight, m.paddingBottom, m.paddingLeft].some((v) => v != null)
    ? 'pad[' + [m.paddingTop, m.paddingRight, m.paddingBottom, m.paddingLeft].join('/') + ']' : '';
  const gap = m.itemSpacing != null ? 'gap' + m.itemSpacing : '';
  const rad = m.topLeftRadius != null ? 'r' + m.topLeftRadius : '';
  const al = n.layout && n.layout.mode !== 'NONE' ? 'AL:' + n.layout.mode : '';
  const txt = n.type === 'TEXT' ? ' "' + (n.name || '').slice(0, 24) + '"' : '';
  const ts = n.textStyle ? ' TS=' + n.textStyle : '';
  const size = '[' + Math.round(n.bounds.width) + 'x' + Math.round(n.bounds.height) + ']';
  console.log('  '.repeat(depth) + [n.type, n.name || '', size, al, pad, gap, rad, fill ? 'fill=' + fill : '', ts, txt].filter(Boolean).join(' '));
  for (const k of kids) dump(k.id, depth + 1);
}

const target = process.argv[2] || '1:23081';
dump(target, 0);
