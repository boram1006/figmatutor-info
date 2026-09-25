#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));

function readJson(path){return JSON.parse(readFileSync(path,'utf8'));}
function stable(value){return JSON.stringify(value);}
function compactObject(value){
  return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&v!==null));
}
function bindingName(binding){
  if(!binding) return null;
  if(typeof binding==='string') return binding;
  return binding.name||null;
}
function paintBindingNames(paints){
  return [...new Set((paints||[]).map(p=>bindingName(p?.binding)).filter(Boolean))].sort();
}
function subtreeNodes(frame,rootId){
  const byParent=new Map();
  for(const node of frame.nodes||[]){
    const key=node.parentId||'__ROOT__';
    if(!byParent.has(key)) byParent.set(key,[]);
    byParent.get(key).push(node);
  }
  const out=[],queue=[rootId],seen=new Set();
  while(queue.length){
    const id=queue.shift();
    if(seen.has(id)) continue;
    seen.add(id);
    const node=(frame.nodes||[]).find(n=>n.id===id);
    if(!node) continue;
    out.push(node);
    for(const child of byParent.get(id)||[]) queue.push(child.id);
  }
  return out;
}
function metricSnapshot(node){
  const metrics=node.metrics||{};
  const layout=node.layout||{};
  return compactObject({
    width:node.bounds?.width,
    height:node.bounds?.height,
    layoutMode:layout.mode,
    primaryAxisSizingMode:layout.primaryAxisSizingMode,
    counterAxisSizingMode:layout.counterAxisSizingMode,
    primaryAxisAlignItems:layout.primaryAxisAlignItems,
    counterAxisAlignItems:layout.counterAxisAlignItems,
    layoutWrap:layout.layoutWrap,
    paddingTop:metrics.paddingTop,
    paddingRight:metrics.paddingRight,
    paddingBottom:metrics.paddingBottom,
    paddingLeft:metrics.paddingLeft,
    itemSpacing:metrics.itemSpacing,
    topLeftRadius:metrics.topLeftRadius,
    topRightRadius:metrics.topRightRadius,
    bottomRightRadius:metrics.bottomRightRadius,
    bottomLeftRadius:metrics.bottomLeftRadius,
    clipsContent:node.clipsContent,
    opacity:node.opacity,
    blendMode:node.blendMode,
    fillBindings:paintBindingNames(node.fills),
    strokeBindings:paintBindingNames(node.strokes),
    effectCount:Array.isArray(node.effects)?node.effects.length:undefined
  });
}
function textStyleEvidence(nodes){
  const map=new Map();
  for(const node of nodes){
    if(node.type!=='TEXT') continue;
    const style=node.textStyle||null;
    if(!style) continue;
    map.set(style,(map.get(style)||0)+1);
  }
  return [...map.entries()]
    .map(([textStyle,count])=>({textStyle,count}))
    .sort((a,b)=>b.count-a.count||a.textStyle.localeCompare(b.textStyle));
}
function componentEvidence(nodes){
  const ids=new Map();
  for(const node of nodes){
    const id=node.instance?.mainComponentId||node.componentId||null;
    if(!id) continue;
    ids.set(id,(ids.get(id)||0)+1);
  }
  return [...ids.entries()]
    .map(([componentId,count])=>({componentId,count}))
    .sort((a,b)=>b.count-a.count||a.componentId.localeCompare(b.componentId));
}
function summarizeFields(sources){
  const keys=new Set(sources.flatMap(source=>Object.keys(source.rootMetrics)));
  const invariants={};
  const observations={};
  for(const key of [...keys].sort()){
    const values=sources
      .map(source=>source.rootMetrics[key])
      .filter(value=>value!==undefined);
    if(!values.length) continue;
    const unique=[];
    for(const value of values){
      if(!unique.some(existing=>stable(existing)===stable(value))) unique.push(value);
    }
    if(values.length===sources.length && unique.length===1){
      invariants[key]=unique[0];
    } else {
      observations[key]={
        values:unique,
        observedIn:values.length,
        totalSources:sources.length
      };
      if(unique.every(value=>typeof value==='number')){
        observations[key].min=Math.min(...unique);
        observations[key].max=Math.max(...unique);
      }
    }
  }
  return {invariants,observations};
}

export function deriveVisualDna(snapshot,resolvedRegistry){
  const frameById=new Map((snapshot.frames||[]).map(frame=>[frame.id,frame]));
  const patterns=[];

  for(const pattern of resolvedRegistry.patterns||[]){
    const sources=[];
    for(const source of pattern.resolvedSources||[]){
      if(source.status!=='resolved' || source.matches?.length!==1) continue;
      const match=source.matches[0];
      const frame=frameById.get(match.frameId);
      if(!frame) continue;
      const root=(frame.nodes||[]).find(node=>node.id===match.nodeId);
      if(!root) continue;
      const subtree=subtreeNodes(frame,root.id);
      sources.push({
        selectorId:source.selectorId,
        preferredFor:source.preferredFor||[],
        frameId:frame.id,
        frameName:frame.name,
        nodeId:root.id,
        nodeName:root.name,
        nodeType:root.type,
        rootMetrics:metricSnapshot(root),
        subtree:{
          nodeCount:subtree.length,
          textStyles:textStyleEvidence(subtree),
          componentRefs:componentEvidence(subtree)
        }
      });
    }

    if(!sources.length) continue;
    const summary=summarizeFields(sources);
    patterns.push({
      patternId:pattern.id,
      ruleRef:pattern.ruleRef,
      confidence:sources.length>=2?'REPEATED_OBSERVATION':'OBSERVED_SINGLE',
      sourceCount:sources.length,
      sourceNodeIds:sources.map(source=>source.nodeId),
      invariants:summary.invariants,
      observations:summary.observations,
      sources
    });
  }

  return {
    schemaVersion:1,
    source:{
      fileKey:snapshot.fileKey||null,
      stage:snapshot.stage||null,
      capturedAt:snapshot.capturedAt||null,
      pageId:snapshot.pageId||null,
      complete:snapshot.complete===true
    },
    policy:{
      ruleType:'evidence-only',
      note:'invariants는 선택된 source에서 동일하게 반복 관찰된 값이다. observations는 범위/차이를 보존하며 평균값을 새 규칙으로 만들지 않는다. OBSERVED_SINGLE은 전역 규칙으로 자동 승격하지 않는다.'
    },
    patterns
  };
}

function arg(name,args){
  const index=args.indexOf(name);
  return index>=0?args[index+1]:null;
}
function usage(){
  return 'node scripts/visual-dna.mjs derive --snapshot <snapshot.json> --resolved <resolved-registry.json> [--output <visual-dna.json>]';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);
  if(args[0]!=='derive') throw new Error(usage());
  const snapshotArg=arg('--snapshot',args);
  const resolvedArg=arg('--resolved',args);
  if(!snapshotArg||!resolvedArg) throw new Error(usage());
  const snapshotPath=resolve(repoRoot,snapshotArg);
  const resolvedPath=resolve(repoRoot,resolvedArg);
  const outputPath=resolve(
    repoRoot,
    arg('--output',args)||'design/03-design-rules/patterns/visual-dna.json'
  );
  const result=deriveVisualDna(readJson(snapshotPath),readJson(resolvedPath));
  writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({
    output:outputPath,
    patterns:result.patterns.map(pattern=>({
      patternId:pattern.patternId,
      confidence:pattern.confidence,
      sourceCount:pattern.sourceCount,
      invariantCount:Object.keys(pattern.invariants).length,
      observationCount:Object.keys(pattern.observations).length
    }))
  },null,2));
}
