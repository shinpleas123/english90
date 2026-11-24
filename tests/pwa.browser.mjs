import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const base=fileURLToPath(new URL('../',import.meta.url));
const types={html:'text/html',mjs:'text/javascript',js:'text/javascript',css:'text/css',webmanifest:'application/manifest+json',png:'image/png',mp3:'audio/mpeg'};
let revision=false, originUnavailable=false;
const server=createServer(async(req,res)=>{
  try{
    if(originUnavailable){res.writeHead(503);res.end();return;}
    const url=new URL(req.url,'http://localhost'),name=url.pathname.slice('/english90/'.length)||'index.html';
    if(!url.pathname.startsWith('/english90/')||name.includes('..'))throw Error();
    let bytes=await readFile(path.join(base,name));
    if(revision&&name==='sw.js')bytes=Buffer.from(bytes.toString().replace(/const cacheName=prefix\+'[^']+'/,"const cacheName=prefix+'test-revision'"));
    if(revision&&name==='index.html')bytes=Buffer.from(bytes.toString().replace('<body>','<body data-revision="new">'));
    res.writeHead(200,{'Content-Type':types[name.split('.').at(-1)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);
  }catch{res.writeHead(404);res.end();}
});
const wav=Buffer.alloc(44+32000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(32000,40);
for(let i=0;i<16000;i++)wav.writeInt16LE(Math.round(9000*Math.sin(2*Math.PI*i*210/16000)),44+2*i);
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const address='http://127.0.0.1:'+server.address().port+'/english90/';
let browser;
try{
  const engine=process.env.ENGINE==='webkit'?webkit:chromium;
  browser=await engine.launch(engine===chromium&&process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{});
  const ctx=await browser.newContext({viewport:{width:375,height:812},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('e90records'))localStorage.setItem('e90records',JSON.stringify([{date:'2026-11-27',seconds:65,task:'精聴'}]));});
  const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
  await p.goto(address);await p.getByRole('heading',{name:'今日の学習',exact:true}).waitFor();
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForFunction(()=>navigator.serviceWorker.controller);
  await p.getByRole('button',{name:'発音診断',exact:true}).click();
  const hasMic=await p.evaluate(()=>Boolean(navigator.mediaDevices&&globalThis.MediaRecorder));
  if(hasMic)await p.evaluate(()=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('Denied','NotAllowedError');},configurable:true}));
  await p.getByRole('button',{name:'録音を開始'}).click();await p.getByText(hasMic?/マイクが許可されていません/:/マイク対応のSafari/).first().waitFor();
  const mediaCapable=await p.evaluate(()=>Boolean(globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext));
  if(mediaCapable){
  await p.getByText('音声ファイルを読み込む',{exact:true}).click();
  await p.locator('input[data-file=learner]').setInputFiles({name:'one.wav',mimeType:'audio/wav',buffer:wav});
  await p.getByText('音声を保存しました。',{exact:true}).waitFor().catch(async err=>{console.error(await p.locator('[data-el=state]').innerText(),await p.evaluate(()=>({offline:typeof OfflineAudioContext,webAudio:typeof AudioContext,media:typeof navigator.mediaDevices})));throw err;});
  }
  await p.getByRole('button',{name:'実績',exact:true}).click();await p.getByText(/2026-11-27 ・ 1:05/).waitFor();
  await p.getByRole('button',{name:'今日の学習',exact:true}).click();
  await p.getByText('90日間のカリキュラム',{exact:true}).click();await p.locator('#day-select').selectOption('90');await p.getByRole('button',{name:'選んだ日のメニュー'}).click();await p.getByText(/Day 90 \/ 90/).waitFor();
  revision=true;await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;await r.update();});
  const deadline=Date.now()+60000;
  while(!(await p.evaluate(async()=>Boolean((await navigator.serviceWorker.ready).waiting)))){
    if(Date.now()>deadline)throw Error('Worker did not reach waiting');await p.waitForTimeout(120);
  }
  await p.getByRole('button',{name:'設定',exact:true}).click();await p.getByRole('button',{name:'更新を確認'}).click();await p.waitForFunction(()=>document.body.dataset.revision==='new',{}, {timeout:30000}).catch(async err=>{
    console.error(await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return {notice:document.querySelector('#notice')?.innerText,waiting:r.waiting?.state,active:r.active?.state,installed:await caches.keys(),revision:document.body.dataset.revision};}));throw err;});
  await p.getByRole('button',{name:'実績',exact:true}).click();if(mediaCapable)await p.getByRole('button',{name:'開く',exact:true}).waitFor();else await p.getByText(/2026-11-27 ・ 1:05/).waitFor();
  let offlinePage=p;
  if(engine===webkit){
    originUnavailable=true;offlinePage=await ctx.newPage();await offlinePage.goto(address);
  }else{await ctx.setOffline(true);await offlinePage.reload();}
  await offlinePage.getByRole('heading',{name:'今日の学習',exact:true}).waitFor();
  assert.equal(await offlinePage.locator('body').getAttribute('data-revision'),'new');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  if(engine===chromium){
    const profile=await mkdtemp(path.join(tmpdir(),'english90-playwright-'));
    const launch=()=>chromium.launchPersistentContext(profile,process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{});
    let saved;
    try{
      saved=await launch();
      const first=await saved.newPage();await first.goto(address);
      await first.getByRole('button',{name:'発音診断',exact:true}).click();
      await first.locator('input[data-file=learner]').setInputFiles(path.join(base,'assets/listening/day-01.mp3'));
      await first.getByText('音声を保存しました。',{exact:true}).waitFor();
      await saved.close();saved=await launch();
      const reopened=await saved.newPage();await reopened.goto(address);
      await reopened.getByRole('button',{name:'実績',exact:true}).click();
      await reopened.getByRole('button',{name:'開く',exact:true}).click();
      await reopened.locator('audio').first().waitFor();
      const bytes=await reopened.evaluate(async()=>{const {all}=await import('./lib/store.mjs');return (await all('audio'))[0].blob.size;});
      assert.equal(bytes,(await readFile(path.join(base,'assets/listening/day-01.mp3'))).length);
      console.log('PASS real MP3 import and byte-preserving IndexedDB media across browser process restart.');
      if(process.env.ENGLISH90_M4A_FIXTURE){
        await reopened.getByRole('button',{name:'発音診断',exact:true}).click();
        await reopened.getByRole('heading',{name:'音読と録音',exact:true}).waitFor();
        await reopened.getByText('音声ファイルを読み込む',{exact:true}).click();
        const m4a=await readFile(process.env.ENGLISH90_M4A_FIXTURE);
        await reopened.locator('input[data-file=learner]').setInputFiles({name:'test.m4a',mimeType:'audio/mp4',buffer:m4a});
        await reopened.getByText('音声を保存しました。',{exact:true}).waitFor();
        const durations=await reopened.evaluate(async()=>{const {all}=await import('./lib/store.mjs');return (await all('clips')).map(c=>c.analysis.duration);});
        assert.equal(durations.length,2);assert.ok(durations.every(v=>v>0));
        console.log('PASS supplied M4A file imported, decoded and persisted through the normal UI.');
      }
    }finally{
      await saved?.close();
      if(path.dirname(path.resolve(profile))===path.resolve(tmpdir())&&path.basename(profile).startsWith('english90-playwright-'))await rm(profile,{recursive:true,force:true});
    }
  }
  console.log('PASS '+engine.name()+' mobile touch layout, legacy history, Day 90, worker update and offline new revision. '+(mediaCapable?'Verified WAV import and retained recording.':'Windows WebKit exposes no media/Web Audio. Verified unavailable-microphone message; media flow skipped.'));
}finally{if(browser)await browser.close();server.closeAllConnections();server.close();}
