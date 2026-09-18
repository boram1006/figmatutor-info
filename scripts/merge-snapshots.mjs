#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
const args=process.argv.slice(2),at=args.indexOf('--output');
try{
 if(at<0||!args[at+1])throw new Error('node scripts/merge-snapshots.mjs batch1.json batch2.json --output snapshot.json');
 const files=args.slice(0,at);if(!files.length)throw new Error('배치 파일 필요');
 const batches=files.map(f=>JSON.parse(readFileSync(f,'utf8'))),first=batches[0];
 const stable=x=>JSON.stringify(x);
 for(const b of batches)for(const k of ['schemaVersion','fileKey','stage','inputDigest','pageId','expectedFrameIds','variables','textStyles'])if(stable(b[k])!==stable(first[k]))throw new Error(`배치 입력/토큰 변경: ${k}. 전체 재추출 필요`);
 const frames=batches.flatMap(b=>b.frames),ids=frames.map(f=>f.id);
 if(new Set(ids).size!==ids.length || ids.length!==first.expectedFrameIds.length || first.expectedFrameIds.some(id=>!ids.includes(id)))throw new Error('프레임 중복 또는 누락');
 const merged={...first,capturedAt:new Date().toISOString(),complete:true,frames};
 writeFileSync(args[at+1],JSON.stringify(merged,null,2)+'\n');
 console.log(`병합 완료: ${frames.length}개 프레임`);
}catch(err){console.error(err.message);process.exitCode=1;}
