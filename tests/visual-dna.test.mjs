import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveVisualDna} from '../scripts/visual-dna.mjs';

function node(id,name,parentId,overrides={}){
  return {
    id,
    name,
    type:'FRAME',
    parentId,
    bounds:{width:320,height:156},
    metrics:{
      paddingTop:24,paddingRight:24,paddingBottom:24,paddingLeft:24,
      itemSpacing:12,
      topLeftRadius:16,topRightRadius:16,bottomRightRadius:16,bottomLeftRadius:16
    },
    layout:{mode:'VERTICAL'},
    fills:[{type:'SOLID',binding:{name:'background-surface'}}],
    strokes:[{type:'SOLID',binding:{name:'border-default'}}],
    effects:[],
    clipsContent:false,
    ...overrides
  };
}

test('visual DNA keeps repeated invariants and variable geometry separate',()=>{
  const snapshot={
    fileKey:'f',stage:'screens',capturedAt:'now',pageId:'p',complete:false,
    frames:[{
      id:'frame',name:'A-01',
      nodes:[
        node('card-a','Card-A',null,{bounds:{width:855,height:163}}),
        {id:'text-a',name:'Title',type:'TEXT',parentId:'card-a',textStyle:'Text/body-lg-bold'},
        node('card-b','Card-B',null,{bounds:{width:855,height:156}}),
        {id:'text-b',name:'Title',type:'TEXT',parentId:'card-b',textStyle:'Text/body-lg-bold'}
      ]
    }]
  };
  const resolved={
    patterns:[{
      id:'status-card',
      ruleRef:'Pattern 2',
      resolvedSources:[
        {selectorId:'a',status:'resolved',preferredFor:['draft'],matches:[{frameId:'frame',nodeId:'card-a'}]},
        {selectorId:'b',status:'resolved',preferredFor:['submitted'],matches:[{frameId:'frame',nodeId:'card-b'}]}
      ]
    }]
  };

  const result=deriveVisualDna(snapshot,resolved);
  const dna=result.patterns[0];
  assert.equal(dna.confidence,'REPEATED_OBSERVATION');
  assert.equal(dna.invariants.width,855);
  assert.equal(dna.invariants.paddingTop,24);
  assert.equal(dna.invariants.itemSpacing,12);
  assert.deepEqual(dna.observations.height.values,[163,156]);
  assert.equal(dna.observations.height.min,156);
  assert.equal(dna.observations.height.max,163);
  assert.equal(dna.sources[0].subtree.textStyles[0].textStyle,'Text/body-lg-bold');
});

test('visual DNA does not promote a single source to repeated evidence',()=>{
  const snapshot={
    frames:[{
      id:'f',name:'screen',
      nodes:[node('only','Only Pattern',null)]
    }]
  };
  const resolved={
    patterns:[{
      id:'single',
      currentBaselineSelectorId:'one',
      variantPolicy:{contextual:['background visual']},
      lineage:{relationship:'current-from-legacy'},
      resolvedSources:[
        {selectorId:'one',status:'resolved',matches:[{frameId:'f',nodeId:'only'}]}
      ]
    }]
  };
  const result=deriveVisualDna(snapshot,resolved);
  assert.equal(result.patterns[0].confidence,'OBSERVED_SINGLE');
  assert.equal(result.patterns[0].currentBaselineSelectorId,'one');
  assert.deepEqual(result.patterns[0].contextualVariation,{contextual:['background visual']});
  assert.deepEqual(result.patterns[0].lineage,{relationship:'current-from-legacy'});
  assert.equal(result.policy.ruleType,'evidence-only');
});

test('visual DNA ignores missing and ambiguous sources',()=>{
  const snapshot={frames:[]};
  const resolved={
    patterns:[{
      id:'none',
      resolvedSources:[
        {selectorId:'missing',status:'missing',matches:[]},
        {selectorId:'ambiguous',status:'ambiguous',matches:[{frameId:'x',nodeId:'1'},{frameId:'x',nodeId:'2'}]}
      ]
    }]
  };
  const result=deriveVisualDna(snapshot,resolved);
  assert.deepEqual(result.patterns,[]);
});
