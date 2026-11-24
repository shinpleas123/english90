import {all,get,saveClip,recordEvent} from './store.mjs';
import {analyseBlob,startMicrophone,say} from './audio.mjs';
import {assessRecording} from './speech.mjs';
import {getDrill} from '../content/drills.mjs';
import {esc,btn,notice,errorText,acoustic,drillHTML} from './ui.mjs';
import {scorePeers,displayScore} from './derive.mjs';

export function assessmentHTML(e,events){
  const r=e.result,prev=scorePeers(e,events).sort((a,b)=>b.at-a.at)[0];
  const low=r.words.filter(w=>w.errorType==='Omission'||(w.accuracy!=null&&w.accuracy<80&&w.errorType!=='Insertion'));
  const unique=[...new Map(low.map(w=>[w.word.toLowerCase(),w])).values()];
  const labels={Omission:'読み落とし',Insertion:'追加語',Mispronunciation:'発音を要確認',None:''};
  return `<h3>Azure の採点結果</h3><p class="meta">en-GB ・ ${esc(e.date)} ・ 対象区間 ${r.start.toFixed(2)}–${r.end.toFixed(2)} 秒</p><p lang="en-GB">${esc(r.referenceText)}</p>
  <div class="board">${[['精度',r.accuracy],['流暢性',r.fluency],['完全性',r.completeness],['総合',r.pronunciation]].map(([k,v])=>'<div><small>'+k+'</small><strong>'+displayScore(v)+'</strong></div>').join('')}</div>
  <p>${prev?'同一原稿・入力方法・課題・評価方式の前回精度 '+displayScore(prev.result.accuracy)+'（'+esc(prev.date)+'）':'比較できる同一条件の前回評価はまだありません。'}</p>
  <details><summary>単語・音素別の内訳（${r.words.length}語）</summary>${r.words.map(w=>'<p><b>'+esc(w.word)+'</b>　'+displayScore(w.accuracy)+' '+esc(labels[w.errorType]??w.errorType??'')+(Number.isFinite(w.durationSeconds)?' ・ '+w.durationSeconds.toFixed(2)+' 秒':'')+'<br><small>'+w.phonemes.map((p,i)=>esc(p.name||('音素'+(i+1)+'・名称特定不可'))+' '+displayScore(p.accuracy)).join(' / ')+'</small></p>').join('')}</details>
  <p class="meta">英国英語の音素名とProsodyは特定できません。以下は語単位の結果から選んだ練習候補です。</p>
  ${unique.map(w=>'<details><summary>'+esc(w.word)+' の矯正練習</summary>'+drillHTML(getDrill(w.word),w.word)+'</details>').join('')}`;
}
export async function mountStudio(host,opts){
  let clip=opts.clip||null, rec=null, busy=false, disposed=false, safetyTimer;
  const urls=[];
  const objectURL=b=>{const u=URL.createObjectURL(b);urls.push(u);return u;};
  const defaultText=opts.text||'';
  let draft=clip?.text??defaultText;
  let lastResult=null, exampleAudio=null;
  const eligible=opts.purpose!=='free'&&opts.purpose!=='shadow-free';
  const modelAllowed=eligible&&!['fresh','baseline'].includes(opts.purpose);
  const label=opts.label||'発音練習';
  function setBusy(v){busy=v;host.querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=v);}
  async function draw(){
    if(disposed)return;
    for(const u of urls.splice(0))URL.revokeObjectURL(u);
    const b=clip?await get('audio',clip.id):null;
    const allClips=(await all('clips')).filter(c=>c.text===draft&&c.id!==clip?.id).sort((a,b)=>b.at-a.at);
    if(disposed)return;
    host.innerHTML=`<h2>${esc(label)}</h2>
    ${opts.editable?'<label class="field">読み上げ原稿<textarea data-el="draft">'+esc(draft)+'</textarea></label>':(!opts.hideScript&&draft?'<p class="prose" lang="en-GB">'+esc(draft)+'</p>':'')}
    <div class="actions">${btn('mic','録音を開始','primary')}${btn('micstop','録音を停止','','disabled')}${modelAllowed?btn('speak','お手本を聞く'):''}</div>
    <details><summary>音声ファイルを読み込む</summary><label>自分の録音（M4A・MP3・WAVなど）<input type="file" data-file="learner" accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.mp4"></label></details>
    <p data-el="state" role="status" class="meta">録音はこの端末に保存されます。</p>
    ${clip&&b?`<div class="panel"><h3>自分の録音</h3><p class="meta">${esc(clip.date)} ・ ${esc(clip.input==='mic'?'マイク':'ファイル')} ・ ${esc(clip.label)}</p><audio controls src="${objectURL(b.blob)}"></audio>${acoustic(clip.analysis,clip.text,eligible)}
    <label class="field">聴き比べる音声<select data-el="compare"><option value="">選択してください</option>${opts.modelFile&&clip.text===defaultText?'<option value="@model">教材付属の英国音声</option>':''}${allClips.map((c,i)=>'<option value="'+esc(c.id)+'">'+esc(c.role==='model'?'お手本':'過去の録音')+' '+esc(new Date(c.at).toLocaleString('ja-JP'))+' #'+(i+1)+'</option>').join('')}</select></label><div data-el="peer"></div>
    <details><summary>同じ原稿のお手本ファイルを保存</summary><label>利用できる権利のある音声<input type="file" data-file="model" accept="audio/*,.m4a,.mp3,.wav"></label></details>
    ${eligible?`<details ${clip.analysis.duration>30?'open':''}><summary>Azureで区間を採点</summary><p class="meta">音声と原稿をMicrosoftに送信します。30秒以内の連続した区間を再生して、実際に読んだ原稿を合わせてください。</p>
    <div class="twocol"><label>開始（秒）<input type="number" data-el="from" min="0" step="0.01" value="0"></label><label>終了（秒）<input type="number" data-el="to" min="0" step="0.01" value="${Math.min(30,Math.floor(clip.analysis.duration*100)/100)}"></label></div>
    <label class="field">区間の英文<textarea data-el="reference">${clip.analysis.duration<=30?esc(clip.text):''}</textarea></label>
    <div class="actions">${btn('sample','区間を試聴')}${btn('assess','区間を送信して採点','primary')}</div></details>`:''}
    </div>`:''}
    <div data-el="result"></div>`;
    if(clip){
      const events=await all('events');
      const result=lastResult||events.filter(e=>e.kind==='assess'&&e.clipId===clip.id).sort((a,b)=>b.at-a.at)[0];
      if(result&&!disposed)host.querySelector('[data-el=result]').innerHTML=assessmentHTML(result,events);
    }
  }
  const el=k=>host.querySelector('[data-el="'+k+'"]');
  const readDraft=()=>{if(el('draft'))draft=el('draft').value.trim();return draft;};
  const state=t=>{if(el('state'))el('state').textContent=t;};
  async function ingest(blob,role,input){
    setBusy(true);state('音声を分析して端末に保存しています。');
    try{
      const analysis=await analyseBlob(blob);
      const repeated=opts.purpose==='fresh'&&role==='learner'&&(await all('clips')).some(c=>c.day===opts.day&&c.purpose==='fresh');
      const saved=await saveClip({day:opts.day,purpose:repeated?'fresh-repeat':opts.purpose,role,text:readDraft(),input,label,analysis},blob);
      if(role==='learner'){clip=saved;lastResult=null;}
      await draw();state('音声を保存しました。');opts.onSave?.(saved);
    }finally{busy=false;}
  }
  function failure(err){busy=false;if(!disposed){setBusy(false);if(!rec)host.querySelector('[data-action=micstop]')?.setAttribute('disabled','');state(errorText(err));notice(errorText(err));}}
  async function click(event){
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action)return;
    event.stopPropagation();
    if(busy)return;
    if(rec&&action!=='micstop')return;
    try{
      if(action==='speak'){
        if(opts.modelFile&&readDraft()===defaultText){exampleAudio?.pause();exampleAudio=new Audio(opts.modelFile);await exampleAudio.play();}
        else say(readDraft());
        return;
      }
      if(action==='mic'){
        if(rec)return;
        readDraft();setBusy(true);state('マイクの許可を確認中…');
        rec=await startMicrophone(blob=>{clearTimeout(safetyTimer);rec=null;ingest(blob,'learner','mic').catch(failure);},msg=>{clearTimeout(safetyTimer);rec=null;failure(Error(msg));});
        busy=false;host.querySelector('[data-action=micstop]').disabled=false;
        safetyTimer=setTimeout(()=>{if(rec?.state==='recording')rec.stop();},590000);
        state('録音中です。読み終えたら「録音を停止」を押してください。');return;
      }
      if(action==='micstop'){if(rec?.state==='recording'){rec.stop();state('録音を保存中…');}return;}
      if(action==='assess'||action==='sample'){
        const start=Number(el('from').value),end=Number(el('to').value);
        if(!el('from').value||!el('to').value||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>clip.analysis.duration+.001||end-start>30.00001)throw Error('録音内で30秒以内の区間を選んでください。');
        if(action==='sample'){
          const a=host.querySelector('audio');a.currentTime=start;
          a.ontimeupdate=()=>{if(a.currentTime>=end){a.pause();a.ontimeupdate=null;}};await a.play();return;
        }
        setBusy(true);const creds=await opts.credentials();if(!creds)throw Error('設定でAzureのF0利用を確認し、地域とキーを入力してください。');
        if(!el('reference').value.trim())throw Error('選択した区間で読んだ英文を入力してください。');
        setBusy(true);state('Azureに送信しています。');const audio=await get('audio',clip.id);
        const result=await assessRecording({blob:audio.blob,referenceText:el('reference').value,start,end,...creds});
        await recordEvent({kind:'assess',clipId:clip.id,day:opts.day,purpose:clip.purpose,input:clip.input,result});
        await draw();busy=false;state('採点結果を保存しました。');return;
      }
    }catch(err){failure(err);}
  }
  async function change(event){
    if(rec||busy)return;
    try{
      const input=event.target;
      if(input===el('from')||input===el('to')){
        el('reference').value='';
        state('区間を変更しました。試聴して、この区間で読んだ英文を入力してください。');
      }
      if(input.dataset.file&&input.files[0])await ingest(input.files[0],input.dataset.file,'file');
      if(input===el('compare')){
        const target=el('peer');target.replaceChildren();if(!input.value)return;
        if(input.value==='@model'){
          const response=await fetch(opts.modelFile);if(!response.ok)throw Error('お手本を開けません。');
          const blob=await response.blob();const analysis=await analyseBlob(blob);
          target.innerHTML='<p>教材のお手本</p><audio controls src="'+objectURL(blob)+'"></audio>'+acoustic(analysis,draft,true);
        }else{
          const [meta,data]=await Promise.all([get('clips',input.value),get('audio',input.value)]);if(!data)return;
          target.innerHTML='<p>'+esc(meta.label)+'</p><audio controls src="'+objectURL(data.blob)+'"></audio>'+acoustic(meta.analysis,meta.text,eligible);
        }
      }
      if(input===el('draft')&&readDraft()!==clip?.text&&clip){clip=null;lastResult=null;await draw();}
    }catch(err){failure(err);}
  }
  await draw();host.addEventListener('click',click);host.addEventListener('change',change);
  return {locked:()=>Boolean(rec||busy), selected:()=>clip, dispose(){exampleAudio?.pause();disposed=true;clearTimeout(safetyTimer);host.removeEventListener('click',click);host.removeEventListener('change',change);for(const u of urls)URL.revokeObjectURL(u);}};
}
