#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { paths, read, write, safePath, phases, systemDigest, buildDigest, reviewDigest, effectiveTokens, validateTokens, nonempty } from './lib/core.mjs';
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
  } else if(command==='fingerprint') {
    const scope=arg('--scope','components');
    if(!['system','components','screens','review'].includes(scope))throw new Error('scope: system/components/screens/review');
    console.log(scope==='system'?systemDigest(root):scope==='review'?reviewDigest(root):buildDigest(root,scope));
  } else if(command==='export-tokens') {
    // 추출한 시스템 토큰 + 컴포넌트 확장을 병합해 파생 산출물을 만든다. 확장 파일이 있으면 병합한다.
    const hasExtension=existsSync(safePath(root,paths.extensions));
    const t=hasExtension?effectiveTokens(root):read(root,paths.tokens),errors=validateTokens(t);
    if(errors.length)throw new Error(errors.join('\n'));
    write(root,'design/03-design-rules/tokens/generated/tokens.resolved.json',t);
    const css=['/* GENERATED: edit tokens.json (extracted) or token-extensions.json */',':root {'];
    for(const [name,token] of Object.entries(t.semantic)) {const p=t.primitives[token.ref];css.push(`  --${name}: ${p.value}${p.type==='FLOAT'?'px':''};`);}
    css.push('}');
    const p=safePath(root,'design/03-design-rules/tokens/generated/tokens.css');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,css.join('\n')+'\n');
    console.log('토큰 JSON/CSS 생성 완료 (generated/는 원본 아님)');
  } else if(command==='save-snapshot') {
    // Figma 플러그인(op:extract) 결과를 정식 스냅샷 경로에 저장한다. 붙여넣기 실수를 줄이는 헬퍼.
    const stage=arg('--stage');
    const targets={'extract-system':paths.systemSnapshot,components:paths.componentSnapshot,screens:paths.screenSnapshot};
    if(!targets[stage]) throw new Error('--stage extract-system|components|screens 필요');
    const from=arg('--from');
    const src=safePath(root,from);
    if(!existsSync(src)) throw new Error(`--from 파일 없음: ${from}`);
    let snap;
    try{snap=JSON.parse(readFileSync(src,'utf8'));}catch(e){throw new Error(`스냅샷 JSON 파싱 실패: ${e.message}`);}
    if(snap.schemaVersion!==1) throw new Error('스냅샷 schemaVersion은 1이어야 함');
    if(snap.stage!==stage) throw new Error(`스냅샷 stage 불일치: 파일=${snap.stage}, 요청=${stage}`);

    const scope=arg('--scope',null);
    if(scope) {
      if(stage!=='screens') throw new Error('--scope은 stage=screens에서만 지원');
      const rootId=arg('--root');
      const scopedFrame=Array.isArray(snap.frames) ? snap.frames.find(f=>f.id===rootId) : null;
      if(!scopedFrame) throw new Error(`scoped snapshot root frame 없음: ${rootId}`);
      if(!Array.isArray(scopedFrame.nodes) || !scopedFrame.nodes.length)
        throw new Error(`scoped snapshot root가 비어 있음: ${rootId}`);
      const to=arg('--to',`design/04-screens/scoped/${scope}.json`);
      write(root,to,{...snap,scope:{name:scope,rootId},complete:false,frames:[scopedFrame]});
      console.log(`scoped snapshot 저장: ${to} (root=${rootId}). 저장 후 semantic coverage gate로 검증하세요.`);
    } else {
      if(snap.complete!==true) throw new Error('불완전한 스냅샷(complete!==true). 전체 canonical snapshot은 merge 후 저장하거나 --scope/--root로 scoped snapshot을 저장');
      write(root,targets[stage],snap);
      console.log(`스냅샷 저장: ${targets[stage]}. 이제 npm run check -- --phase ${stage} 로 판정하세요. (저장은 검증이 아닙니다.)`);
    }
  } else if(command==='assets-list') {
    console.log(JSON.stringify({source:'local-character',files:characterFiles(root,read(root,paths.config))},null,2));
  } else if(command==='doctor') {
    const c=read(root,paths.config);
    const local={node:process.versions.node,nodeSupported:Number(process.versions.node.split('.')[0])>=18,agents:existsSync(safePath(root,'AGENTS.md')),skills:existsSync(safePath(root,'.agents/skills')),figmaPlugin:existsSync(safePath(root,'scripts/figma-plugin/manifest.json')),figmaFileKeyConfigured:nonempty(c.figma?.fileKey),extractPagesConfigured:Array.isArray(c.extractPages)&&c.extractPages.length>0,runtimeTools:'NOT_PROBED: Figma 데스크탑에 플러그인(scripts/figma-plugin/manifest.json)을 설치했는지 확인하세요. 로컬 CLI는 플러그인 실행/연결을 판정하지 않습니다.'};
    console.log(JSON.stringify(local,null,2));
    if(!local.nodeSupported||!local.agents||!local.skills)process.exitCode=1;
  } else throw new Error(`명령: status, check, fingerprint, export-tokens, save-snapshot, assets-list, audit, doctor. 단계: ${phases.join(', ')}`);
} catch(err) {console.error(err.message);process.exitCode=1;}
