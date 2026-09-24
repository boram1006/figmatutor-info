import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePatternRegistry,retrievePatterns,discoverPatternCandidates} from '../scripts/pattern-registry.mjs';

const registry={
  schemaVersion:1,
  patterns:[
    {
      id:'status-card',
      ruleRef:'Pattern 2',
      archetypes:['A4'],
      intents:['show current workflow state and next action'],
      tasks:['resume work','resubmit changed work'],
      keywords:['status card','재제출'],
      evidence:['A-01'],
      sourceSelectors:[
        {id:'pending',nodeName:'Card-PENDING',nodeType:'FRAME',preferredFor:['draft']},
        {id:'resubmit',nodeName:'Card-RESUBMIT-NEEDED',nodeType:'FRAME',preferredFor:['resubmit']}
      ]
    },
    {
      id:'evaluation',
      ruleRef:'Pattern 5',
      archetypes:['A7'],
      intents:['review artifact while entering evaluation'],
      tasks:['score','save','move next'],
      keywords:['심사','review'],
      evidence:['심사 페이지'],
      sourceSelectors:[]
    }
  ]
};

test('pattern registry resolves only exact unique snapshot matches',()=>{
  const snapshot={
    fileKey:'f',stage:'screens',capturedAt:'2026-09-25T00:00:00Z',pageId:'p',
    frames:[
      {id:'f1',name:'A-01',nodes:[
        {id:'n1',name:'Card-PENDING',type:'FRAME'},
        {id:'n2',name:'Card-RESUBMIT-NEEDED',type:'FRAME'}
      ]}
    ]
  };
  const resolved=resolvePatternRegistry(registry,snapshot);
  const status=resolved.patterns[0];
  assert.equal(status.cloneReady,true);
  assert.equal(status.resolvedSources[0].status,'resolved');
  assert.equal(status.resolvedSources[0].matches[0].nodeId,'n1');
  assert.equal(status.resolvedSources[1].matches[0].nodeId,'n2');
});

test('pattern registry refuses ambiguous or missing clone selectors',()=>{
  const snapshot={frames:[
    {id:'f1',name:'one',nodes:[{id:'n1',name:'Card-PENDING',type:'FRAME'}]},
    {id:'f2',name:'two',nodes:[{id:'n2',name:'Card-PENDING',type:'FRAME'}]}
  ]};
  const resolved=resolvePatternRegistry(registry,snapshot);
  const status=resolved.patterns[0];
  assert.equal(status.resolvedSources[0].status,'ambiguous');
  assert.equal(status.resolvedSources[1].status,'missing');
  assert.equal(status.cloneReady,false);
});

test('pattern retrieval exposes evidence and clone readiness instead of inventing a source id',()=>{
  const snapshot={frames:[{id:'f1',name:'A-01',nodes:[
    {id:'n1',name:'Card-PENDING',type:'FRAME'},
    {id:'n2',name:'Card-RESUBMIT-NEEDED',type:'FRAME'}
  ]}]};
  const resolved=resolvePatternRegistry(registry,snapshot);
  const results=retrievePatterns(resolved,{archetypes:['A4'],intent:'workflow state next action',tasks:['resubmit changed work'],states:['resubmit']});
  assert.equal(results[0].patternId,'status-card');
  assert.equal(results[0].cloneReady,true);
  assert.equal(results[0].cloneSources[0].matches[0].nodeId,'n2');
  assert.ok(results[0].matched.length>0);
});

test('reference-only pattern can match semantically without pretending it is clone-ready',()=>{
  const resolved=resolvePatternRegistry(registry,{frames:[]});
  const results=retrievePatterns(resolved,{archetypes:['A7'],keywords:['심사'],tasks:['score']});
  assert.equal(results[0].patternId,'evaluation');
  assert.equal(results[0].cloneReady,false);
  assert.deepEqual(results[0].cloneSources,[]);
});


test('pattern discovery proposes evidence-backed candidates without auto-promoting them',()=>{
  const snapshot={
    fileKey:'f',stage:'screens',capturedAt:'now',pageId:'p',complete:false,
    frames:[{
      id:'frame-a',name:'A-30_my-report-status',
      nodes:[
        {id:'screen',name:'A-30_my-report-status',type:'FRAME',parentId:null,bounds:{width:1440,height:1024}},
        {id:'card',name:'Card-RESUBMIT-NEEDED',type:'FRAME',parentId:'screen',bounds:{width:855,height:160}},
        {id:'t1',name:'재제출 필요',type:'TEXT',parentId:'card',text:{characters:'재제출 필요'},bounds:{width:80,height:20}},
        {id:'t2',name:'수정사항 제출하기 →',type:'TEXT',parentId:'card',text:{characters:'수정사항 제출하기 →'},bounds:{width:140,height:20}}
      ]
    }]
  };
  const discovered=discoverPatternCandidates(registry,snapshot,{limitPerPattern:4});
  const status=discovered.patterns.find(p=>p.patternId==='status-card');
  assert.equal(discovered.policy.autoPromote,false);
  assert.ok(status.candidates.length>0);
  assert.equal(status.candidates[0].nodeId,'card');
  assert.equal(status.candidates[0].status,'candidate-only');
  assert.equal(status.candidates[0].selectorSuggestion.nodeName,'Card-RESUBMIT-NEEDED');
  assert.ok(status.candidates[0].evidence.score>0);
});

test('pattern discovery excludes PRD notes and does not invent candidates with zero evidence',()=>{
  const snapshot={
    frames:[{
      id:'frame-a',name:'Unrelated',
      nodes:[
        {id:'prd',name:'v5 PRD',type:'FRAME',role:'prd-note',parentId:null,bounds:{width:900,height:2000}},
        {id:'generic',name:'Container',type:'FRAME',parentId:null,bounds:{width:500,height:200}},
        {id:'text',name:'hello',type:'TEXT',parentId:'generic',text:{characters:'hello'}}
      ]
    }]
  };
  const discovered=discoverPatternCandidates(registry,snapshot);
  const evaluation=discovered.patterns.find(p=>p.patternId==='evaluation');
  assert.equal(evaluation.candidates.length,0);
});


test('pattern discovery rejects tiny internal containers even when text looks relevant',()=>{
  const snapshot={
    frames:[{
      id:'f',name:'v5. 최종보고서 제출',
      nodes:[
        {id:'screen',name:'A-30_my-report-status',type:'FRAME',parentId:null,bounds:{width:1440,height:1024}},
        {id:'title',name:'Title and Action',type:'FRAME',parentId:'screen',bounds:{width:855,height:36}},
        {id:'text',name:'내 지원 현황',type:'TEXT',parentId:'title',text:{characters:'내 지원 현황'}},
        {id:'card',name:'Card-RESUBMIT-NEEDED',type:'FRAME',parentId:'screen',bounds:{width:855,height:156}},
        {id:'state',name:'재제출 필요',type:'TEXT',parentId:'card',text:{characters:'재제출 필요'}}
      ]
    }]
  };
  const discovered=discoverPatternCandidates(registry,snapshot,{limitPerPattern:8});
  const status=discovered.patterns.find(p=>p.patternId==='status-card');
  assert.equal(status.candidates[0].nodeId,'card');
  assert.equal(status.candidates.some(c=>c.nodeId==='title'),false);
});
