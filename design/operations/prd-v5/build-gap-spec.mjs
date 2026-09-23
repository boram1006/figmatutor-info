// Builds op:create spec for gap screens: A-30 "수정사항 미반영" card + A-32 재제출/마감 버튼.
// Composition rules from docs/composition-guide.md (measured from Card-PENDING/SUBMITTED).
import { writeFileSync } from 'node:fs';

const SECTION_ID = '1:23008';
const FILE_KEY = 't00UvcVe1M6llSJFyXcDkG';

const solid = (binding) => [{ type: 'SOLID', color: '#000000', binding }];
const T = (characters, textStyle, binding, name) => ({
  type: 'TEXT', name: name || characters.slice(0, 16), textStyle, characters, fills: solid(binding),
});

// Pill (badge/chip): HORIZONTAL, pad 4/8, r4
function pill(text, textBinding, bgBinding, name) {
  return {
    type: 'FRAME', name: name || 'Pill',
    layout: { mode: 'HORIZONTAL', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO' },
    metrics: { paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8, topLeftRadius: 4, topRightRadius: 4, bottomLeftRadius: 4, bottomRightRadius: 4 },
    fills: solid(bgBinding),
    children: [T(text, 'Text/micro', textBinding, 'pill-text')],
  };
}

// ---- Card: 제출완료 · 수정사항 미반영 ----
const card = {
  type: 'FRAME', name: 'Card-RESUBMIT-NEEDED', parentId: SECTION_ID,
  width: 855, height: 160,
  layout: { mode: 'VERTICAL', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'FIXED' },
  metrics: { paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24, itemSpacing: 12, topLeftRadius: 16, topRightRadius: 16, bottomLeftRadius: 16, bottomRightRadius: 16 },
  fills: solid('text-inverse'),
  metadata: { role: 'card', release: 'v5', screenId: 'A-30', state: 'submitted-unsynced' },
  children: [
    // Top
    { type: 'FRAME', name: 'Top', layout: { mode: 'HORIZONTAL', primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'AUTO' }, layoutSizingHorizontal: 'FILL',
      children: [ { ...T('AI 아틀리에', 'Text/body-lg-bold', 'text-primary', 'Title'), layoutSizingHorizontal: 'FILL' } ] },
    // Metadata: Red 재제출 필요 단일 배지 + 팀명 + · + 최종 제출일시
    { type: 'FRAME', name: 'Metadata', layout: { mode: 'HORIZONTAL', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO' }, metrics: { itemSpacing: 8 },
      children: [
        pill('재제출 필요', 'text-accent', 'background-subtle', 'StatusPill'),
        T('Team Atelier', 'Text/caption', 'text-tertiary', 'team'),
        T('·', 'Text/caption', 'text-disabled', 'dot'),
        T('최종 제출 26.10.14 11:23 · 수정 후 미반영', 'Text/caption', 'text-disabled', 'time'),
      ] },
    // Divider
    { type: 'RECTANGLE', name: 'Divider', width: 807, height: 1, layoutSizingHorizontal: 'FILL', fills: solid('border-disabled') },
    // Bottom: CTA
    { type: 'FRAME', name: 'Bottom', layout: { mode: 'HORIZONTAL', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO' }, layoutSizingHorizontal: 'FILL',
      children: [
        { ...T('제출 후 수정한 내용이 있습니다', 'Text/caption', 'text-tertiary', 'note'), layoutSizingHorizontal: 'FILL' },
        T('수정사항 제출하기 →', 'Text/caption-medium', 'text-accent', 'cta'),
      ] },
  ],
};

// ---- Button: 변경사항 다시 제출하기 (재활성, Red primary) ----
function button(label, textBinding, bgBinding, name, withLock) {
  const kids = [];
  if (withLock) kids.push(T('🔒', 'Text/caption-medium', textBinding, 'lock'));
  kids.push(T(label, 'Text/caption-medium', textBinding, 'label'));
  return {
    type: 'FRAME', name, parentId: SECTION_ID, width: 260, height: 44,
    layout: { mode: 'HORIZONTAL', primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED' },
    metrics: { paddingTop: 12, paddingRight: 20, paddingBottom: 12, paddingLeft: 20, itemSpacing: 6, topLeftRadius: 8, topRightRadius: 8, bottomLeftRadius: 8, bottomRightRadius: 8 },
    bindings: { topLeftRadius: 'radius-8', topRightRadius: 'radius-8', bottomLeftRadius: 'radius-8', bottomRightRadius: 'radius-8' },
    fills: solid(bgBinding),
    metadata: { role: 'button', release: 'v5', screenId: 'A-32', state: name },
    children: kids,
  };
}

const btnResubmit = button('변경사항 다시 제출하기 →', 'text-inverse', 'text-accent', 'Btn-Resubmit');
const btnClosed = button('제출 마감됨', 'text-disabled', 'background-surface', 'Btn-Closed', true);

const spec = { op: 'create', fileKey: FILE_KEY, pageName: 'design', nodes: [card, btnResubmit, btnClosed] };
writeFileSync(new URL('./spec-create-gap.json', import.meta.url), JSON.stringify(spec, null, 2));
console.log('written spec-create-gap.json | nodes', spec.nodes.length);
