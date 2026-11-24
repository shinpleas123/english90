import {decodeAudio} from './pcm.mjs';
// Relative contours use log-frequency, centred on each speaker's median voiced frame.
function median(values) {
  if(!values.length) return null;
  const a=[...values].sort((x,y)=>x-y);
  return a[Math.floor(a.length/2)];
}
export function analyseSamples(x,rate){
  const duration=x.length/rate, step=Math.round(rate*.04), window=Math.round(rate*.04);
  const frames=[];
  for(let i=0;i+window<=x.length;i+=step){
    let power=0;
    for(let j=0;j<window;j++) power+=x[i+j]**2;
    frames.push({t:i/rate,db:10*Math.log10(Math.max(power/window,1e-12)),f:null});
  }
  const peak=frames.reduce((v,f)=>Math.max(v,f.db),-120);
  const gate=Math.max(-52,peak-31);
  const minLag=Math.floor(rate/480), maxLag=Math.ceil(rate/65);
  const pauses=[];
  let quietStart=null;
  for(let k=0;k<frames.length;k++){
    const frame=frames[k], offset=k*step;
    if(frame.db<gate){
      if(quietStart==null) quietStart=frame.t;
      continue;
    }
    if(quietStart!=null && quietStart>0 && frame.t-quietStart>=.2) pauses.push({start:quietStart,length:frame.t-quietStart});
    quietStart=null;
    let prev=0,prevPrev=0,peakCorr=.77,bestLag=0;
    for(let lag=minLag;lag<=maxLag;lag++){
      let xy=0,xx=0,yy=0;
      for(let j=0;j<window-maxLag;j+=2){
        const a=x[offset+j],b=x[offset+j+lag];
        xy+=a*b;xx+=a*a;yy+=b*b;
      }
      const c=xy/(Math.sqrt(xx*yy)||1);
      if(prev>prevPrev&&prev>=c&&prev>peakCorr){bestLag=lag-1;peakCorr=prev+.025;}
      prevPrev=prev;prev=c;
    }
    if(bestLag) frame.f=rate/bestLag;
  }
  const centre=median(frames.flatMap(f=>f.f?[f.f]:[]));
  const stride=Math.max(1,Math.ceil(frames.length/240));
  const contour=frames.filter((_,i)=>i%stride===0).map(f=>({t:+f.t.toFixed(2),st:f.f&&centre?+(12*Math.log2(f.f/centre)).toFixed(2):null,db:+f.db.toFixed(1)}));
  return {duration,medianHz:centre,pauses,contour,peakDb:frames.length?peak:null};
}
export async function analyseBlob(blob){
  if(!blob?.size||blob.size>64*1024*1024) throw Error('64 MB以下の音声を選択してください。');
  const decoded=await decodeAudio(blob,8000);
  if(decoded.duration>600) throw Error('解析は1回10分までです。録音を分けてください。');
  return analyseSamples(decoded.getChannelData(0),decoded.sampleRate);
}
export function britishVoice(){
  return globalThis.speechSynthesis?.getVoices().filter(v=>v.localService && /^en[-_]GB\b/i.test(v.lang))[0]||null;
}
export function say(text,rate=1,onend){
  const voice=britishVoice();
  if(!voice) throw Error('端末のオフライン英国英語音声を追加してください。教材付属の音声または自分のお手本ファイルも利用できます。');
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.voice=voice;u.rate=rate;u.onend=onend;
  u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error)) globalThis.dispatchEvent(new CustomEvent('voiceerror',{detail:'英国音声を再生できません。端末の音声設定を確認してください。'}));};
  speechSynthesis.speak(u);
}
export async function startMicrophone(onstop,onerror){
  if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder) throw Error('HTTPSで開き、マイク対応のSafariまたはChromeを使ってください。');
  let stream;
  try {stream=await navigator.mediaDevices.getUserMedia({audio:true});}
  catch(e){throw Error(e.name==='NotAllowedError'?'マイクが許可されていません。サイト設定で許可するか、音声ファイルを選択してください。':'マイクを利用できません。接続・他アプリの使用状況を確認してください。');}
  try{
    const recorder=new MediaRecorder(stream), chunks=[];
    const release=()=>stream.getTracks().forEach(t=>t.stop());
    recorder.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
    let failed=false;
    recorder.onerror=()=>{failed=true;release();onerror('録音が中断されました。もう一度録音してください。');};
    recorder.onstop=()=>{release();if(!failed) onstop(new Blob(chunks,{type:recorder.mimeType}));};
    recorder.start(1000);
    return recorder;
  }catch(e){stream.getTracks().forEach(t=>t.stop());throw e;}
}
