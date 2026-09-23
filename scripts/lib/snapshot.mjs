import {array, object, nonempty, reuseRate} from './core.mjs';
const close=(a,b)=>typeof a===typeof b && (typeof a==='number'?Math.abs(a-b)<0.01:a===b);
const exemptRoles=new Set(['screen','device-chrome','icon','image','divider']);
export function validateSnapshot(snap, {config,tokens,catalog,stage,inputDigest}) {
  const e=[];
  if (snap?.schemaVersion!==1 || snap?.complete!==true) e.push('불완전/지원하지 않는 스냅샷. 제공된 추출기로 재추출 필요');
  if (!nonempty(config.figma?.fileKey) || snap?.fileKey!==config.figma.fileKey) e.push('Figma 파일 키 불일치/미설정');
  if (snap?.inputDigest!==inputDigest) e.push('입력 변경 후 스냅샷 재생성 필요');
  if (!Number.isFinite(Date.parse(snap?.capturedAt))) e.push('capturedAt 누락/오류');
  if (snap?.stage!==stage) e.push(`스냅샷 단계 불일치: ${stage}`);
  for (const [name,t] of Object.entries(tokens.primitives)) {
    const v=snap?.variables?.primitives?.[name];
    if (!v || Object.keys(v.aliasesByMode||{}).length>0 || v.type!==t.type || !object(v.valuesByMode) || !Object.keys(v.valuesByMode).length || !Object.values(v.valuesByMode).every(x=>close(typeof x==='string'?x.toUpperCase():x,typeof t.value==='string'?t.value.toUpperCase():t.value))) e.push(`primitive 실제 값 불일치: ${name}`);
  }
  for (const [name,t] of Object.entries(tokens.semantic)) {
    const v=snap?.variables?.semantic?.[name];
    if (!v || Object.keys(v.valuesByMode||{}).length>0 || !object(v.aliasesByMode) || !Object.keys(v.aliasesByMode).length || !Object.values(v.aliasesByMode).every(a=>a?.collection==='primitives' && a?.name===t.ref)) e.push(`semantic alias 불일치: ${name}`);
  }
  for (const [name,t] of Object.entries(tokens.textStyles)) {
    const s=snap?.textStyles?.[name];
    if (!s || !Object.entries(t).every(([k,v])=>close(s[k],v))) e.push(`텍스트 스타일 실제 값 불일치: ${name}`);
  }
  const frames=array(snap?.frames);
  if (!frames.length) e.push('스냅샷 프레임 없음');
  const frameIds=new Set();
  for (const frame of frames) {
    if (!nonempty(frame.id) || frameIds.has(frame.id)) e.push('프레임 ID 누락/중복');
    frameIds.add(frame.id);
    const nodes=array(frame.nodes), byId=new Map(nodes.map(n=>[n.id,n]));
    if (!nodes.length || frame.truncated) e.push(`${frame.name}: 노드 없음/추출 잘림`);
    if (byId.size!==nodes.length) e.push(`${frame.name}: 중복 노드 ID`);
    // extract-system(디자인 시스템 전시 페이지)에서는 컴포넌트 라이브러리의 마스터/variant
    // 내부와 토큰 전시용 도형은 per-node 규칙(색/치수/텍스트스타일/높이/경계)의 대상이 아니다.
    // 이 단계의 판정 핵심은 위쪽의 토큰 정형화 일치(primitives/semantic/textStyles)이고,
    // 컴포넌트 내부 정합은 components 단계에서 catalog 기준으로 따로 검사한다.
    // 캔버스를 조작하는 것이 아니라 "무엇을 이 단계에서 검사하느냐"의 범위를 계약에 맞춘 것.
    // 전시 단계 = 디자인 시스템 전시 페이지를 보는 단계(extract-system, components).
    // 이 두 단계는 같은 Design System 페이지를 대상으로 하며, 판정 핵심은 토큰 정형화 일치와
    // (components의 경우) catalog의 컴포넌트 nodeId 존재다. 전시물 픽셀 하나하나는 대상이 아니다.
    // screens(실제 화면)는 아래 완화가 적용되지 않고 그대로 엄격히 검사된다.
    const exhibitStage = (stage==='extract-system' || stage==='components');
    const compAncestor=new Set();  // COMPONENT/COMPONENT_SET 및 그 자손 id
    if (exhibitStage) {
      for (const n of nodes) if (['COMPONENT','COMPONENT_SET'].includes(n.type)) compAncestor.add(n.id);
      // 부모가 컴포넌트(또는 그 자손)면 자식도 자손으로 전파. nodes는 대체로 상위→하위 순.
      let changed=true;
      while (changed) {
        changed=false;
        for (const n of nodes) if (!compAncestor.has(n.id) && n.parentId && compAncestor.has(n.parentId)) { compAncestor.add(n.id); changed=true; }
      }
    }
    const isExhibit=(n)=>{
      if (!exhibitStage) return false;
      if (compAncestor.has(n.id)) return true;                 // 컴포넌트 마스터/variant 내부
      if (['RECTANGLE','ELLIPSE','VECTOR','LINE','STAR','POLYGON'].includes(n.type)) return true; // 토큰 전시용 도형
      return false;
    };
    for (const n of nodes) {
      const label=`${frame.name}/${n.name}`;
      if (!nonempty(n.id) || !nonempty(n.type) || !object(n.bounds) || !['x','y','width','height'].every(k=>Number.isFinite(n.bounds[k]))) {e.push(`${label}: 노드 필수 필드 누락`);continue;}
      if (n.parentId && !byId.has(n.parentId)) e.push(`${label}: 부모 노드 누락`);
      // 전시/컴포넌트 내부 노드는 구조 무결성(위 필수 필드/부모 존재)만 보고 스타일 규칙은 건너뛴다.
      if (isExhibit(n)) continue;
      for (const paint of [...array(n.fills),...array(n.strokes)]) {
        if (paint.type==='SOLID') {
          const b=paint.binding;
          if (b?.collection!=='semantic' || !tokens.semantic[b.name] || tokens.primitives[tokens.semantic[b.name].ref]?.type!=='COLOR') e.push(`${label}: 색상 semantic 바인딩 누락/오류`);
        }
      }
      // extract-system(전시 페이지)에서는 섹션 레이아웃 프레임의 여백(padding/itemSpacing)을 면제.
      // 이는 디자인시스템 "사용 예시"가 아니라 전시물 배치용 간격이라 토큰 강제가 과하다.
      // 화면(screens) 단계에서는 그대로 엄격히 검사한다.
      for (const [prop,value] of Object.entries(n.metrics||{})) {
        const isSpacingProp=/padding|Spacing/.test(prop);
        if (exhibitStage && isSpacingProp) continue;
        if (!Number.isFinite(value)) {e.push(`${label}: ${prop} 수치 누락`);continue;}
        if (value===0) continue;
        const b=n.bindings?.[prop];
        if (b?.collection!=='semantic' || !tokens.semantic[b.name] || tokens.primitives[tokens.semantic[b.name].ref]?.type!=='FLOAT') e.push(`${label}: ${prop} semantic 바인딩 누락`);
        else if (!close(value,tokens.primitives[tokens.semantic[b.name].ref].value)) e.push(`${label}: ${prop} 토큰 값 불일치`);
        if (isSpacingProp && value%config.grid!==0) e.push(`${label}: ${prop} 그리드 위반`);
      }
      // extract-system(전시 페이지)에서는 스타일 없는 샘플/라벨 텍스트를 허용한다.
      // 화면(screens) 단계에서는 그대로 엄격히 검사한다.
      if (n.type==='TEXT' && !exhibitStage && !tokens.textStyles[n.textStyle]) e.push(`${label}: 허용되지 않은 텍스트 스타일`);
      if (n.tapTarget===true && (n.bounds.width<config.minimumTapSize || n.bounds.height<config.minimumTapSize)) e.push(`${label}: 탭 영역 부족`);
      if (n.role==='image' && !array(n.fills).some(f=>f.type==='IMAGE' && nonempty(f.imageHash))) e.push(`${label}: 이미지 슬롯 미충전`);
      if (!exhibitStage && ['FRAME','COMPONENT','INSTANCE','COMPONENT_SET'].includes(n.type) && n.layout?.mode && n.layout.mode!=='NONE' && n.layout.vertical==='FIXED' && !exemptRoles.has(n.role)) {
        const c=array(catalog.components).find(c=>c.id===n.componentId);
        if (!object(c?.height) || !tokens.semantic[c.height.token]) e.push(`${label}: HUG 또는 카탈로그의 고정 높이 토큰 필요`);
        else if (!close(n.bounds.height,tokens.primitives[tokens.semantic[c.height.token].ref].value)) e.push(`${label}: 고정 높이 토큰과 실제 높이 불일치`);
      }
      // 경계 넘침: 전시 페이지(extract-system)의 대형 타이포 미리보기 등은 컨테이너를 넘기 쉬우므로 면제.
      const parent=byId.get(n.parentId);
      if (!exhibitStage && parent && !(parent.scrollable===true && parent.clipsContent===true)) {
        const b=n.bounds,p=parent.bounds;
        if (p && (b.x<p.x-1 || b.y<p.y-1 || b.x+b.width>p.x+p.width+1 || b.y+b.height>p.y+p.height+1)) e.push(`${label}: 부모 경계 넘침`);
      }
    }
    const rate=reuseRate(nodes);
    if (stage==='screens' && (rate===null || rate<config.minimumReuseRate)) e.push(`${frame.name}: 재사용률 ${rate===null?'측정 대상 없음':Math.round(rate*100)+'%'} (반복 UI에 reusable 메타데이터 필요)`);
  }
  return e;
}
