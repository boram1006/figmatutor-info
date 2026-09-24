import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {paths,write,read,fileHash,safePath,systemDigest,buildDigest,reviewDigest,validateTokens,reuseRate,effectiveTokens} from '../scripts/lib/core.mjs';
import {evaluate} from '../scripts/lib/gates.mjs';
import {validateSnapshot} from '../scripts/lib/snapshot.mjs';
import {validateCharacterAssets} from '../scripts/lib/assets.mjs';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4f8AAAAASUVORK5CYII=','base64');
const tokens={schemaVersion:1,primitives:{blue:{type:'COLOR',value:'#2563EB'},gap:{type:'FLOAT',value:16}},semantic:{'color-primary':{ref:'blue'},'space-content':{ref:'gap'}},textStyles:{'Text/body':{fontFamily:'Inter',fontStyle:'Regular',fontSize:16,lineHeight:24}}};
// System snapshot fixture: variables/text styles that must match the extracted tokens.json.
function systemVariables(){return {primitives:{blue:{type:'COLOR',valuesByMode:{m:'#2563EB'},aliasesByMode:{}},gap:{type:'FLOAT',valuesByMode:{m:16},aliasesByMode:{}}},semantic:{'color-primary':{type:'COLOR',valuesByMode:{},aliasesByMode:{m:{name:'blue',collection:'primitives'}}},'space-content':{type:'FLOAT',valuesByMode:{},aliasesByMode:{m:{name:'gap',collection:'primitives'}}}}};}
function fixture(t){
 const root=mkdtempSync(join(tmpdir(),'harness-test-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const put=(p,v)=>write(root,p,v), text=(p,v)=>{mkdirSync(dirname(join(root,p)),{recursive:true});writeFileSync(join(root,p),v);};
 text('PRD.md','UI test fixture only');for(const p of ['ref.png','default.png','loading.png','long.png'])text(p,png);
 const config={schemaVersion:1,project:'fixture',viewports:[{id:'mobile',width:390,height:844,safeAreaTop:44,safeAreaBottom:34}],grid:4,minimumTapSize:44,minimumReuseRate:0.8,imagePolicy:{mode:'local-characters',directory:'characters',scaleMode:'FIT',backgroundColor:'#E3F2FD'},figma:{fileKey:'fixture'},extractPages:['01 Foundations','03 Screens']};
 text('characters/buddy.png',png);put(paths.assets,{schemaVersion:1,assets:[]});put(paths.config,config);
 const requirements={schemaVersion:1,status:'ready',prd:'PRD.md',screens:[{id:'home',name:'Home',purpose:'Learn',primaryAction:{id:'learn',label:'Learn',kind:'card'},origin:'existing',sourceFrame:'Home@03 Screens',referenceIds:['r1'],states:[{id:'default',primaryRequired:true},{id:'loading',primaryRequired:false}],componentIds:['Card'],viewportIds:['mobile'],contentCases:['long title'],imageSlots:[]}],flows:[{id:'f1',goal:'Learn',screenIds:['home']}],openQuestions:[]};
 put(paths.extensions,{schemaVersion:1,primitives:{},semantic:{},textStyles:{}});
 put(paths.requirements,requirements);put(paths.references,{schemaVersion:1,references:[{id:'r1',file:'ref.png',sourceApp:'fixture'}]});put(paths.tokens,tokens);
 const catalog={schemaVersion:1,components:[{id:'Card',nodeId:'component',states:['default','loading'],height:'hug',semanticTokens:['color-primary','space-content']}]};put(paths.components,catalog);
 function node(id,type,parentId=null,extra={}){return {id,name:id,type,parentId,bounds:{x:16,y:60,width:350,height:100},fills:[],strokes:[],metrics:{},bindings:{},textStyle:null,layout:{mode:'VERTICAL',vertical:'HUG'},role:null,componentId:'Card',reusable:false,tapTarget:false,...extra};}
 function snapshot(stage,frames){return {schemaVersion:1,fileKey:'fixture',stage,inputDigest:stage==='extract-system'?systemDigest(root):buildDigest(root,stage),capturedAt:new Date().toISOString(),complete:true,variables:systemVariables(),textStyles:tokens.textStyles,frames};}
 // extract-system snapshot: the extracted component master + variables, matching tokens.json.
 put(paths.systemSnapshot,snapshot('extract-system',[{id:'component',name:'Card',width:350,height:100,nodes:[node('component','COMPONENT')]}]));
 put(paths.componentSnapshot,snapshot('components',[{id:'component',name:'Card',width:350,height:100,nodes:[node('component','COMPONENT')]}]));
 put(paths.assets,{schemaVersion:1,assets:[]});
 const screens=['default','loading'].map(state=>({screenId:'home',state,viewportId:'mobile',frameId:state,screenshot:state+'.png'}));put(paths.screens,{schemaVersion:1,screens});
 put(paths.screenSnapshot,snapshot('screens',screens.map(s=>({id:s.frameId,name:s.state,width:390,height:844,screenId:'home',state:s.state,viewportId:'mobile',nodes:[node(s.state,'FRAME',null,{role:'screen',bounds:{x:0,y:0,width:390,height:844}}),node(s.state+'-card','INSTANCE',s.state,{reusable:true,tapTarget:s.state==='default',primaryActionId:s.state==='default'?'learn':null}),node(s.state+'-inner','FRAME',s.state+'-card')]}))));
 const visual={schemaVersion:1,inputDigest:reviewDigest(root),reviewedAt:new Date().toISOString(),reviewer:'test fixture',screens:screens.map(s=>({frameId:s.frameId,screenshotSha256:fileHash(root,s.screenshot),checks:Object.fromEntries(['hierarchy','readability','alignment','brandFit','interactionClarity'].map(k=>[k,'pass'])),observations:'Unit test, not a production review.',issues:[]})),contentTests:[{screenId:'home',case:'long title',status:'pass',observations:'test fixture only',evidence:'long.png',evidenceSha256:fileHash(root,'long.png')}]};put(paths.visual,visual);
 return {root,put,text,config,requirements,catalog,node,snapshot};
}
const errors=(root,phase)=>evaluate(root,phase).at(-1).errors.join('\n');
test('valid independent fixture passes all five phases',t=>{const {root}=fixture(t);assert.deepEqual(evaluate(root).filter(r=>!r.passed),[]);});
test('config requires an existing Figma file key and extract page list',t=>{
 const f=fixture(t),c={...f.config};delete c.figma;f.put(paths.config,c);assert.match(errors(f.root,'inputs'),/figma\.fileKey/);
 const c2={...f.config,extractPages:[]};f.put(paths.config,c2);assert.match(errors(f.root,'inputs'),/extractPages/);
});
test('every screen must declare origin, and existing screens need a source frame',t=>{
 const f=fixture(t),r=read(f.root,paths.requirements);delete r.screens[0].origin;f.put(paths.requirements,r);assert.match(errors(f.root,'inputs'),/origin/);
 r.screens[0].origin='existing';delete r.screens[0].sourceFrame;f.put(paths.requirements,r);assert.match(errors(f.root,'inputs'),/sourceFrame/);
});
test('new screens need a rationale for the addition',t=>{
 const f=fixture(t),r=read(f.root,paths.requirements);r.screens[0].origin='new';delete r.screens[0].sourceFrame;f.put(paths.requirements,r);assert.match(errors(f.root,'inputs'),/rationale/);
});
test('references are optional but declared reference ids must exist',t=>{
 const f=fixture(t),r=read(f.root,paths.requirements);r.screens[0].referenceIds=['ghost'];f.put(paths.requirements,r);assert.match(errors(f.root,'inputs'),/없는 참조/);
 r.screens[0].referenceIds=[];f.put(paths.requirements,r);f.put(paths.references,{schemaVersion:1,references:[]});assert.equal(errors(f.root,'inputs'),'');
});
test('primary/flow repetitions cannot cover another empty screen',t=>{
 const f=fixture(t),r=read(f.root,paths.requirements);r.screens.push({...r.screens[0],id:'missing',primaryAction:null});f.put(paths.requirements,r);
 assert.match(errors(f.root,'inputs'),/missing:.*primaryAction/);
});
test('numeric primitive alias and direct semantic values rejected',()=>{
 const t=structuredClone(tokens);t.semantic['space-content']={value:16};assert.ok(validateTokens(t).length);t.semantic['space-content']={ref:'missing'};assert.ok(validateTokens(t).length);
});
test('nested instance frames do not dilute component reuse',()=>{
 assert.equal(reuseRate([{id:'a',type:'INSTANCE',reusable:true},{id:'b',type:'FRAME',parentId:'a',reusable:true},{id:'c',type:'FRAME',parentId:'b',reusable:true}]),1);
 assert.equal(reuseRate([{id:'a',type:'FRAME',reusable:true}]),0);
});
test('extracted tokens must match the system snapshot',t=>{
 const f=fixture(t),tks=read(f.root,paths.tokens);tks.primitives.blue.value='#FF0000';f.put(paths.tokens,tks);
 assert.match(errors(f.root,'extract-system'),/primitive 실제 값/);
});
test('editing extracted tokens after building invalidates downstream snapshots',t=>{
 const f=fixture(t),tks=read(f.root,paths.tokens);tks.primitives.blue.value='#FF0000';f.put(paths.tokens,tks);
 // system snapshot was extracted with #2563EB; changing tokens.json must fail extract-system and components digests
 assert.match(errors(f.root,'components'),/입력 변경/);assert.match(errors(f.root,'components'),/primitive 실제 값/);
});
test('forged old audit PASS is ignored by check',t=>{const f=fixture(t);f.put(paths.audit,{passed:true});const s=read(f.root,paths.screens);s.screens.pop();f.put(paths.screens,s);assert.match(errors(f.root,'screens'),/화면 상태 누락/);});
test('a visual failure blocks final verification',t=>{const f=fixture(t),v=read(f.root,paths.visual);v.screens[0].checks.readability='fail';f.put(paths.visual,v);assert.match(errors(f.root,'verification'),/readability/);});
test('changed screenshot invalidates visual evidence',t=>{const f=fixture(t);f.text('default.png',Buffer.concat([png,Buffer.from('changed')]));assert.match(errors(f.root,'verification'),/입력 변경/);assert.match(errors(f.root,'verification'),/스크린샷 변경/);});
test('missing stress-case evidence fails review',t=>{const f=fixture(t),v=read(f.root,paths.visual);v.contentTests=[];f.put(paths.visual,v);assert.match(errors(f.root,'verification'),/콘텐츠 검토 미완료/);});
test('snapshot detects wrong semantic aliases and unbound positive spacing',t=>{
 const f=fixture(t),s=read(f.root,paths.screenSnapshot);s.variables.semantic['color-primary'].aliasesByMode.m.name='gap';s.frames[0].nodes[1].metrics.paddingLeft=16;f.put(paths.screenSnapshot,s);
 assert.match(errors(f.root,'screens'),/semantic alias/);assert.match(errors(f.root,'screens'),/paddingLeft semantic/);
});
test('a semantic alias in one mode cannot conceal a direct value in another',t=>{const f=fixture(t),s=read(f.root,paths.screenSnapshot);s.variables.semantic['color-primary'].valuesByMode.dark='#000000';f.put(paths.screenSnapshot,s);assert.match(errors(f.root,'screens'),/semantic alias/);});
test('safe area, tap size, overflow and fixed height failures are reported',t=>{
 const f=fixture(t),s=read(f.root,paths.screenSnapshot),n=s.frames[0].nodes[1];n.bounds={x:-20,y:0,width:20,height:20};n.layout.vertical='FIXED';f.put(paths.screenSnapshot,s);
 const e=errors(f.root,'screens');assert.match(e,/탭 영역 부족/);assert.match(e,/safe area/);assert.match(e,/부모 경계 넘침/);assert.match(e,/고정 높이 토큰/);
});
test('safe area respects clipped scroll ancestors but rejects visible unsafe content',t=>{
 const f=fixture(t),s=read(f.root,paths.screenSnapshot),frame=s.frames[0],card=frame.nodes[1];
 const scroll=f.node('scroll','FRAME',frame.id,{bounds:{x:0,y:44,width:390,height:766},scrollable:true,clipsContent:true});
 const content=f.node('content','FRAME','scroll',{bounds:{x:0,y:44,width:390,height:1400}});
 frame.nodes.push(scroll,content);card.parentId='content';card.bounds.y=900;
 f.put(paths.screenSnapshot,s);assert.doesNotMatch(errors(f.root,'screens'),/safe area/);
 card.bounds.y=790;f.put(paths.screenSnapshot,s);assert.doesNotMatch(errors(f.root,'screens'),/safe area/);
 scroll.clipsContent=false;f.put(paths.screenSnapshot,s);assert.match(errors(f.root,'screens'),/safe area/);
 scroll.clipsContent=true;scroll.bounds.height=800;f.put(paths.screenSnapshot,s);assert.match(errors(f.root,'screens'),/safe area/);
});
test('missing actual asset slot prevents screens completion',t=>{
 const f=fixture(t),r=read(f.root,paths.requirements);r.screens[0].imageSlots=[{id:'hero',assetId:'missing'}];f.put(paths.requirements,r);assert.match(errors(f.root,'screens'),/이미지 슬롯 hero/);
});
test('unknown phases and malformed JSON fail closed',t=>{
 const f=fixture(t);assert.throws(()=>evaluate(f.root,'nonsense'),/알 수 없는/);f.text(paths.requirements,'{broken');assert.equal(evaluate(f.root,'inputs')[0].passed,false);
});
test('project file access rejects traversal and external symlinks',t=>{
 const f=fixture(t);assert.throws(()=>safePath(f.root,'../escape'),/프로젝트 밖/);symlinkSync(tmpdir(),join(f.root,'external'));assert.throws(()=>safePath(f.root,'external/new-file'),/심볼릭 링크/);
});
test('merge rejects missing, duplicate and inconsistent frame batches',t=>{
 const f=fixture(t),base=read(f.root,paths.screenSnapshot);base.expectedFrameIds=['default','loading'];base.pageId='page';
 f.put('batch1.json',{...base,complete:false,frames:[base.frames[0]]});f.put('batch2.json',{...base,complete:false,frames:[base.frames[1]]});
 const run=files=>spawnSync(process.execPath,[join(repo,'scripts/merge-snapshots.mjs'),...files,'--output','merged.json'],{cwd:f.root,encoding:'utf8'});
 assert.equal(run(['batch1.json']).status,1);assert.equal(existsSync(join(f.root,'merged.json')),false);
 assert.equal(run(['batch1.json','batch1.json']).status,1);assert.equal(run(['batch1.json','batch2.json']).status,0);assert.equal(read(f.root,'merged.json').complete,true);
 const bad=read(f.root,'batch2.json');bad.inputDigest='changed';f.put('batch2.json',bad);assert.equal(run(['batch1.json','batch2.json']).status,1);
});
test('Figma extractor parses as async body and reads a guarded API mock',async()=>{
 const source=readFileSync(join(repo,'scripts/figma/extract-snapshot.js'),'utf8').replace("fileKey:'__FILE_KEY__',pageName:'__PAGE_NAME__',stage:'__STAGE__',inputDigest:'__INPUT_DIGEST__'","fileKey:'f',pageName:'Screens',stage:'screens',inputDigest:'digest'");
 const root={id:'frame',name:'Home',type:'FRAME',visible:true,width:390,height:844,absoluteBoundingBox:{x:100,y:100,width:390,height:844},children:[],getPluginData:()=>JSON.stringify({role:'screen',screenId:'home',state:'default',viewportId:'mobile'}),boundVariables:{},opacity:1,blendMode:'PASS_THROUGH',layoutMode:'VERTICAL',layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',primaryAxisSizingMode:'FIXED',counterAxisSizingMode:'FIXED',primaryAxisAlignItems:'MIN',counterAxisAlignItems:'MIN',layoutWrap:'NO_WRAP',constraints:{horizontal:'MIN',vertical:'MIN'},clipsContent:false,effects:[],fills:[],strokes:[]};
 const guarded=new Proxy(root,{get:(o,k)=>{if(!(k in o))throw new Error('Unsupported getter: '+String(k));return o[k];}});
 const page={id:'page',name:'Screens',children:[guarded]},api={fileKey:'f',mixed:Symbol('mixed'),root:{children:[page]},variables:{getLocalVariableCollectionsAsync:async()=>[]},getLocalTextStylesAsync:async()=>[],setCurrentPageAsync:async()=>{}};
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 const result=await new AsyncFunction('figma',source)(api);
 const node=result.frames[0].nodes[0];
 assert.equal(result.complete,true);assert.equal(node.bounds.x,0);assert.equal(result.frames[0].screenId,'home');
 assert.equal(node.layout.horizontal,'FIXED');assert.equal(node.layout.primaryAxisSizingMode,'FIXED');
 assert.deepEqual(node.constraints,{horizontal:'MIN',vertical:'MIN'});assert.equal(node.opacity,1);assert.deepEqual(node.effects,[]);
});
test('additive component tokens keep the system valid but rebuild affected components',t=>{
 const f=fixture(t);f.put(paths.extensions,{schemaVersion:1,primitives:{red:{type:'COLOR',value:'#FF0000'}},semantic:{'color-error':{ref:'red'}},textStyles:{}});
 assert.equal(errors(f.root,'extract-system'),'');assert.ok(effectiveTokens(f.root).semantic['color-error']);assert.match(errors(f.root,'components'),/입력 변경/);
});
test('component refinements cannot overwrite extracted system tokens',t=>{
 const f=fixture(t);f.put(paths.extensions,{schemaVersion:1,primitives:{blue:{type:'COLOR',value:'#FF0000'}},semantic:{},textStyles:{}});
 assert.throws(()=>effectiveTokens(f.root),/덮어쓰기 금지/);
});
test('character policy rejects generation config and missing source folders',t=>{
 const f=fixture(t);f.config.imageProvider='higgsfield';f.put(paths.config,f.config);
 assert.match(errors(f.root,'inputs'),/provider\/budget/);
 delete f.config.imageProvider;f.config.imagePolicy.directory='missing';f.put(paths.config,f.config);
 assert.equal(evaluate(f.root,'inputs')[0].passed,false);
});
test('character pixels and asset registry participate in design fingerprints',t=>{
 const f=fixture(t),before=systemDigest(f.root),build=buildDigest(f.root);
 f.text('characters/buddy.png',Buffer.concat([png,Buffer.from('changed')]));
 assert.notEqual(systemDigest(f.root),before);assert.match(errors(f.root,'extract-system'),/입력 변경/);
 f.text('characters/buddy.png',png);f.put(paths.assets,{schemaVersion:1,assets:[{id:'buddy',file:'characters/buddy.png'}]});
 assert.notEqual(buildDigest(f.root),build);
});
test('character slots enforce original file hash, identity, FIT and sky backing',t=>{
 const f=fixture(t),a={id:'buddy',file:'characters/buddy.png',sha256:fileHash(f.root,'characters/buddy.png'),source:'local-character',figmaImageHash:'actual-upload'};
 const n={id:'image',parentId:'bg',name:'Character',assetId:'buddy',fills:[{type:'IMAGE',imageHash:'actual-upload',scaleMode:'FIT'}]};
 const bg={id:'bg',fills:[{type:'SOLID',color:'#E3F2FD'}]},snap={frames:[{name:'Card',nodes:[bg,n]}]},manifest={schemaVersion:1,assets:[a]};
 assert.deepEqual(validateCharacterAssets(f.root,f.config,manifest,snap),[]);
 n.fills[0].scaleMode='FILL';assert.match(validateCharacterAssets(f.root,f.config,manifest,snap).join(),/FIT/);n.fills[0].scaleMode='FIT';
 bg.fills=[];assert.match(validateCharacterAssets(f.root,f.config,manifest,snap).join(),/배경 누락/);
 n.assetId='unknown';assert.match(validateCharacterAssets(f.root,f.config,manifest,snap).join(),/assetId\/hash/);
 a.file='ref.png';assert.match(validateCharacterAssets(f.root,f.config,manifest,snap).join(),/원본 파일만/);
 a.file='characters/buddy.png';a.sha256='wrong';assert.match(validateCharacterAssets(f.root,f.config,manifest,snap).join(),/sha256/);
});

test('Figma plugin source remains syntactically valid',()=>{
 const source=readFileSync(join(repo,'scripts/figma-plugin/code.js'),'utf8');
 assert.doesNotThrow(()=>new Function(source));
});


function duplicatePluginHarness(){
 const sourceCode=readFileSync(join(repo,'scripts/figma-plugin/code.js'),'utf8');
 const messages=[];
 let cloneSeq=0,lastClone=null;
 const makeText=(id,name,characters)=>({
  id,name,type:'TEXT',visible:true,width:120,height:24,characters,
  fontName:{family:'Inter',style:'Regular'},fontSize:16,fontWeight:400,
  lineHeight:{unit:'PIXELS',value:24},letterSpacing:{unit:'PIXELS',value:0},
  textAlignHorizontal:'LEFT',textAlignVertical:'TOP',textAutoResize:'WIDTH_AND_HEIGHT',
  fills:[],strokes:[],effects:[],opacity:1,blendMode:'PASS_THROUGH',
  children:[],
 });
 const makeSource=()=>{
  const child=makeText('text-source','Title','Before');
  const root={
   id:'source',name:'Card',type:'FRAME',visible:true,width:300,height:100,
   children:[child],fills:[],strokes:[],effects:[],opacity:1,blendMode:'PASS_THROUGH',
   layoutMode:'VERTICAL',layoutSizingHorizontal:'FIXED',layoutSizingVertical:'HUG',
   primaryAxisSizingMode:'AUTO',counterAxisSizingMode:'FIXED',
   primaryAxisAlignItems:'MIN',counterAxisAlignItems:'MIN',layoutWrap:'NO_WRAP',
   itemSpacing:8,paddingTop:16,paddingRight:16,paddingBottom:16,paddingLeft:16,
   constraints:{horizontal:'MIN',vertical:'MIN'},clipsContent:false,
   clone(){
    cloneSeq++;
    const cchild=makeText('text-clone-'+cloneSeq,'Title','Before');
    const clone={
     ...this,id:'clone-'+cloneSeq,children:[cchild],removed:false,
     remove(){this.removed=true;},
    };
    delete clone.clone;
    lastClone=clone;
    return clone;
   },
  };
  return root;
 };
 const original=makeSource();
 const page={id:'page',name:'design',children:[],appendChild(n){this.children.push(n);}};
 const figma={
  fileKey:'f',mixed:Symbol('mixed'),showUI(){},ui:{onmessage:null,postMessage(m){messages.push(m);}},
  root:{children:[page]},setCurrentPageAsync:async()=>{},
  getNodeByIdAsync:async(id)=>id==='source'?original:null,
  loadFontAsync:async()=>{},
  variables:{getLocalVariablesAsync:async()=>[]},
 };
 const init=new Function('figma','__html__',sourceCode+'\nreturn figma.ui.onmessage;');
 const onmessage=init(figma,'');
 return {figma,onmessage,messages,getLastClone:()=>lastClone};
}

test('duplicate op reports matched patches and passes clone verification',async()=>{
 const h=duplicatePluginHarness();
 await h.onmessage({type:'run',spec:{op:'duplicate',fileKey:'f',pageName:'design',items:[{sourceId:'source',name:'Card-After',patches:[{nodeName:'Title',characters:'After',expectedMatches:1}]}]}});
 const msg=h.messages.at(-1);
 assert.equal(msg.type,'result');
 assert.equal(msg.result.counts.createdItems,1);
 assert.equal(msg.result.counts.appliedPatches,1);
 assert.equal(msg.result.counts.verifiedItems,1);
 assert.equal(msg.result.items[0].patches[0].matchedCount,1);
 assert.equal(msg.result.items[0].verification.prePatch.passed,true);
 assert.equal(msg.result.items[0].verification.postPatch.passed,true);
 assert.equal(h.getLastClone().children[0].characters,'After');
});

test('duplicate op fails closed and removes clone when patch target is missing',async()=>{
 const h=duplicatePluginHarness();
 await h.onmessage({type:'run',spec:{op:'duplicate',fileKey:'f',pageName:'design',items:[{sourceId:'source',patches:[{nodeName:'Missing',characters:'After'}]}]}});
 const msg=h.messages.at(-1);
 assert.equal(msg.type,'error');
 assert.match(msg.message,/patch 대상 노드 없음/);
 assert.equal(h.getLastClone().removed,true);
});
