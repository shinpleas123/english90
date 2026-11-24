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
  for(const e of [...events].sort((a,b)=>a.at-b.at)){
    if(e.kind==='review'){
      const w=key(e.word),item=result.get(w);
      if(item){schedule(item,e.success,e.date);item.source=e.success?'録音の自己確認':'自己申告';}
      else if(w&&!e.success)result.set(w,{word:w,due:plusDays(e.date,1),last:e.date,misses:1,streak:0,source:'自己申告'});
    }
    if(e.kind!=='assess')continue;
    const seen=new Set();
    for(const w of e.result.words){
      const name=key(w.word);if(!name||seen.has(name)||w.errorType==='Insertion')continue;
      seen.add(name);
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
  return events.filter(e=>e.kind==='assess'&&e.id!==event.id&&e.at<event.at&&e.result.locale===event.result.locale&&e.result.provider===event.result.provider&&e.purpose===event.purpose&&e.input===event.input&&e.result.referenceText===event.result.referenceText);
}
export const displayScore=x=>Number.isFinite(x)?String(Math.round(x)):'未測定';
