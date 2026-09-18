#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { paths, read, write, safePath, phases, directionDigest, buildDigest, reviewDigest, effectiveTokens, validateTokens, nonempty } from './lib/core.mjs';
import { evaluate } from './lib/gates.mjs';
import {characterFiles} from './lib/assets.mjs';

const args=process.argv.slice(2), command=args[0]||'status', root=process.cwd();
function arg(name,fallback) {const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(`${name} 값 필요`);return args[i+1];}
function report(results) {
  if(args.includes('--json')) console.log(JSON.stringify({passed:results.every(r=>r.passed),nextPhase:results.find(r=>!r.passed)?.phase||null,results},null,2));
  else for(const r of results) {
    console.log(`${r.passed?'PASS':'WAIT'} ${r.phase}`);
    for(const error of r.errors) console.log(`  - ${error}`);
    if(r.blockedBy?.length) console.log(`  - 선행 단계: ${r.blockedBy.join(', ')}`);
  }
}
try {
  if(['status','check','audit'].includes(command)) {
    const phase=arg('--phase','verification');
    const results=evaluate(root,phase); report(results);
    if(!args.includes('--json')) console.log(`다음 단계: ${results.find(r=>!r.passed)?.phase||'완료'}`);
    if(command==='audit') {
      if(phase!=='verification') throw new Error('audit은 전체 검증만 지원');
      let inputDigest=null;
      try{inputDigest=reviewDigest(root);}catch{}
      write(root,paths.audit,{schemaVersion:1,auditedAt:new Date().toISOString(),inputDigest,passed:results.every(r=>r.passed),results});
    }
    if(command!=='status' && results.some(r=>!r.passed)) process.exitCode=1;
  } else if(command==='select') {
    const results=evaluate(root,'concepts');
    if(results.some(r=>!r.passed)){report(results);throw new Error('방향 선택 전 inputs/tokens/concepts 게이트 필요');}
    const conceptId=arg('--concept'),userMessage=arg('--user-message');
    if(!read(root,paths.concepts).concepts.some(c=>c.id===conceptId)||!nonempty(userMessage)) throw new Error('--concept ID --user-message "실제 사용자 선택 발언" 필요');
    write(root,paths.direction,{schemaVersion:1,conceptId,decidedBy:'user',userMessage,decidedAt:new Date().toISOString(),inputDigest:directionDigest(root)});
    console.log(`방향 선택 기록: ${conceptId}. 선택 권한의 진위는 호출자가 실제 대화로 확인해야 합니다.`);
  } else if(command==='fingerprint') {
    const scope=arg('--scope','components');
    if(!['direction','components','screens','review'].includes(scope))throw new Error('scope: direction/components/screens/review');
    console.log(scope==='direction'?directionDigest(root):scope==='review'?reviewDigest(root):buildDigest(root,scope));
  } else if(command==='export-tokens') {
    const hasSelection=existsSync(safePath(root,paths.direction));
    if(hasSelection && evaluate(root,'direction').some(r=>!r.passed))throw new Error('오래되었거나 유효하지 않은 방향 선택');
    const t=hasSelection?effectiveTokens(root):read(root,paths.tokens),errors=validateTokens(t);
    if(errors.length)throw new Error(errors.join('\n'));
    write(root,'design/03-design-rules/tokens/generated/tokens.resolved.json',t);
    const css=['/* GENERATED: edit tokens.json or selected concept overrides */',':root {'];
    for(const [name,token] of Object.entries(t.semantic)) {const p=t.primitives[token.ref];css.push(`  --${name}: ${p.value}${p.type==='FLOAT'?'px':''};`);}
    css.push('}');
    const p=safePath(root,'design/03-design-rules/tokens/generated/tokens.css');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,css.join('\n')+'\n');
    console.log('토큰 JSON/CSS 생성 완료 (generated/는 원본 아님)');
  } else if(command==='assets-list') {
    console.log(JSON.stringify({source:'local-character',files:characterFiles(root,read(root,paths.config))},null,2));
  } else if(command==='doctor') {
    const c=read(root,paths.config);
    const local={node:process.versions.node,nodeSupported:Number(process.versions.node.split('.')[0])>=18,agents:existsSync(safePath(root,'AGENTS.md')),skills:existsSync(safePath(root,'.agents/skills')),figmaFileKeyConfigured:nonempty(c.figma?.fileKey),runtimeTools:'NOT_PROBED: Codex 세션의 실제 도구 목록과 인증을 확인하세요. 로컬 CLI는 MCP 연결을 판정하지 않습니다.'};
    console.log(JSON.stringify(local,null,2));
    if(!local.nodeSupported||!local.agents||!local.skills)process.exitCode=1;
  } else throw new Error(`명령: status, check, select, fingerprint, export-tokens, assets-list, audit, doctor. 단계: ${phases.join(', ')}`);
} catch(err) {console.error(err.message);process.exitCode=1;}
