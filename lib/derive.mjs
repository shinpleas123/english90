import {localDate} from './store.mjs';
export function programmeDay(start,today=localDate()){
  return Math.floor((Date.parse(today+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)+1;
}
export function plusDays(date,n){return new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);}
export function words(text){return String(text).toLowerCase().replace(/[’‘]/g,"'").match(/[a-z0-9]+(?:'[a-z]+)*/g)||[];}
// Word error rate with insertions, substitutions and deletions; percent bounded at zero.
export function dictation(reference,typed){
  const a=words(reference),b=words(typed);
  if(!a.length||!b.length)return null;
  let prev=b.map((_,i)=>i+1);prev.unshift(0);
  for(let i=1;i<=a.length;i++){
    const next=[i];
    for(let j=1;j<=b.length;j++)next.push(Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+Number(a[i-1]!==b[j-1])));
    prev=next;
  }
  return Math.max(0,Math.round(100*(1-prev[b.length]/a.length)));
}
export function reviewItems(events){
  const result=new Map();
  const key=s=>words(s).join(' ');
  const schedule=(item,success,date)=>{
    item.streak=success?item.streak+1:0;
    if(!success)item.misses++;
    item.due=plusDays(date,[1,3,7,14,30][Math.min(item.streak,4)]);item.last=date;
  };
  const graded=new Set();
  for(const e of [...events].sort((a,b)=>a.at-b.at)){
    if(e.kind==='review'){
      const w=key(e.word),item=result.get(w);
      if(item){schedule(item,e.success,e.date);item.source=e.success?'録音の自己確認':'自己申告';}
      else if(w&&!e.success)result.set(w,{word:w,due:plusDays(e.date,1),last:e.date,misses:1,streak:0,source:'自己申告'});
    }
    if(e.kind!=='assess')continue;
    if(e.clipId){
      const interval=JSON.stringify([e.clipId,e.result.start,e.result.end,e.result.referenceText]);
      if(graded.has(interval))continue;
      graded.add(interval);
    }
    const evidence=new Map();
    for(const w of e.result.words){
      const name=key(w.word);
      if(!name||w.errorType==='Insertion'||(w.accuracy==null&&w.errorType!=='Omission'))continue;
      const prior=evidence.get(name);
      if(!prior||w.errorType==='Omission'||(prior.errorType!=='Omission'&&w.accuracy<prior.accuracy))evidence.set(name,w);
    }
    for(const [name,w] of evidence){
      const missed=w.errorType==='Omission',weak=missed||(w.accuracy!=null && w.accuracy<80);
      if(!weak&&!result.has(name))continue;
      const item=result.get(name)||{word:name,misses:0,streak:0};
      if(w.accuracy==null&&!missed)continue;
      item.score=w.accuracy;item.source=missed?'Azure 読み落とし':'Azure 単語精度';schedule(item,!weak,e.date);result.set(name,item);
    }
  }
  return [...result.values()].sort((a,b)=>a.due.localeCompare(b.due)||b.misses-a.misses);
}
export function scorePeers(event,events){
  return events.filter(e=>e.kind==='assess'&&e.id!==event.id&&(!event.clipId||e.clipId!==event.clipId)&&e.at<event.at&&e.result.locale===event.result.locale&&e.result.provider===event.result.provider&&e.purpose===event.purpose&&e.input===event.input&&e.result.referenceText===event.result.referenceText);
}
const focusExercises=[
  ['精聴','listen','回答した後、条件を表す語を一つ書き取り、その語で結論がどう変わるか説明する。'],
  ['即興スピーキング','speak','要点と根拠を一つずつメモし、30秒で話す。聞き返して両方が伝わるか確かめる。'],
  ['母音','pronounce','work と walk を録音し、母音だけを手掛かりに区別できるか聞き返す。'],
  ['子音','pronounce','growth と gross を交互に録音し、語末を保ったまま slower growth に戻す。'],
  ['単語強勢','pronounce','a REcord と to reCORD を一文ずつ録音し、どちらの音節が目立つか聞く。'],
  ['弱形','pronounce','to review を一息で言い、to を短く弱めても review が明瞭に聞こえるか録音で確認する。'],
  ['文のリズム','pronounce','今日の一文で意味を担う二語に印を付け、間の機能語を短くして二度録る。'],
  ['イントネーション','pronounce','同じ文を報告と聞き返しのつもりで一度ずつ録り、最後の焦点語の音調を聴き比べる。'],
  ['英文音読','pronounce','意味の切れ目を一か所選んで一文を録り、聞き手が条件と結論を区別できるか確かめる。']
];
export function practiceFromRatings(events,today,task){
  const checks=events.filter(e=>e.kind==='check'&&e.date<today).sort((a,b)=>b.at-a.at);
  const candidates=focusExercises.filter(([skill,group])=>group===task&&
    checks.find(e=>e.ratings?.[skill]&&e.ratings[skill]!=='未測定')?.ratings[skill]==='要練習');
  if(!candidates.length)return null;
  const index=Math.floor(Date.parse(today+'T00:00:00Z')/86400000)%candidates.length;
  const [skill,,exercise]=candidates[index];
  return {skill,exercise};
}
export const displayScore=x=>Number.isFinite(x)?String(Math.round(x)):'未測定';
