import {readFileSync} from 'node:fs';
import {paths,phases,read,safePath,fileHash,array,object,nonempty,unique,imageExists,validateTokens,effectiveTokens,systemDigest,buildDigest,reviewDigest} from './core.mjs';
import {validateSnapshot} from './snapshot.mjs';
import {characterFiles,validateCharacterAssets} from './assets.mjs';

function configErrors(c) {
  const e=[];
  if(c.schemaVersion!==1) e.push('config.schemaVersion은 1이어야 함');
  if(!array(c.viewports).length) e.push('viewport 필요');
  unique(array(c.viewports),'id',e,'viewports');
  for(const v of array(c.viewports)) if(!(v.width>0 && v.height>0 && v.safeAreaTop>=0 && v.safeAreaBottom>=0 && v.safeAreaTop+v.safeAreaBottom<v.height)) e.push(`${v.id}: viewport 치수 오류`);
  if(!(c.grid>0 && c.minimumTapSize>0 && c.minimumReuseRate>=0 && c.minimumReuseRate<=1)) e.push('grid/tap/reuse 설정 오류');
  if(!nonempty(c.figma?.fileKey)) e.push('기존 피그마 파일 키(figma.fileKey) 필요');
  if(!array(c.extractPages).length || c.extractPages.some(p=>!nonempty(p))) e.push('추출 대상 페이지 목록(extractPages) 필요');
  return e;
}
function inputs(root,c) {
  const e=configErrors(c), r=read(root,paths.requirements), refs=read(root,paths.references);
  try{characterFiles(root,c);}catch(error){e.push(error.message);}
  if(r.schemaVersion!==1 || refs.schemaVersion!==1) e.push('inputs schemaVersion 오류');
  if(r.status!=='ready') e.push('요구사항 초안 검토 후 status: ready 필요 (사용자 승인과는 별도)');
  if(!nonempty(readFileSync(safePath(root,r.prd),'utf8'))) e.push('PRD 비어 있음');
  if(array(r.openQuestions).length) e.push(`해결되지 않은 질문 ${r.openQuestions.length}개`);
  const screens=array(r.screens), references=array(refs.references), refIds=new Set(references.map(x=>x.id));
  if(!screens.length) e.push('화면 필요');
  unique(screens,'id',e,'screens'); unique(references,'id',e,'references');
  // 레퍼런스는 선택적 근거다(기존 화면 캡처 등). 등록된 항목만 실제 이미지·출처를 검증한다.
  for(const ref of references) {
    try{imageExists(root,ref.file);}catch(err){e.push(err.message);}
    if(!nonempty(ref.sourceApp)) e.push(`${ref.id}: 출처 앱 필요`);
  }
  for(const s of screens) {
    if(!nonempty(s.purpose) || !nonempty(s.primaryAction?.id) || !nonempty(s.primaryAction?.label)) e.push(`${s.id}: 목적/primaryAction 필요`);
    // origin: existing = 기존 피그마 파일의 화면, new = 새로 추가할 화면.
    if(!['existing','new'].includes(s.origin)) e.push(`${s.id}: origin(existing|new) 필요`);
    if(s.origin==='existing' && !nonempty(s.sourceFrame)) e.push(`${s.id}: 기존 화면은 sourceFrame(원본 프레임 식별자) 필요`);
    if(s.origin==='new' && !nonempty(s.rationale)) e.push(`${s.id}: 새 화면은 rationale(추가 근거) 필요`);
    // referenceIds는 선택적이며, 지정된 경우에만 존재하는 참조인지 검사한다.
    if(array(s.referenceIds).some(id=>!refIds.has(id))) e.push(`${s.id}: 없는 참조 ID`);
    const states=array(s.states); unique(states,'id',e,`${s.id} states`);
    if(!states.some(x=>x.id==='default') || states.some(x=>typeof x.primaryRequired!=='boolean')) e.push(`${s.id}: default 상태/상태별 primaryRequired 필요`);
    if(!array(s.viewportIds).length || s.viewportIds.some(id=>!c.viewports.some(v=>v.id===id))) e.push(`${s.id}: viewportIds 오류`);
    if(!array(s.componentIds).length || new Set(s.componentIds).size!==s.componentIds.length) e.push(`${s.id}: componentIds 필요/중복`);
    if(!array(s.contentCases).length) e.push(`${s.id}: 긴 콘텐츠/빈 데이터 등의 contentCases 필요`);
    if(!Array.isArray(s.imageSlots)) e.push(`${s.id}: imageSlots 배열 필요 (없으면 [])`);
    unique(array(s.imageSlots),'id',e,`${s.id} imageSlots`);
  }
  if(!array(r.flows).length) e.push('사용자 흐름 필요');
  for(const f of array(r.flows)) if(!nonempty(f.goal)||!array(f.screenIds).length||f.screenIds.some(id=>!screens.some(s=>s.id===id))) e.push(`${f.id}: 흐름 화면 참조/목적 오류`);
  return e;
}
// 기존 피그마 시스템(변수·텍스트 스타일·컴포넌트)을 추출해 tokens.json/catalog.json에 정형화한 뒤,
// 그 정형화가 실제 캔버스 스냅샷과 일치하는지 검증한다. 우리가 값을 발명하는 단계가 아니다.
function extractSystem(root,c) {
  const e=[], tokens=read(root,paths.tokens);
  e.push(...validateTokens(tokens));
  const snap=read(root,paths.systemSnapshot);
  e.push(...validateSnapshot(snap,{config:c,tokens,catalog:{components:[]},stage:'extract-system',inputDigest:systemDigest(root)}));
  return e;
}
function components(root,c) {
  const e=[], doc=read(root,paths.components), items=array(doc.components), req=read(root,paths.requirements), t=effectiveTokens(root);
  if(doc.schemaVersion!==1 || !items.length) e.push('컴포넌트 카탈로그 필요');
  unique(items,'id',e,'components');
  for(const s of req.screens) for(const id of s.componentIds) if(!items.some(x=>x.id===id)) e.push(`${s.id}: 컴포넌트 ${id} 누락`);
  for(const item of items) {
    if(!nonempty(item.nodeId)||!array(item.states).length) e.push(`${item.id}: Figma nodeId/states 필요`);
    if(item.height!=='hug' && (!object(item.height)||!t.semantic[item.height.token])) e.push(`${item.id}: height는 hug 또는 {token: semantic} 필요`);
    if(!array(item.semanticTokens).length || item.semanticTokens.some(n=>!t.semantic[n])) e.push(`${item.id}: semanticTokens 누락/오류`);
  }
  const snap=read(root,paths.componentSnapshot);
  e.push(...validateCharacterAssets(root,c,read(root,paths.assets),snap));
  e.push(...validateSnapshot(snap,{config:c,tokens:t,catalog:doc,stage:'components',inputDigest:buildDigest(root)}));
  const nodeIds=new Set(array(snap.frames).flatMap(f=>array(f.nodes)).filter(n=>['COMPONENT','COMPONENT_SET'].includes(n.type)).map(n=>n.id));
  for(const item of items) if(!nodeIds.has(item.nodeId)) e.push(`${item.id}: 실제 COMPONENT/COMPONENT_SET 노드 없음`);
  return e;
}
function screens(root,c) {
  const e=[], req=read(root,paths.requirements), manifest=read(root,paths.screens), assets=read(root,paths.assets), snap=read(root,paths.screenSnapshot), catalog=read(root,paths.components), t=effectiveTokens(root);
  if(manifest.schemaVersion!==1 || assets.schemaVersion!==1) e.push('screens/assets schemaVersion 오류');
  const entries=array(manifest.screens), records=array(assets.assets);
  const keys=entries.map(x=>`${x.screenId}/${x.state}/${x.viewportId}`);
  if(new Set(keys).size!==keys.length) e.push('화면·상태·viewport 중복');
  if(new Set(entries.map(x=>x.frameId)).size!==entries.length) e.push('하나의 프레임을 여러 상태로 재사용할 수 없음');
  unique(records,'id',e,'assets');
  e.push(...validateCharacterAssets(root,c,assets,snap));
  for(const a of records) {
    try{imageExists(root,a.file);if(a.sha256!==fileHash(root,a.file)) e.push(`${a.id}: 이미지 sha256 불일치`);}catch(err){e.push(err.message);}
    if(!nonempty(a.source)||!nonempty(a.figmaImageHash)) e.push(`${a.id}: 출처/figmaImageHash 필요`);
  }
  const expected=[];
  for(const s of req.screens) for(const state of s.states) for(const viewportId of s.viewportIds) expected.push({s,state,viewportId});
  if(entries.length!==expected.length) e.push(`화면 상태 수 불일치: ${entries.length}/${expected.length}`);
  e.push(...validateSnapshot(snap,{config:c,tokens:t,catalog,stage:'screens',inputDigest:buildDigest(root,'screens')}));
  for(const {s,state,viewportId} of expected) {
    const label=`${s.id}/${state.id}/${viewportId}`, entry=entries.find(x=>`${x.screenId}/${x.state}/${x.viewportId}`===label);
    if(!entry){e.push(`${label}: 화면 상태 누락`);continue;}
    try{imageExists(root,entry.screenshot);}catch(err){e.push(err.message);}
    const f=array(snap.frames).find(x=>x.id===entry.frameId), viewport=c.viewports.find(v=>v.id===viewportId);
    if(!f){e.push(`${label}: 실제 프레임 없음`);continue;}
    if(f.screenId!==s.id || f.state!==state.id || f.viewportId!==viewportId) e.push(`${label}: Figma 메타데이터 불일치`);
    // 데스크탑 웹 치수 규칙: 가로만 검사(허용 폭 목록), 세로는 콘텐츠 길이에 따라 가변이라 검사하지 않는다.
    // viewportExempt 화면(예: 카드 단위로 별도 추출한 컴포넌트 상세)은 뷰포트 규칙 대상이 아니다.
    if(!s.viewportExempt) {
      const allowedWidths = array(viewport.allowedWidths).length ? viewport.allowedWidths : [viewport.width];
      if(!allowedWidths.includes(f.width)) e.push(`${label}: 가로 폭 불일치 (허용: ${allowedWidths.join('/')}, 실제: ${f.width})`);
      if(viewport.heightMode!=='content' && f.height!==viewport.height) e.push(`${label}: 세로 높이 불일치`);
    }
    const primaries=array(f.nodes).filter(n=>n.primaryActionId===s.primaryAction.id);
    if(state.primaryRequired && primaries.length!==1) e.push(`${label}: 주 액션은 해당 상태에서 정확히 1개 필요`);
    if(!state.primaryRequired && primaries.length>1) e.push(`${label}: 주 액션 중복`);
    const nodeMap=new Map(array(f.nodes).map(n=>[n.id,n]));
    for(const n of array(f.nodes).filter(n=>n.tapTarget)) {
      if(n.role==='device-chrome') continue;
      // Scroll content may extend beyond the viewport. Only its visible portion
      // can intersect device chrome; unclipped content must still fail.
      let top=n.bounds.y,bottom=top+n.bounds.height,parent=nodeMap.get(n.parentId);
      const visited=new Set();
      while(parent && !visited.has(parent.id)) {
        visited.add(parent.id);
        if(parent.scrollable===true && parent.clipsContent===true) {
          top=Math.max(top,parent.bounds.y);
          bottom=Math.min(bottom,parent.bounds.y+parent.bounds.height);
        }
        parent=nodeMap.get(parent.parentId);
      }
      if(bottom>top && (top<viewport.safeAreaTop || bottom>viewport.height-viewport.safeAreaBottom)) e.push(`${label}/${n.name}: 탭 타겟 safe area 위반`);
    }
    for(const slot of array(s.imageSlots).filter(slot=>!slot.states || slot.states.includes(state.id))) {
      const n=array(f.nodes).find(n=>n.slotId===slot.id), a=records.find(a=>a.id===slot.assetId);
      if(!a || !n || !array(n.fills).some(p=>p.type==='IMAGE'&&p.imageHash===a.figmaImageHash)) e.push(`${label}: 이미지 슬롯 ${slot.id} 누락/잘못된 이미지`);
    }
  }
  return e;
}
function verification(root) {
  const e=[], review=read(root,paths.visual), manifest=read(root,paths.screens), req=read(root,paths.requirements);
  if(review.schemaVersion!==1 || review.inputDigest!==reviewDigest(root)) e.push('시각 검토 입력 변경/버전 불일치: 스크린샷 다시 검토');
  if(!Number.isFinite(Date.parse(review.reviewedAt)) || !nonempty(review.reviewer)) e.push('시각 검토 시간/검토자 필요');
  unique(array(review.screens),'frameId',e,'visual review');
  for(const screen of manifest.screens) {
    const row=array(review.screens).find(x=>x.frameId===screen.frameId);
    const label=`${screen.screenId}/${screen.state}/${screen.viewportId}`;
    if(!row){e.push(`${label}: 시각 검토 누락`);continue;}
    if(row.screenshotSha256!==fileHash(root,screen.screenshot)) e.push(`${label}: 스크린샷 변경됨`);
    for(const key of ['hierarchy','readability','alignment','brandFit','interactionClarity']) if(row.checks?.[key]!=='pass') e.push(`${label}: 시각 검토 ${key} 미통과`);
    if(!nonempty(row.observations)) e.push(`${label}: 실제 관찰 내용 필요`);
    if(array(row.issues).some(x=>x.status!=='resolved')) e.push(`${label}: 미해결 시각 결함`);
  }
  for(const s of req.screens) for(const contentCase of s.contentCases) {
    const result=array(review.contentTests).find(t=>t.screenId===s.id && t.case===contentCase);
    if(result?.status!=='pass' || !nonempty(result.observations)) e.push(`${s.id}: 콘텐츠 검토 미완료: ${contentCase}`);
    else {try{imageExists(root,result.evidence);if(result.evidenceSha256!==fileHash(root,result.evidence)) e.push(`${s.id}: 콘텐츠 증거 변경됨`);}catch(err){e.push(err.message);}}
  }
  return e;
}
export function evaluate(root, until='verification') {
  if(!phases.includes(until)) throw new Error(`알 수 없는 phase: ${until}`);
  const results=[];
  let c;
  try{c=read(root,paths.config);}catch(err){return [{phase:'inputs',passed:false,errors:[err.message]}];}
  const checks={inputs:()=>inputs(root,c),'extract-system':()=>extractSystem(root,c),components:()=>components(root,c),screens:()=>screens(root,c),verification:()=>verification(root)};
  for(const phase of phases.slice(0,phases.indexOf(until)+1)) {
    let errors;
    try{errors=checks[phase]();}catch(err){errors=[err.message];}
    const blockedBy=results.filter(r=>!r.passed).map(r=>r.phase);
    results.push({phase,passed:errors.length===0&&blockedBy.length===0,blockedBy,errors});
  }
  return results;
}
