// Reference implementation of the snapshot extractor. The active path is the Figma plugin
// (scripts/figma-plugin/code.js, op:"extract"), which uses identical logic and output schema.
// Keep this file and the plugin's runExtract() in sync. Not a local Node script.
// One invocation = one page. A large page may use top-level frameIds; merge with merge-snapshots.mjs.
// See docs/kiro-figma-plugin.md for the plugin round-trip.
const CONFIG = {fileKey:'__FILE_KEY__',pageName:'__PAGE_NAME__',stage:'__STAGE__',inputDigest:'__INPUT_DIGEST__',frameIds:[]};
if(Object.values(CONFIG).some(v=>typeof v==='string'&&v.startsWith('__')))throw new Error('CONFIG replacement required');
if(figma.fileKey && figma.fileKey!==CONFIG.fileKey)throw new Error('Wrong Figma file');
const page=figma.root.children.find(p=>p.name===CONFIG.pageName);
if(!page)throw new Error('Page not found');
await figma.setCurrentPageAsync(page);
const collections=await figma.variables.getLocalVariableCollectionsAsync();
const collectionNames=new Map(collections.map(c=>[c.id,c.name]));
const variables={}, variableCache=new Map();
const rgba = c => '#'+[c.r,c.g,c.b,...((c.a??1)<1?[c.a]:[])].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
async function variable(id){
 if(!variableCache.has(id)){
  const v=await figma.variables.getVariableByIdAsync(id);
  let collection=v?collectionNames.get(v.variableCollectionId):null;
  if(v&&!collection){const c=await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);collection=c?.name;}
  variableCache.set(id,v?{name:v.name,collection}:null);
 }
 return variableCache.get(id);
}
for(const c of collections){
 if(variables[c.name])throw new Error('Duplicate variable collection name');
 variables[c.name]={};
 for(const id of c.variableIds){
  const v=await figma.variables.getVariableByIdAsync(id);if(!v)throw new Error('Missing variable');
  if(variables[c.name][v.name])throw new Error('Duplicate variable name');
  const valuesByMode={},aliasesByMode={};
  for(const [mode,value] of Object.entries(v.valuesByMode)){
   if(value?.type==='VARIABLE_ALIAS')aliasesByMode[mode]=await variable(value.id);
   else valuesByMode[mode]=v.resolvedType==='COLOR'?rgba(value):value;
  }
  variables[c.name][v.name]={type:v.resolvedType,valuesByMode,aliasesByMode};
 }
}
const textStyles={};
for(const s of await figma.getLocalTextStylesAsync()){
 if(textStyles[s.name])throw new Error('Duplicate text style name');
 textStyles[s.name]={fontFamily:s.fontName.family,fontStyle:s.fontName.style,fontSize:s.fontSize,lineHeight:s.lineHeight.unit==='PIXELS'?s.lineHeight.value:s.lineHeight.unit==='PERCENT'?s.fontSize*s.lineHeight.value/100:null};
}
async function paints(list){
 const result=[];
 if(!Array.isArray(list))return result;
 for(const p of list){
  if(p.visible===false)continue;
  result.push({type:p.type,...(p.type==='SOLID'?{color:rgba({...p.color,a:p.opacity??1}),binding:p.boundVariables?.color?await variable(p.boundVariables.color.id):null}:{}),...(p.type==='IMAGE'?{imageHash:p.imageHash,scaleMode:p.scaleMode}:{} )});
 }
 return result;
}
function effects(list){
 if(!Array.isArray(list))return [];
 return list.filter(e=>e.visible!==false).map(e=>({type:e.type,radius:typeof e.radius==='number'?e.radius:null,spread:typeof e.spread==='number'?e.spread:null,offset:e.offset?{x:e.offset.x,y:e.offset.y}:null,color:e.color?rgba(e.color):null,blendMode:e.blendMode||null}));
}
async function instanceInfo(node){
 if(node.type!=='INSTANCE')return null;
 let mainComponentId=null;
 if(typeof node.getMainComponentAsync==='function'){const main=await node.getMainComponentAsync();mainComponentId=main?.id||null;}
 else if('mainComponent' in node)mainComponentId=node.mainComponent?.id||null;
 return {mainComponentId,componentProperties:'componentProperties' in node?node.componentProperties:null,variantProperties:'variantProperties' in node?node.variantProperties:null};
}
function metadata(node){
 const shared='getSharedPluginData' in node&&typeof node.getSharedPluginData==='function'?node.getSharedPluginData('designHarness','metadata'):'';
 let local='';
 if(typeof node.getPluginData==='function'){
  try{local=node.getPluginData('designHarness');}
  catch(error){if(!String(error.message).includes('getPluginData is not supported'))throw error;}
 }
 if(shared&&local&&shared!==local)throw new Error(`Conflicting designHarness metadata on ${node.id}`);
 const raw=shared||local;
 if(!raw)return {};
 try{return JSON.parse(raw);}catch{throw new Error(`Invalid designHarness metadata on ${node.id}`);}
}
async function extract(root){
 const origin=root.absoluteBoundingBox;if(!origin)throw new Error('Frame bounds unavailable');
 const nodes=[],queue=[{node:root,parentId:null}];
 while(queue.length){
  const {node:n,parentId}=queue.shift();if(n.visible===false)continue;
  const b=n.absoluteBoundingBox;if(!b)throw new Error(`Bounds unavailable: ${n.id}`);
  const meta=metadata(n),metrics={},bindings={};
  for(const prop of ['paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing','topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']){
   if(!(prop in n)||typeof n[prop]!=='number')continue;
   metrics[prop]=n[prop];
   const binding=n.boundVariables?.[prop]||(/Radius$/.test(prop)?n.boundVariables?.cornerRadius:null);
   bindings[prop]=binding?.id?await variable(binding.id):null;
  }
  for(const prop of ['width','height'])if(n.boundVariables?.[prop]?.id){metrics[prop]=n[prop];bindings[prop]=await variable(n.boundVariables[prop].id);}
  let style=null;
  if(n.type==='TEXT'&&typeof n.textStyleId==='string'&&n.textStyleId){const s=await figma.getStyleByIdAsync(n.textStyleId);style=s?.name||null;}
  const instance=await instanceInfo(n);
  let font=null;
  if(n.type==='TEXT'){
   const fs=n.fontSize,fn=n.fontName,lh=n.lineHeight,fw=n.fontWeight;
   font={size:typeof fs==='number'?fs:null,family:fn&&fn!==figma.mixed?fn.family:null,style:fn&&fn!==figma.mixed?fn.style:null,weight:typeof fw==='number'?fw:null,lineHeight:lh&&lh!==figma.mixed&&lh.unit!=='AUTO'?lh.value:null,mixed:fs===figma.mixed||fn===figma.mixed};
  }
  nodes.push({id:n.id,name:n.name,type:n.type,parentId,bounds:{x:b.x-origin.x,y:b.y-origin.y,width:n.width,height:n.height},fills:await paints('fills' in n?n.fills:[]),strokes:await paints('strokes' in n?n.strokes:[]),effects:effects('effects' in n?n.effects:[]),opacity:'opacity' in n&&typeof n.opacity==='number'?n.opacity:null,blendMode:'blendMode' in n?n.blendMode:null,strokeWeight:'strokeWeight' in n&&typeof n.strokeWeight==='number'?n.strokeWeight:null,strokeAlign:'strokeAlign' in n?n.strokeAlign:null,metrics,bindings,textStyle:style,font,text:n.type==='TEXT'?{characters:n.characters,autoResize:'textAutoResize' in n?n.textAutoResize:null,alignHorizontal:'textAlignHorizontal' in n?n.textAlignHorizontal:null,alignVertical:'textAlignVertical' in n?n.textAlignVertical:null,letterSpacing:n.letterSpacing&&n.letterSpacing!==figma.mixed?n.letterSpacing:null}:null,layout:{mode:'layoutMode' in n?n.layoutMode:'NONE',horizontal:'layoutSizingHorizontal' in n?n.layoutSizingHorizontal:null,vertical:'layoutSizingVertical' in n?n.layoutSizingVertical:null,primaryAxisSizingMode:'primaryAxisSizingMode' in n?n.primaryAxisSizingMode:null,counterAxisSizingMode:'counterAxisSizingMode' in n?n.counterAxisSizingMode:null,primaryAxisAlignItems:'primaryAxisAlignItems' in n?n.primaryAxisAlignItems:null,counterAxisAlignItems:'counterAxisAlignItems' in n?n.counterAxisAlignItems:null,layoutWrap:'layoutWrap' in n?n.layoutWrap:null},constraints:'constraints' in n?n.constraints:null,clipsContent:'clipsContent' in n&&n.clipsContent===true,scrollable:'overflowDirection' in n&&['HORIZONTAL','VERTICAL','BOTH'].includes(n.overflowDirection),instance,role:meta.role||null,componentId:meta.componentId||null,reusable:meta.reusable===true,tapTarget:meta.tapTarget===true,primaryActionId:meta.primaryActionId||null,slotId:meta.slotId||null,assetId:meta.assetId||null});
  for(const child of ('children' in n?n.children:[]))queue.push({node:child,parentId:n.id});
 }
 const meta=metadata(root);
 return {id:root.id,name:root.name,width:root.width,height:root.height,screenId:meta.screenId||null,state:meta.state||null,viewportId:meta.viewportId||null,nodes,truncated:false};
}
const all=page.children.filter(n=>n.visible!==false && ['FRAME','COMPONENT','COMPONENT_SET','INSTANCE','SECTION'].includes(n.type));
const targets=CONFIG.frameIds.length?all.filter(n=>CONFIG.frameIds.includes(n.id)):all;
if(CONFIG.frameIds.length && targets.length!==new Set(CONFIG.frameIds).size)throw new Error('Requested frame missing');
const frames=[];
for(const target of targets)frames.push(await extract(target));
const snapshot={schemaVersion:1,fileKey:CONFIG.fileKey,stage:CONFIG.stage,inputDigest:CONFIG.inputDigest,capturedAt:CONFIG.capturedAt||new Date().toISOString(),pageId:page.id,expectedFrameIds:all.map(f=>f.id),complete:targets.length===all.length,frames,variables,textStyles};
// Read-only chunk transport: caller must compare checksums and lengths before concatenation.
// capturedAt is the real start time of this extraction session, held constant across chunks.
if(Number.isInteger(CONFIG.outputOffset)){
 if(!CONFIG.capturedAt)throw new Error('Chunk extraction requires capturedAt');
 const serialized=JSON.stringify(snapshot);let hash=2166136261;
 for(let i=0;i<serialized.length;i++)hash=Math.imul(hash^serialized.charCodeAt(i),16777619)>>>0;
 return {transport:'chunk-v1',offset:CONFIG.outputOffset,total:serialized.length,checksum:hash.toString(16),chunk:serialized.slice(CONFIG.outputOffset,CONFIG.outputOffset+10000)};
}
return snapshot;
