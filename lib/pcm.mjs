// Small PCM16 RIFF decoder for browsers without a working Web Audio decoder.
// Compressed formats continue to use the browser's codec implementation.
export function decodePCM16(buffer,rate) {
  const view=new DataView(buffer);
  const tag=i=>String.fromCharCode(...new Uint8Array(buffer,i,4));
  if(buffer.byteLength<44||tag(0)!=='RIFF'||tag(8)!=='WAVE')throw Error('16ビットPCMのWAVを選択してください。');
  let channels,sourceRate,dataOffset,byteLength;
  for(let i=12;i+8<=buffer.byteLength;){
    const size=view.getUint32(i+4,true),at=i+8;
    if(at+size>buffer.byteLength)throw Error('WAVファイルが途中で切れています。');
    if(tag(i)==='fmt '&&size>=16){
      if(view.getUint16(at,true)!==1||view.getUint16(at+14,true)!==16)throw Error('16ビットPCMのWAVを選択してください。');
      channels=view.getUint16(at+2,true);sourceRate=view.getUint32(at+4,true);
    }
    if(tag(i)==='data'){dataOffset=at;byteLength=size;}
    i=at+size+(size%2);
  }
  if(!channels||!sourceRate||!byteLength||byteLength%(channels*2))throw Error('WAVの形式を確認してください。');
  const count=byteLength/(channels*2),length=Math.round(count/sourceRate*rate);
  if(length<=0||count/sourceRate>600)throw Error('1回10分以内の音声を選択してください。');
  const samples=new Float32Array(length);
  for(let i=0;i<length;i++){
    const from=Math.min(count-1,Math.floor(i*sourceRate/rate));
    const until=Math.min(count,Math.max(from+1,Math.floor((i+1)*sourceRate/rate)));
    let total=0;
    for(let n=from;n<until;n++)for(let c=0;c<channels;c++)total+=view.getInt16(dataOffset+(n*channels+c)*2,true);
    samples[i]=total/(32768*channels*(until-from));
  }
  return {sampleRate:rate,duration:length/rate,length,numberOfChannels:1,getChannelData:()=>samples};
}
export async function decodeAudio(blob,rate){
  const bytes=await blob.arrayBuffer();
  const Offline=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;
  if(Offline){
    try{return await new Offline(1,1,rate).decodeAudioData(bytes.slice(0));}catch{}
  }
  try{return decodePCM16(bytes,rate);}
  catch{throw Error('この環境では音声を復号できません。16ビットPCMのWAV、またはM4A・MP3に対応したSafariやChromeを使ってください。');}
}
