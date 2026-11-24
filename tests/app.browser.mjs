import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {lessons} from '../content/curriculum.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const mimes={'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.css':'text/css','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try{const u=new URL(req.url,'http://localhost');if(!u.pathname.startsWith('/english90/'))throw Error();
    const name=u.pathname.slice('/english90/'.length)||'index.html',f=path.resolve(root,name);
    if(!f.startsWith(root))throw Error();const body=await readFile(f);
    res.writeHead(200,{'Content-Type':mimes[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const address='http://127.0.0.1:'+server.address().port+'/english90/';
const browser=await chromium.launch({...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{}),args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
const errors=[];
const screenshotDir=process.env.SCREENSHOT_DIR;
async function shot(page,name){if(screenshotDir){await mkdir(screenshotDir,{recursive:true});await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true});}}
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},permissions:['microphone'],acceptDownloads:true});
  const p=await ctx.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.clock.setFixedTime(new Date('2026-11-28T03:00:00Z'));
  await p.goto(address);await p.getByRole('heading',{name:'今日の学習',exact:true}).waitFor();
  for(const width of [320,390,430,768]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.setViewportSize({width:390,height:844});await shot(p,'today');
  const manifest=await p.evaluate(async()=>await(await fetch('./manifest.webmanifest')).json());assert.equal(manifest.display,'standalone');
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await p.getByRole('button',{name:'15 分',exact:true}).click();await p.waitForFunction(()=>document.querySelectorAll('.taskrow').length===4);
  await p.getByRole('button',{name:'学習を始める',exact:true}).click();await p.getByRole('heading',{name:'精聴',exact:true}).waitFor();
  assert.equal(await p.locator('[data-el=script]').innerText(),'');
  await p.getByRole('button',{name:'お手本を再生'}).click();
  await p.waitForFunction(()=>document.querySelector('[data-el=audio]').currentTime>0);
  await p.getByRole('button',{name:'停止',exact:true}).click();
  await p.getByRole('button',{name:'原稿を表示'}).click();assert.ok((await p.locator('[data-el=script]').innerText()).includes(lessons[0].chunks[0]));
  await p.reload();await p.getByRole('button',{name:'中断した学習を再開'}).click();
  await p.getByRole('button',{name:'お手本を再生'}).click();
  await p.getByText('再生が終わりました。',{exact:true}).waitFor({timeout:25000});
  await p.locator('input[name=answer]').nth(lessons[0].answer).check();await p.locator('#dictation').fill(lessons[0].chunks[0]);
  await p.getByRole('button',{name:'回答を記録'}).click();await p.getByText(/書き取り 100%/).waitFor();
  await p.locator('#achieved').check();await p.getByRole('button',{name:'完了して記録'}).click();
  await p.locator('.hero').getByText('1 / 4 課題完了').waitFor();
  await p.getByRole('button',{name:'設定',exact:true}).click();await p.locator('#start-date').waitFor();
  await p.locator('#region').fill('japaneast');await p.locator('#key').fill('fixture-only');await p.locator('#f0').check();await p.locator('#remember').check();await p.getByRole('button',{name:'接続設定を保存'}).click();
  await p.getByText('接続設定を保存しました。',{exact:true}).first().waitFor();
  await p.getByRole('button',{name:'発音診断',exact:true}).click();
  await p.getByRole('button',{name:'録音を開始'}).click();await p.getByText(/録音中です/).waitFor();await p.waitForTimeout(1450);
  await p.getByRole('button',{name:'録音を停止'}).click();await p.getByText('音声を保存しました。',{exact:true}).waitFor();
  assert.ok(await p.locator('audio').first().evaluate(async a=>{await a.play();a.pause();return a.duration>0;}));
  await p.getByText('Azureで区間を採点').click();let status=429;
  await p.locator('[data-el=to]').fill('0.50');
  await p.locator('[data-el=reference]').focus();
  assert.equal(await p.locator('[data-el=reference]').inputValue(),'');
  await p.getByRole('button',{name:'区間を送信して採点'}).click();
  await p.getByText(/選択した区間で読んだ英文を入力/).first().waitFor();
  await p.locator('[data-el=reference]').fill('Growth.');
  await ctx.route('https://japaneast.stt.speech.microsoft.com/**',r=>r.fulfill({status,contentType:'application/json',body:JSON.stringify({RecognitionStatus:'Success',NBest:[{AccuracyScore:78,FluencyScore:76,Words:[{Word:'growth',AccuracyScore:61,Phonemes:[{AccuracyScore:45}]}]}]})}));
  await p.getByRole('button',{name:'区間を送信して採点'}).click();await p.getByText(/Azure HTTP 429/).first().waitFor();
  status=200;await p.getByRole('button',{name:'区間を送信して採点'}).click();await p.getByRole('heading',{name:'Azure の採点結果'}).waitFor();
  await p.getByText('growth の矯正練習').click();await p.getByText('舌',{exact:true}).waitFor();await shot(p,'assessment');
  await p.getByRole('button',{name:'復習',exact:true}).click();await p.getByRole('button',{name:'練習',exact:true}).click();await p.getByRole('heading',{name:'growth',exact:true}).waitFor();
  await p.getByRole('button',{name:'改善を確認した'}).click();await p.getByRole('heading',{name:'苦手項目の復習'}).waitFor();
  await p.reload();await p.getByRole('button',{name:'実績',exact:true}).click();await p.getByText('保存した録音',{exact:true}).waitFor();
  assert.equal(await p.getByRole('button',{name:'開く',exact:true}).count(),1);
  await p.getByRole('button',{name:'設定',exact:true}).click();
  const download=p.waitForEvent('download');await p.getByRole('button',{name:'バックアップを保存'}).click();
  const backupPath=await(await download).path(),backup=JSON.parse(await readFile(backupPath));assert.equal(backup.clips.length,1);assert.equal(backup.events.find(e=>e.kind==='listen').conditions.independent,false);assert.ok(backup.media[0].data.length>0);assert.ok(!JSON.stringify(backup).includes('fixture-only'));
  await p.getByRole('button',{name:'実績',exact:true}).click();await p.getByRole('button',{name:'削除',exact:true}).click();await p.getByText('保存した録音はまだありません。').waitFor();
  await p.getByRole('button',{name:'設定',exact:true}).click();await p.locator('#restore').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await p.getByText(/1件の音声を復元しました/).first().waitFor();
  await p.locator('#restore').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});await p.getByText(/既存データは保持/).first().waitFor();
  await p.getByRole('button',{name:'実績',exact:true}).click();await p.getByRole('button',{name:'開く',exact:true}).click();await p.locator('audio').first().waitFor();assert.ok(await p.locator('audio').first().evaluate(async a=>{await a.play();a.pause();return a.duration>0;}));
  await ctx.setOffline(true);await p.reload();await p.getByRole('heading',{name:'今日の学習',exact:true}).waitFor();
  const offline=await p.evaluate(async()=>{const m=await import('./content/curriculum.mjs');return m.lessons.length;});assert.equal(offline,90);
  const decoded=await p.evaluate(async()=>{
    const {narration}=await import('./content/narration.mjs');
    const {lessons}=await import('./content/curriculum.mjs');
    const decoder=new OfflineAudioContext(1,1,22050);
    for(const l of lessons){
      const record=narration[l.day];
      if(!record||record.segments.length!==l.chunks.length)throw Error('Missing lesson audio '+l.day);
      const response=await fetch(record.file);
      const a=await decoder.decodeAudioData(await response.arrayBuffer());
      if(a.duration<record.segments.at(-1)[1]-.08)throw Error('Truncated model '+l.day);
      for(const [start,end] of record.segments){
        const data=a.getChannelData(0).subarray(Math.round(start*a.sampleRate),Math.round(end*a.sampleRate));
        if(!data.some(x=>Math.abs(x)>.015))throw Error('Empty chunk in '+l.day);
      }
    }
    return lessons.length;
  });
  assert.equal(decoded,90);await ctx.setOffline(false);
  await p.getByRole('button',{name:'発音診断',exact:true}).click();await p.getByRole('button',{name:'初期診断を開く'}).click();await p.getByRole('button',{name:'初見比較原稿',exact:true}).click();
  await p.getByRole('button',{name:'比較原稿を開く'}).click();await p.getByRole('heading',{name:'比較原稿を録音'}).waitFor();
  assert.equal(await p.getByRole('button',{name:'お手本を聞く',exact:true}).count(),0);
  await p.getByRole('button',{name:'固定原稿',exact:true}).click();await p.getByRole('button',{name:'初見比較原稿',exact:true}).click();await p.getByText(/この原稿は以前に表示済みです/).waitFor();
  await p.getByRole('button',{name:'今日の学習',exact:true}).click();await p.getByRole('button',{name:'60 分',exact:true}).click();
  await p.locator('[data-task=shadow]').click();await p.getByRole('heading',{name:'シャドーイング',exact:true}).waitFor();await p.getByText('原稿を隠す',{exact:true}).click();assert.ok(!(await p.locator('main').innerText()).includes(lessons[0].script));await shot(p,'shadow');
  assert.deepEqual(errors,[]);console.log('PASS mobile widths, PWA manifest + offline reload, short course, comprehension/dictation, fake microphone/playback, mocked 429/success, coaching, review, storage/backup/restore, fresh/repeat, shadow flow.');
}finally{await browser.close();server.closeAllConnections();server.close();}
