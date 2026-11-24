import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,makePlan,baseline,checkpoints} from '../content/curriculum.mjs';
import {DRILLS,getDrill} from '../content/drills.mjs';
import {programmeDay,dictation,reviewItems,scorePeers} from '../lib/derive.mjs';
import {analyseSamples} from '../lib/audio.mjs';
test('90 original daily tasks with complete full and short plans',()=>{
  assert.equal(lessons.length,90);
  for(const field of ['title','script','cue','prompt','question'])assert.equal(new Set(lessons.map(l=>l[field])).size,90);
  for(const l of lessons){
    assert.equal(l.script,l.chunks.join(' '));assert.ok(l.options[l.answer]);assert.equal(new Set(l.options).size,3);
    for(const short of [true,false]){
      const plan=makePlan(l.day,short);
      assert.equal(plan.reduce((s,t)=>s+t.minutes,0),short?15:60);
      for(const t of plan){for(const k of ['objective','material','steps','assessment','success','review'])assert.ok(t[k]?.length);}
    }
  }
  const days=[1,7,14,21,28,30,35,42,49,56,60,63,70,77,84,90];
  assert.deepEqual(Object.keys(checkpoints).map(Number),days);
  assert.equal(new Set([baseline,...Object.values(checkpoints),...lessons.map(l=>l.script)]).size,107);
});
test('British articulatory guidance, minimal pairs and lookup',()=>{
  assert.ok(Object.keys(DRILLS).length>=5);
  for(const word of ['growth','world','work','Thursday','households']){const d=getDrill(word);for(const k of ['ipa','tongue','lips','voice','pairs','phrase','sentence','steps','source'])assert.ok(d[k].length);}
  assert.equal(getDrill('constructor'),null);
});
test('course dates, edit-distance dictation and repetition schedule',()=>{
  assert.equal(programmeDay('2026-11-28','2026-11-28'),1);assert.equal(programmeDay('2026-11-28','2027-02-26'),91);
  assert.equal(dictation('It’s Thursday.',"it's THURSDAY"),100);assert.equal(dictation('One two three','one three'),67);assert.equal(dictation('one two','one two three'),50);assert.equal(dictation('hello',''),null);
  const assessment={kind:'assess',date:'2026-11-28',at:1,result:{words:[{word:'growth',accuracy:55},{word:'work',accuracy:null}]}};
  assert.deepEqual(reviewItems([assessment]).map(w=>[w.word,w.due]),[['growth','2026-11-29']]);
  const review={kind:'review',date:'2026-11-29',at:2,word:'growth',success:true};
  assert.equal(reviewItems([review,assessment])[0].due,'2026-12-02');
  const common={kind:'assess',purpose:'baseline',input:'mic',result:{referenceText:'Read this.',locale:'en-GB',provider:'Azure'}};
  assert.equal(scorePeers({...common,id:'new',at:5},[{...common,id:'x',at:1},{...common,purpose:'fresh',at:2},{...common,input:'file',at:3}]).length,1);
});
test('real samples produce centred pitch and internal pauses; silence yields no voiced estimates',()=>{
  const rate=8000;const source=Float32Array.from({length:rate*2},(_,i)=>(i/rate>.6&&i/rate<1.1)?0:.35*Math.sin(2*Math.PI*200*i/rate));
  const a=analyseSamples(source,rate);assert.ok(Math.abs(a.medianHz-200)<5);assert.ok(a.pauses.some(p=>p.length>=.35));
  assert.ok(a.contour.filter(p=>p.st!=null).every(p=>Math.abs(p.st)<1));
  assert.equal(analyseSamples(new Float32Array(rate),rate).medianHz,null);
});
