#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
export const DEFAULT_REGISTRY='design/03-design-rules/patterns/registry.json';
export const DEFAULT_RESOLVED='design/03-design-rules/patterns/resolved-registry.json';

function readJson(path){return JSON.parse(readFileSync(path,'utf8'));}

function norm(value){
  return String(value??'').trim().toLowerCase();
}

function tokenSet(values){
  const out=new Set();
  for(const value of values||[]){
    for(const token of norm(value).split(/[^a-z0-9가-힣_-]+/).filter(Boolean)) out.add(token);
  }
  return out;
}

export function resolvePatternRegistry(registry,snapshot){
  const frames=Array.isArray(snapshot?.frames)?snapshot.frames:[];
  const patterns=(registry.patterns||[]).map(pattern=>{
    const resolvedSources=(pattern.sourceSelectors||[]).map(selector=>{
      const matches=[];
      for(const frame of frames){
        for(const node of frame.nodes||[]){
          if(node.name!==selector.nodeName) continue;
          if(selector.nodeType && node.type!==selector.nodeType) continue;
          if(selector.frameName && frame.name!==selector.frameName) continue;
          matches.push({
            frameId:frame.id,
            frameName:frame.name,
            nodeId:node.id,
            nodeName:node.name,
            nodeType:node.type
          });
        }
      }
      return {
        selectorId:selector.id,
        nodeName:selector.nodeName,
        status:matches.length===1?'resolved':matches.length===0?'missing':'ambiguous',
        preferredFor:selector.preferredFor||[],
        matches
      };
    });
    return {
      ...pattern,
      resolvedSources,
      cloneReady:resolvedSources.some(source=>source.status==='resolved')
    };
  });
  return {
    schemaVersion:1,
    source:{
      fileKey:snapshot?.fileKey||null,
      stage:snapshot?.stage||null,
      capturedAt:snapshot?.capturedAt||null,
      pageId:snapshot?.pageId||null
    },
    patterns
  };
}

export function retrievePatterns(registry,query={}){
  const queryArchetypes=new Set((query.archetypes||[]).map(norm));
  const qTokens=tokenSet([
    query.intent||'',
    ...(query.tasks||[]),
    ...(query.keywords||[]),
    ...(query.states||[])
  ]);

  const results=[];
  for(const pattern of registry.patterns||[]){
    const matched=[];
    const patternArchetypes=new Set((pattern.archetypes||[]).map(norm));
    const archetypeMatches=[...queryArchetypes].filter(a=>patternArchetypes.has(a));
    if(archetypeMatches.length) matched.push({field:'archetype',values:archetypeMatches});

    for(const [field,values] of [
      ['intent',pattern.intents],
      ['task',pattern.tasks],
      ['keyword',pattern.keywords],
      ['evidence',pattern.evidence]
    ]){
      const pTokens=tokenSet(values||[]);
      const overlap=[...qTokens].filter(t=>pTokens.has(t));
      if(overlap.length) matched.push({field,values:overlap});
    }

    const preferenceTokens=tokenSet(query.states||[]);
    const resolved=(pattern.resolvedSources||[])
      .filter(source=>source.status==='resolved')
      .map(source=>{
        const preferredTokens=tokenSet(source.preferredFor||[]);
        const stateMatches=[...preferenceTokens].filter(t=>preferredTokens.has(t));
        return {...source,stateMatches};
      })
      .sort((a,b)=>b.stateMatches.length-a.stateMatches.length);

    const matchCount=matched.reduce((sum,m)=>sum+m.values.length,0);
    if(matchCount===0 && queryArchetypes.size) continue;
    if(matchCount===0 && qTokens.size) continue;

    results.push({
      patternId:pattern.id,
      ruleRef:pattern.ruleRef,
      matchCount,
      matched,
      cloneReady:resolved.length>0,
      cloneSources:resolved,
      evidence:pattern.evidence||[]
    });
  }

  return results.sort((a,b)=>
    b.matchCount-a.matchCount ||
    Number(b.cloneReady)-Number(a.cloneReady) ||
    a.patternId.localeCompare(b.patternId)
  );
}

function arg(name,args){
  const i=args.indexOf(name);
  return i>=0?args[i+1]:null;
}

function parseCsv(value){return value?value.split(',').map(v=>v.trim()).filter(Boolean):[];}

function usage(){
  return [
    'Usage:',
    '  node scripts/pattern-registry.mjs resolve --snapshot <snapshot.json> [--registry <registry.json>] [--output <resolved.json>]',
    '  node scripts/pattern-registry.mjs search --intent <text> [--archetypes A4,A5] [--tasks x,y] [--states submitted,resubmit] [--registry <resolved-or-source.json>]'
  ].join('\n');
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);
  const command=args[0];

  if(command==='resolve'){
    const snapshotArg=arg('--snapshot',args);
    if(!snapshotArg) throw new Error('--snapshot 필요\n'+usage());
    const registryPath=resolve(repoRoot,arg('--registry',args)||DEFAULT_REGISTRY);
    const snapshotPath=resolve(repoRoot,snapshotArg);
    const outputPath=resolve(repoRoot,arg('--output',args)||DEFAULT_RESOLVED);
    const result=resolvePatternRegistry(readJson(registryPath),readJson(snapshotPath));
    writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
    const summary=result.patterns.map(p=>({
      patternId:p.id,
      cloneReady:p.cloneReady,
      resolved:(p.resolvedSources||[]).filter(s=>s.status==='resolved').length,
      missing:(p.resolvedSources||[]).filter(s=>s.status==='missing').length,
      ambiguous:(p.resolvedSources||[]).filter(s=>s.status==='ambiguous').length
    }));
    console.log(JSON.stringify({output:outputPath,patterns:summary},null,2));
  } else if(command==='search'){
    const requestedRegistry=arg('--registry',args);
    const resolvedPath=resolve(repoRoot,DEFAULT_RESOLVED);
    const registryPath=requestedRegistry
      ? resolve(repoRoot,requestedRegistry)
      : existsSync(resolvedPath)
      ? resolvedPath
      : resolve(repoRoot,DEFAULT_REGISTRY);

    const query={
      intent:arg('--intent',args)||'',
      archetypes:parseCsv(arg('--archetypes',args)),
      tasks:parseCsv(arg('--tasks',args)),
      keywords:parseCsv(arg('--keywords',args)),
      states:parseCsv(arg('--states',args))
    };
    console.log(JSON.stringify({registry:registryPath,query,results:retrievePatterns(readJson(registryPath),query)},null,2));
  } else {
    throw new Error(usage());
  }
}
