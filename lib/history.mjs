import {esc,btn,time} from './ui.mjs';
import {reviewItems,displayScore,plusDays} from './derive.mjs';
import {assessmentHTML} from './studio.mjs';
export function historyView(host,{events,clips,today}){
  const newest=[...events].sort((a,b)=>b.at-a.at);
  const times=events.filter(e=>['task','legacyTime'].includes(e.kind));
  const listens=newest.filter(e=>e.kind==='listen'&&e.first!==false&&e.conditions?.independent),scores=newest.filter(e=>e.kind==='assess'),reviews=reviewItems(events),quiz=listens.filter(e=>e.dictation!=null);
  const avg=xs=>xs.length?Math.round(xs.reduce((s,v)=>s+v,0)/xs.length)+'%':'未測定';
  const days=[...new Set(times.map(e=>e.date))].sort().reverse();
  const sum=list=>list.reduce((s,v)=>s+(v.seconds||0),0);
  const completed=events.filter(e=>e.kind==='task'&&e.completed);
  const comparison=purpose=>{
    const attempts=scores.filter(e=>e.purpose===purpose);
    if(!attempts.length)return '未測定';
    return attempts.slice(0,5).map(e=>'Day '+esc(e.day)+' ・ '+esc(e.date)+' ・ 精度 '+displayScore(e.result.accuracy)+' / 流暢性 '+displayScore(e.result.fluency)+' ・ '+esc(e.result.referenceText.split(/\s+/).length)+'語の採点区間').join('<br>');
  };
  host.innerHTML=`<p class="eyebrow">学習の記録</p><h1>学習実績</h1><div class="board"><div><small>累計時間</small><strong>${Math.round(sum(times)/60)} 分</strong></div><div><small>学習した日</small><strong>${days.length} 日</strong></div><div><small>完了した課題</small><strong>${completed.length} 件</strong></div></div>
  <h2>直近7日の学習時間</h2><div class="week">${Array.from({length:7},(_,i)=>{const d=plusDays(today,i-6),sec=sum(times.filter(e=>e.date===d));return '<div class="'+(sec?'studied':'')+'"><small>'+esc(d.slice(5))+'</small><strong>'+Math.round(sec/60)+'分</strong></div>';}).join('')}</div>
  <h2>聞き取りと復習</h2><div class="board"><div><small>内容理解・初回</small><strong>${avg(listens.map(e=>e.correct?100:0))}</strong></div><div><small>書き取り・初回</small><strong>${avg(quiz.map(e=>e.dictation))}</strong></div><div><small>復習で改善確認</small><strong>${reviews.length?Math.round(reviews.filter(w=>w.streak>0).length*100/reviews.length)+'%':'未測定'}</strong></div></div><p class="meta">全文を1倍で一度再生し、原稿を先に表示せず初回答した記録が対象です。内容理解の正答率（${listens.length}問）。書き取りは編集距離から計算（${quiz.length}問）。復習には録音の自己確認も含みます。</p>
  <details><summary>精聴の回答履歴</summary>${newest.filter(e=>e.kind==='listen').map(e=>'<p>Day '+esc(e.day)+' ・ '+esc(e.date)+' ・ '+(e.correct?'正解':'不正解')+' ・ '+(e.first&&e.conditions?.independent?'初回・標準条件':'練習条件')+(e.dictation!=null?' ・ 書き取り '+esc(e.dictation)+'%':'')+'</p>').join('')||'<p>回答はまだありません。</p>'}</details>
  <h2>定点評価</h2><div class="panel"><h3>同じ原稿での変化</h3><p>${comparison('baseline')}</p><h3>初見の比較原稿</h3><p>${comparison('fresh')}</p><small>新しい原稿は難易度が異なります。日付の違う初見原稿の素点差は参考値です。数値はAzureの区間評価です。</small></div>
  ${newest.filter(e=>e.kind==='check').map(e=>'<details><summary>Day '+esc(e.day)+' 自己評価 ・ '+esc(e.date)+'</summary>'+Object.entries(e.ratings||{}).map(([k,v])=>'<p>'+esc(k)+'　'+esc(v)+'</p>').join('')+'</details>').join('')}
  <h2>音読の推移</h2>${['baseline','fresh'].map(group=>{const list=clips.filter(c=>c.role==='learner'&&c.purpose===group).sort((a,b)=>b.at-a.at);return '<details><summary>'+(group==='baseline'?'固定原稿':'初見原稿')+'の録音 ・ '+list.length+' 件</summary>'+list.map(c=>'<p>Day '+esc(c.day)+' ・ '+esc(c.date)+' ・ '+esc(c.input==='mic'?'マイク':'ファイル')+' ・ 録音 '+Number(c.analysis.duration).toFixed(1)+' 秒 ・ 低音量区間 '+c.analysis.pauses.length+' 回 ・ 原稿語数換算 '+Math.round(c.text.split(/\s+/).length*60/c.analysis.duration)+' 語/分</p>').join('')+'<small>語数換算は全文を読んだ場合の推定です。実際の発話語数・音節境界は未測定です。</small></details>';}).join('')}
  <h2>採点履歴</h2>${scores.map(e=>'<details><summary>'+esc(e.date)+' ・ Day '+esc(e.day)+' ・ 精度 '+displayScore(e.result.accuracy)+'</summary>'+assessmentHTML(e,events)+'</details>').join('')||'<p>未測定です。</p>'}
  ${newest.filter(e=>e.kind==='legacyScore').map(e=>'<details><summary>旧版 '+esc(e.date)+' ・ 精度 '+displayScore(e.accuracy)+'</summary><p>'+esc(e.text)+'</p></details>').join('')}
  <h2>保存した録音</h2><div class="list">${[...clips].sort((a,b)=>b.at-a.at).map(c=>'<div class="row"><div><strong>'+esc(c.label)+'</strong><p class="meta">'+esc(c.role==='model'?'お手本':'自分の録音')+' ・ '+esc(c.date)+' ・ '+time(c.analysis.duration)+'</p></div><div class="bar">'+btn('open-clip','開く','','data-id="'+esc(c.id)+'"')+btn('delete-clip','削除','danger','data-id="'+esc(c.id)+'"')+'</div></div>').join('')||'<p>保存した録音はまだありません。</p>'}</div>
  <h2>日別の実績</h2>${days.map(d=>{const items=times.filter(e=>e.date===d);return '<details><summary>'+esc(d)+' ・ '+time(sum(items))+'</summary>'+items.map(e=>'<p>'+esc(e.name||e.task)+' ・ '+time(e.seconds)+' '+esc(e.note||'')+'</p>').join('')+'</details>';}).join('')||'<p>学習を終了すると、ここに記録されます。</p>'}`;
}
