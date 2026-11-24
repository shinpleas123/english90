const stores = ['settings', 'events', 'clips', 'audio'];
let connection;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export function localDate(now = new Date()) {
  return [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
}
export const uid = () => crypto.randomUUID();
async function database() {
  if (!connection) connection = new Promise((resolve,reject) => {
    const req = indexedDB.open('english90-coach', 1);
    req.onupgradeneeded = () => stores.forEach(s => req.result.createObjectStore(s,{keyPath:'id'}));
    req.onsuccess = () => { req.result.onversionchange = () => { req.result.close(); connection = null; }; resolve(req.result); };
    req.onerror = () => {connection = null; reject(req.error);};
  });
  return connection;
}
async function transaction(names, mode, callback) {
  const db = await database();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(names,mode);
    let value;
    tx.oncomplete = () => resolve(value?.result);
    tx.onabort = () => reject(tx.error || Error('保存を中断しました。空き容量を確認してください。'));
    try { value = callback(tx); } catch(error) {tx.abort(); reject(error);}
  });
}
export const all = s => transaction([s],'readonly',tx=>tx.objectStore(s).getAll());
export const get = (s,id) => transaction([s],'readonly',tx=>tx.objectStore(s).get(id));
export const put = (s,row) => transaction([s],'readwrite',tx=>tx.objectStore(s).put(row));
export const remove = (s,id) => transaction([s],'readwrite',tx=>tx.objectStore(s).delete(id));
export const saveSetting = (id,value) => put('settings',{id,value});
export const recordEvent = row => put('events',{id:uid(),date:localDate(),at:Date.now(),...row});
export async function saveClip(meta,blob) {
  const row={...meta,id:uid(),date:localDate(),at:Date.now()};
  await transaction(['clips','audio'],'readwrite',tx=>{
    tx.objectStore('clips').add(row);
    tx.objectStore('audio').add({id:row.id,blob});
  });
  return row;
}
export const deleteClip = id => transaction(['clips','audio'],'readwrite',tx=>{
  tx.objectStore('clips').delete(id); tx.objectStore('audio').delete(id);
});
function legacyRecords(data) {
  const records=data.records || [], scores=data.scores || [];
  if(!Array.isArray(records)||!Array.isArray(scores)) throw Error('旧形式の履歴を読み取れません。');
  const events=[];
  records.forEach((r,i)=>{
    if(!datePattern.test(r?.date)||!Number.isFinite(r.seconds)||r.seconds<0) throw Error('旧学習記録の日付・時間を確認してください。');
    events.push({id:'legacy-time-'+r.date+'-'+i,kind:'legacyTime',date:r.date,at:Date.parse(r.date),name:String(r.task||'学習'),seconds:r.seconds});
  });
  scores.forEach((s,i)=>{
    if(!datePattern.test(s?.date)||typeof s.text!=='string'||!Array.isArray(s.words)) throw Error('旧採点記録を読み取れません。');
    events.push({id:'legacy-score-'+s.date+'-'+i,kind:'legacyScore',date:s.date,at:Date.parse(s.date),text:s.text,accuracy:s.accuracy??null,fluency:s.fluency??null,words:s.words});
  });
  return events;
}
export async function migrateLegacy(){
  if(await get('settings','legacyImported')) return;
  const read=(k,d)=>JSON.parse(localStorage.getItem(k)||'null')??d;
  const events=legacyRecords({records:read('e90records',[]),scores:read('e90scores',[])});
  const start=read('e90start',null);
  await transaction(['settings','events'],'readwrite',tx=>{
    for(const e of events) tx.objectStore('events').put(e);
    if(datePattern.test(start)) tx.objectStore('settings').put({id:'start',value:start});
    tx.objectStore('settings').put({id:'legacyImported',value:true});
  });
}
const portableSettings = new Set(['start','mode']);
function base64(blob) {
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(r.error);r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(blob);});
}
export async function exportBackup(){
  const db=await database();
  const tx=db.transaction(stores,'readonly');
  const [settings,events,clips,audio]=await Promise.all(stores.map(s=>new Promise((resolve,reject)=>{
    const r=tx.objectStore(s).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  })));
  const media=[];
  for(const {id,blob} of audio) media.push({id,type:blob.type,data:await base64(blob)});
  return {app:'english90',version:2,created:new Date().toISOString(),settings:settings.filter(s=>portableSettings.has(s.id)),events,clips,media};
}
const allowedKinds = new Set(['task','listen','assess','review','check','legacyTime','legacyScore','exposure']);
function validEvent(e) {
  if(!e || typeof e.id!=='string' || !e.id || !datePattern.test(e.date)||!Number.isFinite(e.at)||!allowedKinds.has(e.kind)) return false;
  if(e.kind==='assess') return typeof e.result?.referenceText==='string' && Array.isArray(e.result.words) && e.result.words.every(w=>typeof w?.word==='string'&&Array.isArray(w.phonemes)&&w.phonemes.every(p=>p && typeof p==='object'));
  if(e.kind==='task') return Number.isFinite(e.seconds)&&e.seconds>=0&&Number.isInteger(e.day)&&typeof e.task==='string';
  if(e.kind==='review') return typeof e.word==='string'&&typeof e.success==='boolean';
  if(e.kind==='listen') return typeof e.correct==='boolean';
  return true;
}
function unique(rows) {
  return rows.every(r=>r && typeof r.id==='string' && r.id.length>0) && new Set(rows.map(r=>r.id)).size===rows.length;
}
export async function restoreBackup(data){
  if(!data || typeof data!=='object') throw Error('English 90のJSONを選択してください。');
  if(data.version==null && Array.isArray(data.records)&&Array.isArray(data.scores)){
    data={app:'english90',version:2,settings:datePattern.test(data.start)?[{id:'start',value:data.start}]:[],events:legacyRecords(data),clips:[],media:[]};
  }
  const invalid=()=>{throw Error('バックアップの形式・版または録音の対応が無効です。既存データは保持しました。');};
  if(data.app!=='english90'||data.version!==2||!['events','clips','media','settings'].every(k=>Array.isArray(data[k])&&unique(data[k]))) invalid();
  if(!data.events.every(validEvent)||!data.settings.every(r=>(r.id==='start'&&datePattern.test(r.value))||(r.id==='mode'&&['short','full'].includes(r.value)))) invalid();
  const ids=new Set(data.clips.map(c=>c.id));
  if(data.clips.length!==data.media.length || !data.clips.every(c=>typeof c.text==='string'&&Number.isFinite(c.at)&&['learner','model'].includes(c.role)&&typeof c.analysis?.duration==='number')) invalid();
  const audio=data.media.map(m=>{
    if(!ids.has(m.id)||typeof m.data!=='string'||!m.data.length||typeof m.type!=='string'||!(/^(audio\/|video\/mp4|application\/octet-stream|$)/i.test(m.type))) invalid();
    const raw=atob(m.data);
    return {id:m.id,blob:new Blob([Uint8Array.from(raw,v=>v.charCodeAt(0))],{type:m.type})};
  });
  await transaction(stores,'readwrite',tx=>{
    for(const [s,rows] of Object.entries({settings:data.settings,events:data.events,clips:data.clips,audio})) for(const row of rows) tx.objectStore(s).put(row);
  });
  return data.events.length+'件の記録・'+data.clips.length+'件の音声を復元しました。';
}
