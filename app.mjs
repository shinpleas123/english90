import {lessons,makePlan,baseline,checkpoints} from './content/curriculum.mjs';
import {narration} from './content/narration.mjs';
import {getDrill} from './content/drills.mjs';
import {all,get,saveSetting,localDate,recordEvent,migrateLegacy,deleteClip} from './lib/store.mjs';
import {programmeDay,dictation,reviewItems,plusDays} from './lib/derive.mjs';
import {esc,btn,notice,errorText,time,icon,drillHTML,acoustic} from './lib/ui.mjs';
import {mountStudio} from './lib/studio.mjs';
import {mountPlayer} from './lib/player.mjs';
import {historyView} from './lib/history.mjs';
import {settingsView,credentials} from './lib/settings.mjs';
import * as timer from './lib/timer.mjs';

const root=document.querySelector('#main'),nav=document.querySelector('#nav');
const sections=[['home','今日の学習'],['studio','発音診断'],['review','復習'],['history','実績']];
const taskIcon={listen:'listen',pronounce:'studio',shadow:'shadow',speak:'speak',reflect:'reflect'};
const taskSub={listen:'内容理解とディクテーション',pronounce:'単語・句・文で録音',shadow:'重ね読みと追いかけ読み',speak:'業務場面の即興発話',reflect:'次回に確かめる一点'};
const diagnostic=['英文音読','母音','子音','単語強勢','弱形','文のリズム','イントネーション','精聴','即興スピーキング'];
let page='home',selected=null,mode='full',day=1,start='2026-11-28',today,calendar;
let events=[],clips=[],parts=[],view,variant='practice',practiceWord='',clipId=null,modelURL=null,reg,working=false;
let lesson,plan,items,due,task,selectedTask,revealFresh=false,quizDone=false,listenScaffold=false;
const query=s=>view.querySelector(s);
const done=()=>events.filter(e=>e.kind==='task'&&e.day===day&&e.completed&&(calendar<=90||e.date===today));
function locked(){return parts.some(p=>p.locked?.());}
function clearParts(){for(const p of parts)p.dispose?.();parts=[];if(modelURL){URL.revokeObjectURL(modelURL);modelURL=null;}globalThis.speechSynthesis?.cancel();}
async function data(){
  const [settings,e,c]=await Promise.all([all('settings'),all('events'),all('clips')]);
  const values=Object.fromEntries(settings.map(s=>[s.id,s.value]));
  start=values.start||'2026-11-28';mode=values.mode||'full';today=localDate();calendar=programmeDay(start,today);
  day=selected??(calendar<1?1:(calendar-1)%90+1);lesson=lessons[day-1];
  plan=makePlan(day,mode==='short');events=e;clips=c;items=reviewItems(e);due=items.filter(w=>w.due<=today);
  const prev=e.filter(x=>x.kind==='listen'&&x.first!==false&&x.date<today).sort((a,b)=>b.at-a.at).slice(0,3);
  listenScaffold=prev.length>0&&prev.filter(e=>e.correct).length/prev.length<.67;
}
function navBar(){
  nav.innerHTML=sections.map(([id,title])=>'<button data-nav="'+id+'" '+((page===id||(id==='home'&&page==='task')||(id==='history'&&page==='clip'))?'aria-current="page"':'')+'>'+icon(id)+'<span>'+title+'</span></button>').join('');
}
function dateLabel(){return new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'long'}).format(new Date(today+'T12:00:00'));}
function home(){
  const minutes=plan.reduce((n,t)=>n+t.minutes,0),completed=new Set(done().map(e=>e.task)),count=plan.filter(t=>completed.has(t.id)).length;
  const next=plan.find(t=>!completed.has(t.id))||plan[0],active=timer.active();
  const previousDay=plusDays(today,-1),previousTime=events.filter(e=>e.kind==='task'&&e.date===previousDay).reduce((s,e)=>s+e.seconds,0);
  const studied=events.filter(e=>e.kind==='task'&&e.date===today).reduce((s,e)=>s+e.seconds,0);
  view.innerHTML=`<p class="eyebrow">${esc(dateLabel())}</p><h1>今日の学習</h1>
  <section class="hero"><p class="eyebrow">Day ${day} / 90　 ·　${esc(lesson.phase)}</p><h2>${esc(lesson.title)}</h2><p>${esc(lesson.focus)}</p><progress class="track" max="${plan.length}" value="${count}" aria-label="本日の完了課題"></progress>
  <div class="between"><small>${count} / ${plan.length} 課題完了</small><small>今日の実績 ${Math.floor(studied/60)} 分</small></div><div class="actions">${active?btn('resume-task','中断した学習を再開','primary'):btn('start-task',count===plan.length?'もう一度練習する':'学習を始める','primary','data-task="'+next.id+'"')}</div></section>
  ${calendar<1?'<p class="meta">'+esc(start)+' 開始予定。開始前もDay 1を練習できます。</p>':calendar>90?'<p class="tip">継続学習 '+(calendar-90)+'日目。教材を再訪し、復習期限の来た語を優先します。</p>':''}
  <div class="sectionhead"><h2>学習メニュー</h2><div class="switch" aria-label="コース">${['full','short'].map((m,i)=>btn('mode',i?'15 分':'60 分','','data-mode="'+m+'" aria-pressed="'+(mode===m)+'"')).join('')}</div></div>
  ${mode==='full'&&previousTime>0&&previousTime<25*60?'<p class="tip">昨日の実績は'+Math.round(previousTime/60)+'分でした。今日は15分メニューも選べます。</p>':''}
  <div class="list">${plan.map(t=>'<button class="taskrow" data-action="start-task" data-task="'+t.id+'"><span class="taskicon">'+icon(completed.has(t.id)?'check':taskIcon[t.id])+'</span><span><strong>'+esc(t.title)+'</strong><small>'+esc(t.id==='pronounce'&&due.length?'優先語　'+due[0].word:taskSub[t.id])+'</small></span><span class="tasktime">'+t.minutes+'分</span></button>').join('')}</div>
  <p class="meta">予定 ${minutes} 分${checkpoints[day]?' ・ 定点評価日':''}</p>
  ${due.length?'<div class="tip">今日の復習 '+due.length+'語 ・ '+esc(due.slice(0,3).map(i=>i.word).join(' / '))+' '+btn('review-list','復習を開く')+'</div>':''}
  ${listenScaffold?'<p class="tip">最近の初回正答に合わせ、精聴をチャンク単位・0.85倍から始めます。</p>':''}
  <details><summary>90日間のカリキュラム</summary><label>教材日<select id="day-select">${lessons.map(l=>'<option value="'+l.day+'" '+(l.day===day?'selected':'')+'>Day '+l.day+'　'+esc(l.title)+'</option>').join('')}</select></label><div class="actions">${btn('change-day','選んだ日のメニュー')}${btn('today','予定日に戻る')}</div></details>`;
}
function taskGuide(t){
  return '<details><summary>手順・達成条件・復習方法</summary><p><b>目的</b>　'+esc(t.objective)+'</p><p><b>教材</b>　'+esc(t.material)+'</p><ol>'+t.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><p><b>評価</b>　'+esc(t.assessment)+'</p><p><b>達成条件</b>　'+esc(t.success)+'</p><p><b>次回</b>　'+esc(t.review)+'</p></details>';
}
function taskBar(){
  return `<div class="panel"><div class="between"><div><small>この課題の実測時間</small><div class="timer" id="timer">0:00</div></div>${btn('toggle-timer',timer.active()?.start!=null?'一時停止':'計測を再開')}</div>
  <label class="field">ひとこと記録<textarea id="task-note" placeholder="聞き落とした語や、次に試す読み方"></textarea></label><label class="check"><input type="checkbox" id="achieved">達成条件を確認した</label>
  <div class="actions">${btn('finish-task','完了して記録','primary')}${btn('partial','途中まで記録')}</div></div>`;
}
async function taskView(){
  task=plan.find(t=>t.id===selectedTask);
  if(!task){page='home';home();return;}
  const t=task;
  view.innerHTML=`<p class="eyebrow">Day ${day}　·　${t.minutes} 分</p><h1>${esc(t.title)}</h1><p>${esc(t.objective)}</p>${taskGuide(t)}<div id="exercise"></div>${taskBar()}`;
  const a=timer.active();
  if(a){query('#task-note').value=a.note||'';query('#achieved').checked=Boolean(a.achieved);}
  const ex=query('#exercise');
  if(t.id==='listen'){
    quizDone=false;
    ex.innerHTML=`<div id="player"></div><h2>内容を確認</h2><p>${esc(lesson.question)}</p>
    <div class="stack">${lesson.options.map((s,i)=>'<label class="check"><input type="radio" name="answer" value="'+i+'">'+esc(s)+'</label>').join('')}</div>
    <label class="field">チャンク1の書き取り（任意）<textarea id="dictation" lang="en-GB"></textarea></label>${btn('answer','回答を記録','primary')}<div id="answer-result" role="status"></div>`;
    parts.push(await mountPlayer(query('#player'),{lesson,model:narration[day],hideText:true,scaffold:listenScaffold}));
  }
  if(t.id==='shadow'){
    ex.innerHTML='<h2>重ね読み → 追いかけ読み</h2><p>同じチャンクを2回聞き、原稿を見ながら重ね読みします。次に原稿を隠して一拍遅れて発話し、録音を聞き比べてください。</p><div id="player"></div><div id="recorder"></div>';
    parts.push(await mountPlayer(query('#player'),{lesson,model:narration[day]}));
    parts.push(await mountStudio(query('#recorder'),{day,text:lesson.script,purpose:'shadow',hideScript:true,label:'シャドーイングの録音',credentials,modelFile:narration[day]?.file}));
  }
  if(t.id==='pronounce'){
    ex.innerHTML='<p class="tip">'+esc(lesson.cue)+'</p>'+(due.length?'<h3>今日の優先語</h3>'+wordRow(due[0]):'')+'<div id="diagnostic"></div>';
    if(checkpoints[day])await assessmentPicker(query('#diagnostic'));
    else parts.push(await mountStudio(query('#diagnostic'),{day,text:lesson.script,purpose:'lesson',label:'単語と文で録る',editable:true,credentials,modelFile:narration[day]?.file}));
  }
  if(t.id==='speak'){
    ex.innerHTML='<p class="tip">'+esc(lesson.prompt)+'</p><div id="recorder"></div>';
    parts.push(await mountStudio(query('#recorder'),{day,text:'',purpose:'free',label:'原稿なしで録音',credentials}));
  }
  if(t.id==='reflect'){
    ex.innerHTML='<h2>今日の振り返り</h2><p>録音や聞き取りから、変化が分かる箇所を一つ選んでください。次にどう試すかを下の記録に残します。</p><label class="field">復習したい単語・語句<input id="new-word" lang="en-GB" placeholder="例　households"></label>'+btn('add-word','翌日の復習に追加');
  }
  tick();
}
const evalType=()=>day===1?'初期診断':day===90?'総合評価':day===30||day===60?'中間評価':'週次評価';
async function assessmentPicker(host){
  host.innerHTML=`<h2>${evalType()}</h2><p>同じマイク・距離で一回ずつ読みます。録音後に精聴と即興の記録も確認できます。</p>
  <div class="actions">${btn('variant','固定原稿','','data-variant="baseline"')}${btn('variant','初見比較原稿','','data-variant="fresh"')}</div><div id="eval-studio"></div>
  <details><summary>技能別に自己評価を記録</summary><p>録音、内容理解の回答、即興発話から判断できる項目を選んでください。</p>
  ${diagnostic.map((d,i)=>'<label class="field">'+d+'<select class="rating" data-name="'+d+'"><option>未測定</option><option>明瞭にできた</option><option>要練習</option><option>判断保留</option></select></label>').join('')}${btn('ratings','自己評価を保存')}</details>`;
  if(variant!=='fresh')variant='baseline';
  const isFresh=variant==='fresh', seen=events.some(e=>e.kind==='exposure'&&e.day===day);
  if(isFresh&&!revealFresh){
    query('#eval-studio').innerHTML='<p class="tip">'+(seen?'この原稿は以前に表示済みです。以後は再読として記録します。':'表示すると初見原稿を開いた日を記録します。録音できる状態で開いてください。')+'</p>'+btn('reveal-fresh','比較原稿を開く');
    return;
  }
  parts.push(await mountStudio(query('#eval-studio'),{day,text:isFresh?checkpoints[day]:baseline,purpose:isFresh?(revealFresh==='first'?'fresh':'fresh-repeat'):'baseline',label:isFresh?'比較原稿を録音':'固定原稿を録音',credentials}));
}
function wordRow(w){
  return '<div class="row"><div><strong lang="en-GB">'+esc(w.word)+'</strong><p class="meta">'+esc(w.source)+' ・ 次回 '+esc(w.due)+'</p></div>'+btn('word','練習','','data-word="'+esc(w.word)+'"')+'</div>';
}
function review(){
  view.innerHTML='<p class="eyebrow">間隔を空けて再確認</p><h1>苦手項目の復習</h1><p>期限が来た語 '+due.length+' 件 ・ 登録 '+items.length+' 件</p><div class="list">'+(items.map(wordRow).join('')||'<p>単語別の採点結果と、自分で登録した語がここに並びます。</p>')+'</div><label class="field">聞き返された単語・語句<input id="new-word" lang="en-GB"></label>'+btn('add-word','翌日の復習に追加');
}
async function word(){
  const w=items.find(i=>i.word===practiceWord);const d=getDrill(practiceWord);
  const observations=events.filter(e=>e.kind==='assess').sort((a,b)=>b.at-a.at).flatMap(e=>e.result.words.filter(word=>word.word.toLowerCase()===practiceWord&&word.accuracy!=null).map(word=>'<p>'+esc(e.date)+' ・ 精度 '+esc(word.accuracy)+'　<span lang="en-GB">'+esc(e.result.referenceText)+'</span></p>'));
  view.innerHTML='<p class="eyebrow">単語の復習</p><h1 lang="en-GB">'+esc(practiceWord)+'</h1><p class="meta">'+esc(w?.source||'選択した語')+' ・ 単語の結果から音素の原因は特定できません。</p>'+drillHTML(d,practiceWord)+(observations.length?'<details><summary>この語の採点履歴</summary>'+observations.join('')+'<small>原稿・課題が異なる評価は条件が異なります。音素名は特定不可。</small></details>':'')+(w?.misses>=2?'<p class="tip">複数回要確認になった語です。今回は違いを聞き分けてから録り、次のCamblyで原稿を見せずに聞き取った語を尋ねてください。</p>':'')+'<div id="recorder"></div><h2>録音を聞いた自己確認</h2><div class="actions">'+btn('review-success','改善を確認した','primary')+btn('review-again','もう一度練習する')+'</div>';
  parts.push(await mountStudio(query('#recorder'),{day,text:d?.sentence||practiceWord,editable:true,purpose:'review',label:'再録音して比較',credentials}));
}
async function studio(){
  view.innerHTML='<p class="eyebrow">English (United Kingdom)</p><h1>発音診断</h1><p>録音を保存して聞き比べ、必要な区間だけ採点できます。</p>'+(checkpoints[day]?'<div class="actions">'+btn('open-check',evalType()+'を開く')+'</div>':'')+'<div id="recorder"></div>';
  parts.push(await mountStudio(query('#recorder'),{day,text:lesson.script,purpose:'practice',editable:true,label:'音読と録音',credentials,modelFile:narration[day]?.file}));
}
async function clipView(){
  const c=clips.find(c=>c.id===clipId);if(!c){page='history';historyView(view,{events,clips,today});return;}
  view.innerHTML='<p class="eyebrow">保存した音声</p><h1>'+esc(c.label)+'</h1><div id="recorder"></div>';
  if(c.role==='model'){
    const b=await get('audio',c.id);if(b){modelURL=URL.createObjectURL(b.blob);query('#recorder').innerHTML='<audio controls src="'+modelURL+'"></audio>'+acoustic(c.analysis,c.text,true);}
  }else parts.push(await mountStudio(query('#recorder'),{day:c.day,clip:c,text:c.text,purpose:c.purpose,label:'保存した録音',credentials,modelFile:lessons[c.day-1]?.script===c.text?narration[c.day]?.file:null}));
}
async function render(){
  clearParts();await data();navBar();root.replaceChildren();view=document.createElement('div');root.append(view);
  if(page==='home')home();if(page==='task')await taskView();if(page==='studio')await studio();if(page==='review')review();if(page==='word')await word();if(page==='clip')await clipView();
  if(page==='history')historyView(view,{events,clips,today});
  if(page==='settings')await settingsView(view,{start,refresh:()=>{selected=null;},update:checkUpdate});
}
function rememberTask(){const a=timer.active();if(page==='task'&&a&&query('#task-note')){a.note=query('#task-note').value;a.achieved=query('#achieved').checked;}}
async function go(to){
  if(locked()){notice('録音・保存・送信が終わってから移動してください。');return;}
  rememberTask();if(page==='task')timer.pause();page=to;await render();window.scrollTo(0,0);root.focus({preventScroll:true});
}
async function saveTask(completed){
  const a=timer.active();if(!a)return;
  rememberTask();timer.pause();
  await recordEvent({id:a.id,kind:'task',day:a.day,date:a.date,task:a.task,name:makePlan(a.day,a.mode==='short').find(t=>t.id===a.task)?.title,mode:a.mode,seconds:Math.round(a.ms/1000),completed,note:a.note||''});
  timer.clear();
}
async function begin(id){
  let a=timer.active();if(a&&(a.day!==day||a.task!==id||a.mode!==mode)){await saveTask(false);a=null;}
  selected=day;selectedTask=id;variant='baseline';revealFresh=false;timer.start(day,id,mode,today);await go('task');
  timer.resume();tick();
}
function tick(){
  const v=document.querySelector('#timer');if(v){v.textContent=time(timer.elapsed()/1000);const b=view.querySelector('[data-action=toggle-timer]');if(b)b.textContent=timer.active()?.start!=null?'一時停止':'計測を再開';}
}
async function handle(button){
  if(button.dataset.nav){await go(button.dataset.nav);return;}
  const action=button.dataset.action;
  if(locked()){notice('先に録音を停止するか、保存完了をお待ちください。');return;}
  if(action==='mode'){await saveSetting('mode',button.dataset.mode);await render();}
  if(action==='change-day'||action==='today'){selected=action==='today'?null:Number(query('#day-select').value);await render();}
  if(action==='start-task')await begin(button.dataset.task);
  if(action==='open-check')await begin('pronounce');
  if(action==='resume-task'){const a=timer.active();selected=a.day;selectedTask=a.task;await saveSetting('mode',a.mode);await go('task');timer.resume();tick();}
  if(action==='toggle-timer'){if(timer.active()?.start!=null)timer.pause();else timer.resume();tick();}
  if(action==='finish-task'||action==='partial'){
    if(action==='finish-task'&&!query('#achieved').checked)throw Error('達成条件を確認してチェックを入れてください。途中までの記録もできます。');
    if(action==='finish-task'&&task.id==='listen'&&!events.some(e=>e.kind==='listen'&&e.day===day&&e.date===today)&&!quizDone)throw Error('内容理解の回答を記録してください。');
    if(action==='finish-task'&&task.id==='reflect'&&!query('#task-note').value.trim())throw Error('明日確かめることを一つ記入してください。');
    await saveTask(action==='finish-task');await go('home');notice('学習時間と記録を保存しました。');
  }
  if(action==='answer'){
    const checked=query('input[name=answer]:checked');if(!checked)throw Error('回答を一つ選択してください。');
    const correct=Number(checked.value)===lesson.answer, typed=query('#dictation').value.trim(),value=dictation(lesson.chunks[0],typed);
    const first=!events.some(e=>e.kind==='listen'&&e.day===day);
    const conditions=parts.find(p=>p.listeningConditions)?.listeningConditions();
    await recordEvent({kind:'listen',day,correct,dictation:value,typed,first,conditions,chosen:Number(checked.value)});
    quizDone=true;await data();
    query('#answer-result').innerHTML='<p class="tip">'+(correct?'正解です。':'正答　'+esc(lesson.options[lesson.answer]))+'　'+(first&&conditions?.independent?'初回・標準条件':'練習条件')+'として保存しました。</p>'+(typed?'<p>書き取り '+value+'% ・ 正しいチャンク</p><p lang="en-GB">'+esc(lesson.chunks[0])+'</p>':'')+'<p>原稿で根拠を確かめ、再度聞いてください。</p>';button.disabled=true;
  }
  if(action==='variant'||action==='reveal-fresh'){
    rememberTask();variant=button.dataset.variant||'fresh';revealFresh=false;
    if(action==='reveal-fresh'){
      revealFresh=events.some(e=>e.kind==='exposure'&&e.day===day)?'again':'first';
      await recordEvent({kind:'exposure',day});
    }
    await render();
  }
  if(action==='ratings'){
    const ratings=Object.fromEntries([...view.querySelectorAll('.rating')].map(s=>[s.dataset.name,s.value]));
    if(Object.values(ratings).every(v=>v==='未測定'))throw Error('確認した技能を一つ選択してください。');
    await recordEvent({kind:'check',day,ratings});notice('技能別の自己評価を保存しました。');
  }
  if(action==='add-word'){const w=query('#new-word').value.toLowerCase().trim();if(!/^[a-z]+(?:[ '’-][a-z]+){0,9}$/.test(w)||w.length>100)throw Error('英単語または短い英語の語句を入力してください。');await recordEvent({kind:'review',day,word:w,success:false});query('#new-word').value='';if(page==='review')await render();notice('翌日の復習に追加しました。');}
  if(action==='word'){practiceWord=button.dataset.word;await go('word');}
  if(action==='review-list')await go('review');
  if(action==='review-success'||action==='review-again'){await recordEvent({kind:'review',day,word:practiceWord,success:action==='review-success'});await go('review');notice('次の復習日を更新しました。');}
  if(action==='open-clip'){clipId=button.dataset.id;await go('clip');}
  if(action==='delete-clip'&&confirm('この音声を削除しますか？ 採点結果と学習記録は残ります。')){await deleteClip(button.dataset.id);await render();}
}
document.addEventListener('click',async e=>{
  const button=e.target.closest('button[data-action],button[data-nav]');if(!button||working)return;
  working=true;try{await handle(button);}catch(err){notice(errorText(err));}finally{working=false;}
});
document.addEventListener('input',e=>{if(page==='task'&&['task-note','achieved'].includes(e.target.id))rememberTask();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)rememberTask();tick();});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();if(!working)go('home').catch(e=>notice(errorText(e)));});
setInterval(tick,1000);
addEventListener('voiceerror',e=>notice(e.detail));
let pendingUpdate=false;
async function checkUpdate(){
  if(!reg)throw Error('更新を確認できません。HTTPSとネットワーク接続を確認してください。');
  const current=await navigator.serviceWorker.getRegistration();
  if(!current)throw Error('アプリをオンラインで開いてから更新してください。');
  if(!current.waiting&&!current.installing)await current.update();
  const next=current.waiting||current.installing;
  if(!next){notice('最新の教材です。');return;}
  if(next.state==='installing'){
    notice('新しい教材音声を保存しています。');
    await new Promise((resolve,reject)=>{
      const check=()=>{if(next.state==='installing')return;next.removeEventListener('statechange',check);next.state==='redundant'?reject(Error('更新できません。通信と空き容量を確認してください。')):resolve();};
      next.addEventListener('statechange',check);check();
    });
  }
  if(locked())throw Error('録音・保存完了後に更新してください。');
  rememberTask();timer.pause();pendingUpdate=true;
  next.addEventListener('statechange',()=>{if(next.state==='activated'&&pendingUpdate){pendingUpdate=false;location.reload();}});
  next.postMessage('ACTIVATE');
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(pendingUpdate){pendingUpdate=false;location.reload();}});
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{reg=r;const ready=()=>notice('新しい教材があります。設定の「更新を確認」から反映できます。');if(r.waiting)ready();r.addEventListener('updatefound',()=>{const w=r.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)ready();});});}).catch(()=>notice('オフライン教材を保存できませんでした。オンラインで再度開いてください。'));
}
try{await migrateLegacy();}catch{notice('旧版の履歴を自動で取り込めませんでした。設定からバックアップを復元できます。');}
try{await render();}catch(e){root.textContent='学習データを開けません。ブラウザの保存設定と空き容量を確認してください。 '+errorText(e);}

