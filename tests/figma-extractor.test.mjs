import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../scripts/figma/extract-snapshot.js',import.meta.url),'utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const capturedAt='2026-09-18T00:00:00.000Z';
function fixture(shared,local,unsupported=false){
 const frame={id:'1:1',name:'Button',type:'COMPONENT',visible:true,width:100,height:44,absoluteBoundingBox:{x:0,y:0,width:100,height:44},children:[],getSharedPluginData:()=>shared,getPluginData:()=>{if(unsupported)throw new Error('figma.getPluginData is not supported in this host runtime');return local;}};
 return {fileKey:'test',root:{children:[{id:'0:1',name:'Components',children:[frame]}]},setCurrentPageAsync:async()=>{},variables:{getLocalVariableCollectionsAsync:async()=>[]},getLocalTextStylesAsync:async()=>[]};
}
async function extract(figma,extra={}){
 const config={fileKey:'test',pageName:'Components',stage:'components',inputDigest:'digest',frameIds:[],capturedAt,...extra};
 return new AsyncFunction('figma',source.replace(/const CONFIG = .*?;/,'const CONFIG = '+JSON.stringify(config)+';'))(figma);
}
test('shared metadata survives a host without private plugin data',async()=>{
 const result=await extract(fixture(JSON.stringify({componentId:'Button',tapTarget:true}),'',true));
 assert.equal(result.frames[0].nodes[0].componentId,'Button');
 assert.equal(result.frames[0].nodes[0].tapTarget,true);
});
test('legacy metadata remains readable and conflicts fail',async()=>{
 const local=JSON.stringify({componentId:'Button'});
 assert.equal((await extract(fixture('',local))).frames[0].nodes[0].componentId,'Button');
 await assert.rejects(extract(fixture('{"componentId":"Other"}',local)),/Conflicting/);
 await assert.rejects(extract(fixture('invalid','',true)),/Invalid/);
});
test('chunk transport round trips the actual extraction without losing fields',async()=>{
 const figma=fixture(JSON.stringify({componentId:'Button',tapTarget:true}),'',true);
 figma.root.children[0].children[0].name='긴 문자열'.repeat(4000);
 const expected=await extract(figma);let raw='',checksum,total;
 for(let offset=0;total===undefined||offset<total;offset+=10000){
  const part=await extract(figma,{outputOffset:offset});
  checksum??=part.checksum;total??=part.total;
  assert.equal(part.checksum,checksum);assert.equal(part.offset,offset);raw+=part.chunk;
 }
 assert.equal(raw.length,total);assert.deepEqual(JSON.parse(raw),expected);
 let hash=2166136261;for(let i=0;i<raw.length;i++)hash=Math.imul(hash^raw.charCodeAt(i),16777619)>>>0;
 assert.equal(hash.toString(16),checksum);
});
