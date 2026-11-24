import {mountStudio} from './lib/studio.mjs';
import {migrateLegacy} from './lib/store.mjs';
const root=document.querySelector('main');
try {
  await migrateLegacy();
  await mountStudio(root,{label:'発音診断',day:1,purpose:'practice',editable:true,text:'The work will start on Thursday.',credentials:()=>null});
}catch(error){root.textContent=error.message;}
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
