#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolvePatternRegistry,discoverPatternCandidates,DEFAULT_REGISTRY} from './pattern-registry.mjs';

const repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));

function arg(name,args){
  const i=args.indexOf(name);
  return i>=0?args[i+1]:null;
}
function readJson(path){return JSON.parse(readFileSync(path,'utf8'));}
function writeJson(path,value){
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,JSON.stringify(value,null,2)+'\n');
}
function mergeSnapshots(snapshots){
  if(!snapshots.length) throw new Error('merge할 snapshot이 없음');
  const first=snapshots[0];
  const frames=[];
  const seen=new Set();
  for(const snap of snapshots){
    if(first.fileKey && snap.fileKey && first.fileKey!==snap.fileKey)
      throw new Error('snapshot fileKey 불일치');
    for(const frame of snap.frames||[]){
      if(seen.has(frame.id)) continue;
      seen.add(frame.id);
      frames.push(frame);
    }
  }
  return {
    schemaVersion:1,
    fileKey:first.fileKey||null,
    stage:'explore',
    inputDigest:'pattern-source-scan-legacy-merged',
    capturedAt:new Date().toISOString(),
    pageId:first.pageId||null,
    expectedFrameIds:[...new Set(snapshots.flatMap(s=>s.expectedFrameIds||[]))],
    complete:snapshots.every(s=>s.complete===true),
    frames
  };
}

const args=process.argv.slice(2);
const inputs=(arg('--inputs',args)||'')
  .split(',')
  .map(v=>v.trim())
  .filter(Boolean)
  .map(p=>resolve(repoRoot,p));

if(!inputs.length){
  throw new Error(
    '--inputs 필요. 예: --inputs design/operations/pattern-source-scan/result-legacy-1.json,design/operations/pattern-source-scan/result-legacy-2.json,design/operations/pattern-source-scan/result-legacy-3.json'
  );
}
for(const path of inputs){
  if(!existsSync(path)) throw new Error('입력 snapshot 없음: '+path);
}

const registryPath=resolve(repoRoot,arg('--registry',args)||DEFAULT_REGISTRY);
const mergedPath=resolve(repoRoot,arg('--merged',args)||'design/operations/pattern-source-scan/snapshot-legacy-merged.json');
const discoveredPath=resolve(repoRoot,arg('--discovery',args)||'design/03-design-rules/patterns/discovery-candidates-legacy.json');
const resolvedPath=resolve(repoRoot,arg('--resolved',args)||'design/03-design-rules/patterns/resolved-registry-legacy.json');

const merged=mergeSnapshots(inputs.map(readJson));
const registry=readJson(registryPath);
const discovery=discoverPatternCandidates(registry,merged,{limitPerPattern:12});
const resolvedRegistry=resolvePatternRegistry(registry,merged);

writeJson(mergedPath,merged);
writeJson(discoveredPath,discovery);
writeJson(resolvedPath,resolvedRegistry);

console.log(JSON.stringify({
  inputs,
  outputs:{merged:mergedPath,discovery:discoveredPath,resolved:resolvedPath},
  frames:merged.frames.length,
  cloneReady:resolvedRegistry.patterns
    .filter(p=>p.cloneReady)
    .map(p=>({
      patternId:p.id,
      sources:(p.resolvedSources||[])
        .filter(s=>s.status==='resolved')
        .map(s=>({selectorId:s.selectorId,nodeId:s.matches[0]?.nodeId||null}))
    })),
  candidateCounts:discovery.patterns.map(p=>({patternId:p.patternId,count:p.candidates.length}))
},null,2));
