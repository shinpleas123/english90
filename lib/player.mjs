import {say,britishVoice,analyseBlob} from './audio.mjs';
import {all,get,saveClip} from './store.mjs';
import {esc,btn,errorText} from './ui.mjs';
export async function mountPlayer(host,{lesson,model,hideText=false,scaffold=false}){
  let shown=!hideText,stopAt=null,token=0,lastUrl=null,localUrl=null;
  const stored=(await all('clips')).filter(c=>c.role==='model'&&c.text===lesson.script).sort((a,b)=>b.at-a.at)[0];
  if(stored){const data=await get('audio',stored.id);if(data)localUrl=URL.createObjectURL(data.blob);}
  const name=(i)=>'チャンク '+(i+1);
  host.innerHTML=`<div class="panel"><h3>お手本を聞く</h3><p class="meta" data-el="voice"></p>
    <label class="field">再生する範囲<select data-el="unit"><option value="-1">全文</option>${lesson.chunks.map((_,i)=>'<option value="'+i+'">'+name(i)+'</option>').join('')}</select></label>
    <div class="bar"><label>速度 <select data-el="rate">${[.7,.85,1,1.15].map(v=>'<option value="'+v+'" '+(v===(scaffold?.85:1)?'selected':'')+'>'+v+'倍</option>').join('')}</select></label><label class="check"><input type="checkbox" data-el="repeat">3回反復</label></div>
    <div class="actions">${btn('play-model','お手本を再生','primary')}${btn('stop-model','停止')}${btn('toggle-script',shown?'原稿を隠す':'原稿を表示')}</div>
    <audio data-el="audio" preload="none"></audio><div data-el="script"></div><div data-el="feedback" role="status" class="meta"></div>
    <details><summary>自分のお手本を使う</summary><label>この原稿を読んだ、利用権のある音声<input type="file" data-el="file" accept="audio/*,.m4a,.mp3,.wav"></label><small>全文再生に使用します。チャンクは付属音声または端末の英国音声で再生します。</small></details><details><summary>教材音声の出典</summary><p class="meta">自作英文をPiperで合成。学習データは英国・アイルランド方言コーパス（© 2018, 2019 Google, Inc.）。収録MP3は CC BY-SA 4.0。<a href="./docs/AUDIO.md">音声クレジット</a></p></details></div>`;
  const el=k=>host.querySelector('[data-el="'+k+'"]');
  const audio=el('audio');
  if(scaffold)el('unit').value='0';
  function source(){
    const i=Number(el('unit').value);
    if(localUrl && i===-1)return {url:localUrl,label:'保存済みのお手本',range:null};
    if(model&&(i===-1||model.segments?.[i]))return {url:model.file,range:i===-1?null:model.segments[i],label:'教材音声 ・ 英国北部の英語（合成）'};
    const voice=britishVoice();return {url:null,label:voice?'端末の英国英語音声 ・ '+voice.name:'端末の英国音声が必要です。下の項目からお手本を読み込むこともできます。'};
  }
  function update(){
    const i=Number(el('unit').value);
    el('script').innerHTML=shown?'<p class="prose" lang="en-GB">'+esc(i===-1?lesson.script:lesson.chunks[i])+'</p>':'';
    el('voice').textContent=source().label;
    host.querySelector('[data-action=toggle-script]').textContent=shown?'原稿を隠す':'原稿を表示';
  }
  const stop=()=>{token++;audio.pause();audio.onended=null;audio.ontimeupdate=null;stopAt=null;globalThis.speechSynthesis?.cancel();};
  async function play(){
    stop();const id=token,i=Number(el('unit').value),rate=Number(el('rate').value),src=source();
    let left=el('repeat').checked?3:1;
    const once=async()=>{
      if(id!==token||!host.isConnected||left--<=0)return;
      const done=()=>{audio.onended=null;audio.ontimeupdate=null;audio.pause();if(left>0)setTimeout(()=>once().catch(fail),300);else el('feedback').textContent='再生が終わりました。';};
      if(!src.url){say(i===-1?lesson.script:lesson.chunks[i],rate,done);return;}
      if(lastUrl!==src.url){audio.src=src.url;lastUrl=src.url;}
      audio.currentTime=src.range?.[0]||0;stopAt=src.range?.[1]??null;audio.playbackRate=rate;audio.onended=done;
      audio.ontimeupdate=()=>{if(stopAt!=null&&audio.currentTime>=stopAt)done();};
      await audio.play();
    };
    el('feedback').textContent='再生中';await once();
  }
  const fail=e=>el('feedback').textContent=errorText(e);
  host.onclick=e=>{const act=e.target.closest('[data-action]')?.dataset.action;if(!act)return;e.stopPropagation();
    if(act==='play-model')play().catch(fail);
    if(act==='stop-model'){stop();el('feedback').textContent='停止しました。';}
    if(act==='toggle-script'){shown=!shown;update();}
  };
  let importing=false;
  host.onchange=async e=>{
    const input=e.target;
    try{
      if(input===el('file')&&input.files[0]){
        importing=true;const b=input.files[0],analysis=await analyseBlob(b);
        await saveClip({day:lesson.day,role:'model',purpose:'lesson',text:lesson.script,input:'file',label:lesson.title,analysis},b);
        stop();if(localUrl)URL.revokeObjectURL(localUrl);localUrl=URL.createObjectURL(b);el('feedback').textContent='お手本を端末に保存しました。';
      }
      if(input===el('unit'))stop();update();
    }catch(e){fail(e);}finally{importing=false;}
  };
  update();return {locked:()=>importing,dispose(){stop();if(localUrl)URL.revokeObjectURL(localUrl);host.onclick=null;host.onchange=null;}};
}
