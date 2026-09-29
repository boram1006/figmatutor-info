#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

function arg(name,args){
  const i=args.indexOf(name);
  return i>=0?args[i+1]:null;
}
function fail(errors){
  console.error(JSON.stringify({passed:false,errors},null,2));
  process.exitCode=1;
}
function asArray(value){return Array.isArray(value)?value:[];}

const args=process.argv.slice(2);
const planPath=arg('--plan',args);
if(!planPath) throw new Error('usage: node scripts/validate-composition-plan.mjs --plan <composition-plan.json>');
const plan=JSON.parse(readFileSync(resolve(process.cwd(),planPath),'utf8'));

const regions=asArray(plan.regions?.length?plan.regions:plan);
if(!regions.length) throw new Error('composition plan regions 없음');

const allowedReuse=new Set(['INSTANCE_REUSE','CLONE_COMPOSE','NEW_CONSTRUCTION']);
const allowedScope=new Set(['LOCKED_CORE','APPROVED']);
const errors=[];

if((plan.schemaVersion||1)>=3){
  if(!plan.navigationContext || typeof plan.navigationContext!=='object')
    errors.push('schemaVersion>=3: navigationContext 필요');
  else {
    for(const key of ['depth','immediateParent','returnPath','localNavigationDecision']){
      if(!plan.navigationContext[key]) errors.push('navigationContext.'+key+' 필요');
    }
  }
  if(!plan.alignmentEvidence || typeof plan.alignmentEvidence!=='object')
    errors.push('schemaVersion>=3: alignmentEvidence 필요');
  else {
    for(const key of ['railMode','viewportWidth','contentWidth','centeringRule']){
      if(plan.alignmentEvidence[key]===undefined || plan.alignmentEvidence[key]===null || plan.alignmentEvidence[key]==='')
        errors.push('alignmentEvidence.'+key+' 필요');
    }
  }
  if(!plan.surfacePolicy || typeof plan.surfacePolicy!=='object')
    errors.push('schemaVersion>=3: surfacePolicy 필요');
  else if(!plan.surfacePolicy.groupBoundaryRule)
    errors.push('surfacePolicy.groupBoundaryRule 필요');
}

for(let i=0;i<regions.length;i++){
  const r=regions[i]||{};
  const label=r.region||r.id||`regions[${i}]`;
  for(const key of ['purpose','source','reuseMode','productScope']){
    if(r[key]===undefined||r[key]===null||r[key]==='') errors.push(`${label}: ${key} 필요`);
  }
  if(r.reuseMode&&!allowedReuse.has(r.reuseMode))
    errors.push(`${label}: reuseMode 불가값 ${r.reuseMode}`);

  const scopes=Array.isArray(r.productScope)?r.productScope:[r.productScope];
  for(const scope of scopes.filter(Boolean)){
    const normalized=typeof scope==='string'?scope:(scope.status||scope.type||'');
    if(normalized&&!allowedScope.has(normalized))
      errors.push(`${label}: 승인되지 않은 productScope ${normalized}`);
  }

  if(r.reuseMode==='NEW_CONSTRUCTION'){
    const ev=r.visualEvidence||{};
    for(const key of ['typography','spacing','surface','radius']){
      if(!ev[key]) errors.push(`${label}: NEW_CONSTRUCTION visualEvidence.${key} 필요`);
    }
  }

  const ext=r.externalSource||null;
  if(ext){
    if(!['STITCH','IMAGE','OTHER'].includes(ext.type))
      errors.push(`${label}: externalSource.type은 STITCH/IMAGE/OTHER 중 하나`);
    const kept=new Set(asArray(ext.keep));
    const forbidden=['font','typography','spacing','css-spacing','radius','color-system','shell','navigation-shell','component-style'];
    for(const x of forbidden){
      if(kept.has(x)) errors.push(`${label}: externalSource.keep에 금지된 visual truth 포함: ${x}`);
    }
    if(ext.type==='STITCH'){
      const mustTranslate=['typography','spacing','surface','radius'];
      const translated=new Set(asArray(ext.translateWithProductGrammar));
      for(const x of mustTranslate){
        if(!translated.has(x)) errors.push(`${label}: Stitch 사용 시 translateWithProductGrammar에 ${x} 필요`);
      }
    }
  }

  if(r.source&&typeof r.source==='object'){
    const sourceType=r.source.type||'';
    if(sourceType==='FIGMA' && !r.source.nodeId && !r.source.selector)
      errors.push(`${label}: FIGMA source는 nodeId 또는 selector 필요`);
  }
}

if(errors.length) fail(errors);
else console.log(JSON.stringify({passed:true,plan:planPath,regions:regions.length},null,2));
