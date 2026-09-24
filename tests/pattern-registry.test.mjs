import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePatternRegistry,retrievePatterns} from '../scripts/pattern-registry.mjs';

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
