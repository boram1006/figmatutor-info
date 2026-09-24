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
    for(const token of norm(value).split(/[^a-z0-9가-힣]+/).filter(Boolean)) out.add(token);
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


function descendantsByParent(frame){
  const children=new Map();
  for(const node of frame.nodes||[]){
    const key=node.parentId||'__ROOT__';
    if(!children.has(key)) children.set(key,[]);
    children.get(key).push(node);
  }
  return children;
}

function nodeText(node){
  if(node?.text?.characters) return String(node.text.characters);
  if(node?.type==='TEXT' && node?.name) return String(node.name);
  return '';
}

function collectSubtree(frame,root,children){
  const out=[];
  const queue=[root];
  const seen=new Set();
  while(queue.length){
    const node=queue.shift();
    if(!node || seen.has(node.id)) continue;
    seen.add(node.id);
    out.push(node);
    for(const child of children.get(node.id)||[]) queue.push(child);
  }
  return out;
}

function overlapValues(tokens,patternValues){
  const pTokens=tokenSet(patternValues||[]);
  return [...tokens].filter(token=>pTokens.has(token));
}

export function discoverPatternCandidates(registry,snapshot,{limitPerPattern=8}={}){
  const frames=Array.isArray(snapshot?.frames)?snapshot.frames:[];
  const candidates=[];

  for(const frame of frames){
    const children=descendantsByParent(frame);
    for(const node of frame.nodes||[]){
      if(!['FRAME','SECTION','COMPONENT','COMPONENT_SET'].includes(node.type)) continue;
      if(node.id===frame.id && node.type==='SECTION') continue;
      if(node.role==='prd-note') continue;

      const subtree=collectSubtree(frame,node,children);
      const descendantTexts=subtree
        .filter(n=>n.id!==node.id)
        .map(nodeText)
        .filter(Boolean);
      const nodeTokens=tokenSet([node.name||'']);
      const frameTokens=tokenSet([frame.name||'']);
      const textTokens=tokenSet(descendantTexts);
      const bounds=node.bounds||{};
      const width=Number(bounds.width||0);
      const height=Number(bounds.height||0);

      candidates.push({
        frameId:frame.id,
        frameName:frame.name,
        nodeId:node.id,
        nodeName:node.name,
        nodeType:node.type,
        parentId:node.parentId||null,
        width,
        height,
        descendantCount:Math.max(0,subtree.length-1),
        textSample:descendantTexts.slice(0,12),
        _tokens:{nodeTokens,frameTokens,textTokens}
      });
    }
  }

  const patterns=[];
  for(const pattern of registry.patterns||[]){
    const scored=[];
    for(const candidate of candidates){
      const nameMatches=overlapValues(candidate._tokens.nodeTokens,pattern.keywords);
      const frameMatches=overlapValues(candidate._tokens.frameTokens,[...(pattern.evidence||[]),...(pattern.keywords||[])]);
      const textMatches=overlapValues(candidate._tokens.textTokens,[...(pattern.keywords||[]),...(pattern.tasks||[]),...(pattern.intents||[])]);

      let score=nameMatches.length*4 + frameMatches.length*3 + textMatches.length;
      const signals=[];

      const viewportLike=candidate.width>=1000 && candidate.height>=700;
      const compactLike=candidate.width>0 && candidate.width<1000 && candidate.height>0 && candidate.height<700;

      if(pattern.id.includes('card') && compactLike){
        score+=2;signals.push('compact-geometry');
      }
      if(['persistent-step-form','evaluation-workspace','final-review-matrix','package-readiness-grid','kpi-summary-data-table'].includes(pattern.id) && viewportLike){
        score+=2;signals.push('workspace-geometry');
      }
      if(candidate.descendantCount>=3) signals.push('composite-structure');

      const hints=pattern.discoveryHints||{};
      const allCandidateTokens=new Set([
        ...candidate._tokens.nodeTokens,
        ...candidate._tokens.frameTokens,
        ...candidate._tokens.textTokens
      ]);
      const requiredMatches=overlapValues(allCandidateTokens,hints.requiredAny||[]);
      if((hints.requiredAny||[]).length && !requiredMatches.length) continue;
      if(typeof hints.minWidth==='number' && candidate.width<hints.minWidth) continue;
      if(typeof hints.maxWidth==='number' && candidate.width>hints.maxWidth) continue;
      if(typeof hints.minHeight==='number' && candidate.height<hints.minHeight) continue;
      if(typeof hints.maxHeight==='number' && candidate.height>hints.maxHeight) continue;
      if(typeof hints.minScore==='number' && score<hints.minScore) continue;
      if(score<=0) continue;

      scored.push({
        frameId:candidate.frameId,
        frameName:candidate.frameName,
        nodeId:candidate.nodeId,
        nodeName:candidate.nodeName,
        nodeType:candidate.nodeType,
        parentId:candidate.parentId,
        bounds:{width:candidate.width,height:candidate.height},
        descendantCount:candidate.descendantCount,
        textSample:candidate.textSample,
        evidence:{
          score,
          nodeNameMatches:nameMatches,
          frameMatches,
          descendantTextMatches:textMatches,
          signals,
          requiredHintMatches: requiredMatches
        },
        selectorSuggestion:{
          nodeName:candidate.nodeName,
          nodeType:candidate.nodeType,
          frameName:candidate.frameName
        },
        status:'candidate-only'
      });
    }

    scored.sort((a,b)=>
      b.evidence.score-a.evidence.score ||
      b.descendantCount-a.descendantCount ||
      String(a.nodeId).localeCompare(String(b.nodeId))
    );

    patterns.push({
      patternId:pattern.id,
      ruleRef:pattern.ruleRef,
      evidence:pattern.evidence||[],
      candidates:scored.slice(0,limitPerPattern)
    });
  }

  return {
    schemaVersion:1,
    source:{
      fileKey:snapshot?.fileKey||null,
      stage:snapshot?.stage||null,
      capturedAt:snapshot?.capturedAt||null,
      pageId:snapshot?.pageId||null,
      complete:snapshot?.complete===true
    },
    policy:{
      autoPromote:false,
      note:'후보는 registry sourceSelector로 자동 승격하지 않는다. 실제 화면 의미와 clone 범위를 검토한 뒤 selector를 수동 승인한다.'
    },
    patterns
  };
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
    '  node scripts/pattern-registry.mjs discover --snapshot <snapshot.json> [--registry <registry.json>] [--output <candidates.json>] [--limit 8]',
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
  } else if(command==='discover'){
    const snapshotArg=arg('--snapshot',args);
    if(!snapshotArg) throw new Error('--snapshot 필요\n'+usage());
    const registryPath=resolve(repoRoot,arg('--registry',args)||DEFAULT_REGISTRY);
    const snapshotPath=resolve(repoRoot,snapshotArg);
    const outputPath=resolve(
      repoRoot,
      arg('--output',args)||'design/03-design-rules/patterns/discovery-candidates.json'
    );
    const limitRaw=arg('--limit',args);
    const limit=limitRaw?Number(limitRaw):8;
    if(!Number.isInteger(limit)||limit<1) throw new Error('--limit은 1 이상의 정수');
    const result=discoverPatternCandidates(readJson(registryPath),readJson(snapshotPath),{limitPerPattern:limit});
    writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify({
      output:outputPath,
      source:result.source,
      patterns:result.patterns.map(p=>({patternId:p.patternId,candidates:p.candidates.length}))
    },null,2));
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
