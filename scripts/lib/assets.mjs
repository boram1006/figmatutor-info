import {readdirSync,realpathSync} from 'node:fs';
import {relative,join} from 'node:path';
import {array,nonempty,safePath,imageExists,fileHash} from './core.mjs';

export function characterFiles(root,config){
 const policy=config.imagePolicy;
 if(policy?.mode!=='local-characters'||policy.scaleMode!=='FIT'||!/^#[\da-f]{6}$/i.test(policy.backgroundColor||'')||!nonempty(policy.directory))throw new Error('imagePolicy: local-characters / directory / FIT / backgroundColor 필요');
 if('imageProvider' in config||'assetBudget' in config)throw new Error('이미지 생성 provider/budget 설정을 제거하세요');
 const dir=safePath(root,policy.directory);
 const files=readdirSync(dir,{withFileTypes:true}).filter(e=>e.isFile()&&/\.(png|jpe?g|webp)$/i.test(e.name)).map(e=>join(policy.directory,e.name)).sort();
 if(!files.length)throw new Error('캐릭터 에셋 폴더가 비어 있음');
 for(const file of files)imageExists(root,file);
 return files;
}

export function validateCharacterAssets(root,config,manifest,snapshot){
 const errors=[],files=new Set(characterFiles(root,config)),records=array(manifest.assets);
 if(manifest.schemaVersion!==1)errors.push('assets schemaVersion 오류');
 if(records.some(a=>!nonempty(a.id))||new Set(records.map(a=>a.id)).size!==records.length)errors.push('캐릭터 assetId 누락/중복');
 for(const a of records){
  try{
   if(!files.has(a.file))throw new Error(`${a.id}: 캐릭터 폴더의 원본 파일만 허용`);
   const rel=relative(realpathSync(safePath(root,config.imagePolicy.directory)),realpathSync(safePath(root,a.file)));
   if(rel==='..'||rel.startsWith('../'))throw new Error(`${a.id}: 캐릭터 폴더 밖 파일`);
   imageExists(root,a.file);
   if(a.sha256!==fileHash(root,a.file))errors.push(`${a.id}: 이미지 sha256 불일치`);
  }catch(e){errors.push(e.message);}
  if(a.source!=='local-character'||!nonempty(a.figmaImageHash))errors.push(`${a.id}: local-character 출처/figmaImageHash 필요`);
 }
 for(const frame of array(snapshot?.frames)){
  const nodes=array(frame.nodes),byId=new Map(nodes.map(n=>[n.id,n]));
  for(const n of nodes)for(const p of array(n.fills).filter(p=>p.type==='IMAGE')){
   const a=records.find(a=>a.id===n.assetId&&a.figmaImageHash===p.imageHash);
   if(!a)errors.push(`${frame.name}/${n.name}: 등록된 캐릭터 assetId/hash 필요`);
   if(p.scaleMode!=='FIT')errors.push(`${frame.name}/${n.name}: 캐릭터 이미지는 FIT 필요`);
   const backgrounds=[...array(n.fills),...array(byId.get(n.parentId)?.fills)];
   if(!backgrounds.some(p=>p.type==='SOLID'&&p.color?.toUpperCase()===config.imagePolicy.backgroundColor.toUpperCase()))errors.push(`${frame.name}/${n.name}: 파스텔 배경 누락`);
  }
 }
 return errors;
}
