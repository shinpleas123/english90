import {get,saveSetting,remove,exportBackup,restoreBackup} from './store.mjs';
import {getUsage} from './speech.mjs';
import {esc,btn,notice,errorText} from './ui.mjs';
let sessionKey='';
export async function credentials(){
  const cfg=(await get('settings','azure'))?.value;
  if(!cfg?.f0)return null;
  const key=sessionKey||cfg.key;
  return key?{key,region:cfg.region}:null;
}
export async function settingsView(host,{start,refresh,update}){
  const cfg=(await get('settings','azure'))?.value||{};
  const u=await getUsage().catch(()=>null);
  host.innerHTML=`<p class="eyebrow">English 90</p><h1>設定</h1><h2>カリキュラム</h2><label class="field">学習開始日<input id="start-date" type="date" value="${esc(start)}"></label>${btn('save-date','開始日を保存')}
  <h2>Azure 発音診断</h2><p>自分のSpeechリソースを使って採点できます。録音と区間の英文は、採点ボタンを押したときにMicrosoftへ送信されます。</p>
  <label class="field">リソースのリージョン<input id="region" autocapitalize="off" value="${esc(cfg.region||'japaneast')}"></label>
  <label class="field">Speech キー<input id="key" type="password" autocomplete="off" placeholder="${(cfg.key||sessionKey)?'登録済み。変更時のみ入力':'Azure Portal のキーを入力'}"></label>
  <label class="check"><input id="f0" type="checkbox" ${cfg.f0?'checked':''}>Azure Portalでこのリソースの価格レベルがFree F0であることを確認した</label>
  <label class="check"><input id="remember" type="checkbox" ${cfg.key?'checked':''}>この個人端末にキーを保存する</label>
  <p class="meta">保存したキーはこのサイトと同一オリジンのコードから読み取れます。共用端末ではチェックを外してください。キーはバックアップ対象外です。</p><div class="actions">${btn('save-key','接続設定を保存','primary')}${btn('forget','キーを消去')}</div>
  <p class="tip">${u?'端末の今月の送信予約　採点 '+Math.ceil(u.assessmentSeconds/60)+'分 ・ 単独認識 '+Math.ceil(u.recognitionSeconds/60)+'分 ／ 共有上限 '+Math.round(u.limitSeconds/60)+'分。外部合成 '+u.ttsCharacters+'文字。':'利用量を読み取れません。'}</p><p class="meta">エラーと再試行も数えます。複数端末の利用量は合算されません。実際の利用量はAzure Portalで確認してください。</p>
  <h2>バックアップと復元</h2><p>学習記録・設定・録音をJSONにまとめます。音声を含むので保管先を選んでください。</p>
  <div class="actions">${btn('backup','バックアップを保存')}</div><label class="field">バックアップから復元<input type="file" id="restore" accept=".json,application/json"></label>
  <small>同じIDの項目と開始日・コース設定はバックアップの値に更新し、ほかの記録は保持します。旧アプリのJSONも読み込めます。</small>
  <h2>ホーム画面とオフライン</h2><p>iPhoneはSafariの共有メニュー、AndroidはChromeメニューから「ホーム画面に追加」または「アプリをインストール」を選びます。</p>
  <p id="offline-state" class="meta">オフライン教材の状態を確認しています。</p>
  <div class="actions">${btn('update','更新を確認')}${btn('persist','端末にデータの保持を依頼')}</div>
  <p class="meta">ブラウザのサイトデータを消すと録音や履歴も消えます。定期的にバックアップしてください。</p><p id="settings-result" role="status"></p>`;
  const el=id=>host.querySelector('#'+id), result=t=>{if(el('settings-result'))el('settings-result').textContent=t;notice(t);};
  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(()=>{if(el('offline-state'))el('offline-state').textContent='教材のオフライン保存が完了しました。Azure採点には通信が必要です。';});
  }else el('offline-state').textContent='このブラウザではPWAを利用できません。';
  host.onclick=async ev=>{
    const act=ev.target.closest('[data-action]')?.dataset.action;if(!act)return;ev.stopPropagation();
    try{
      if(act==='save-date'){const v=el('start-date').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('有効な開始日を選択してください。');await saveSetting('start',v);refresh();result('開始日を保存しました。');}
      if(act==='save-key'){
        const key=el('key').value.trim()||sessionKey||cfg.key,region=el('region').value.trim();
        if(!key||!/^[a-z][a-z0-9]{1,30}$/.test(region)||!el('f0').checked)throw Error('地域・キーとF0の確認が必要です。');
        const value={region,f0:true,key:el('remember').checked?key:''};await saveSetting('azure',value);Object.assign(cfg,value);sessionKey=key;el('key').value='';el('key').placeholder='登録済み。変更時のみ入力';result('接続設定を保存しました。');
      }
      if(act==='forget'){await remove('settings','azure');sessionKey='';cfg.key='';el('key').value='';el('key').placeholder='未登録';el('f0').checked=false;el('remember').checked=false;result('キーを消去しました。');}
      if(act==='backup'){const b=await exportBackup(),url=URL.createObjectURL(new Blob([JSON.stringify(b)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='english90-'+b.created.slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);result('バックアップを作成しました。');}
      if(act==='persist'){const ok=await navigator.storage?.persist?.();result(ok?'端末が永続ストレージを許可しました。':'保持の許可を取得できませんでした。バックアップを利用してください。');}
      if(act==='update')await update();
    }catch(e){result(errorText(e));}
  };
  el('restore').onchange=async ev=>{
    const file=ev.target.files[0];if(!file)return;
    try{if(!confirm('選択したJSONから学習データを復元しますか？'))return;const msg=await restoreBackup(JSON.parse(await file.text()));refresh();result(msg);}
    catch(e){result(errorText(e));}finally{ev.target.value='';}
  };
}
