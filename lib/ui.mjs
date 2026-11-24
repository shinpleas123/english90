export const esc = x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const btn=(action,label,cls='',extra='')=>`<button type="button" data-action="${esc(action)}" class="${cls}" ${extra}>${esc(label)}</button>`;
export function notice(message){
  const box=document.querySelector('#notice'); box.textContent=message;box.hidden=false;clearTimeout(notice.timer);
  notice.timer=setTimeout(()=>box.hidden=true,8000);
}
export function errorText(error){return error?.name==='QuotaExceededError'?'端末の空き容量が不足しています。バックアップ後に古い録音を削除してください。':error?.message||String(error);}
export const time=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const paths={
 home:'<path d="m3 10 9-7 9 7v10H4V10"/><path d="M9 20v-7h6v7"/>',
 studio:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',
 review:'<path d="M4 6v5h5M4.5 10a8 8 0 1 1 .7 6"/><path d="M12 8v4l3 2"/>',
 history:'<path d="M4 20V4m0 16h16M8 16v-4m5 4V7m5 9v-7"/>',
 listen:'<path d="M4 15v-3a8 8 0 1 1 16 0v3"/><rect x="3" y="12" width="4" height="7" rx="1"/><rect x="17" y="12" width="4" height="7" rx="1"/>',
 shadow:'<path d="M3 10v4m4-8v12m5-15v18m5-14v10m4-7v4"/>',
 speak:'<path d="M4 4h16v12H10l-5 4v-4H4z"/>',
 reflect:'<path d="M6 3h13v18H6zM9 8h7m-7 4h7m-7 4h4"/>',
 check:'<path d="m4 12 5 5L20 6"/>'
};
export const icon=name=>'<svg class="ic" aria-hidden="true" viewBox="0 0 24 24">'+(paths[name]||paths.studio)+'</svg>';
export function drillHTML(d,word){
  if(!d)return '<p>「'+esc(word)+'」を含む短い句を聞き、単語、句、文の順に各2回録音してください。語頭・母音・語末のうち聞こえ方が違う位置を自分で一つ選びます。</p>';
  return `<p class="prose" lang="en-GB">${esc(d.word)}　${esc(d.ipa)}</p><p>${esc(d.cue)}</p><dl><dt>舌</dt><dd>${esc(d.tongue)}</dd><dt>唇</dt><dd>${esc(d.lips)}</dd><dt>声と息</dt><dd>${esc(d.voice)}</dd></dl><p>${esc(d.contrast)}</p><p lang="en-GB">${d.pairs.map(esc).join(' ・ ')}</p><p class="prose" lang="en-GB">${esc(d.phrase)}<br>${esc(d.sentence)}</p><ol>${d.steps.map(v=>'<li>'+esc(v)+'</li>').join('')}</ol><p>${esc(d.check)}</p><a href="${esc(d.source)}" target="_blank" rel="noopener noreferrer">英国式発音の辞書見本</a>`;
}
export function plot(series){
  let line='';let active=false;
  series.forEach((p,i)=>{if(!Number.isFinite(p.st)){active=false;return;}const x=3+i/Math.max(1,series.length-1)*294,y=40-Math.max(-12,Math.min(12,p.st))*3;line+=(active?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)+' ';active=true;});
  return '<svg viewBox="0 0 300 80" preserveAspectRatio="none" aria-label="有声区間の相対ピッチ曲線" role="img"><path d="M0 40H300" stroke="#b0c1b5" stroke-dasharray="3 3"/><path d="'+line+'" fill="none" stroke="#196650" stroke-width="2"/></svg>';
}
export function acoustic(a,text,scripted){
  if(!a)return '';
  const f=v=>Number.isFinite(v)?v.toFixed(1):'未測定';
  const estimate=scripted&&a.duration>0?Math.round((text.match(/[a-z]+(?:['’-][a-z]+)*/gi)||[]).length*60/a.duration):null;
  return `<p>録音長 ${f(a.duration)} 秒 ・ F0中央値（推定） ${a.medianHz?Math.round(a.medianHz)+' Hz':'推定不能'}</p>
  <p class="meta">${estimate!==null?'全原稿を読んだ場合の参考速度 '+estimate+' 語/分。':'自由発話の語数・速度は未測定。'}内部の低音量区間（推定） ${a.pauses?.length??0} 回。最大フレーム音量 ${f(a.peakDb)} dBFS。</p>
  ${a.pauses?.length?'<p class="meta">'+a.pauses.map(p=>f(p.start)+'秒から '+f(p.length)+'秒').join('、')+'</p>':''}
  ${a.medianHz?'<figure>'+plot(a.contour||[])+'<figcaption>横軸は各録音の全長、中央線は話者自身の中央値。縦軸 ±12 半音。空白は音高推定不能。</figcaption></figure>':''}`;
}
