// A backgrounded or closed tab never accumulates an overnight study session.
const key='english90.active.v2';
let state=null;
try{state=JSON.parse(sessionStorage.getItem(key));if(state)state.start=null;}catch{}
const write=()=>{if(state)sessionStorage.setItem(key,JSON.stringify(state));else sessionStorage.removeItem(key);};
export function elapsed(){return state?state.ms+(state.start!=null?Math.max(0,Date.now()-state.start):0):0;}
export function pause(){if(state){state.ms=elapsed();state.start=null;write();}}
export function resume(){if(state&&state.start==null){state.start=Date.now();write();}}
export function start(day,task,mode,date){
  if(!state)state={id:crypto.randomUUID(),day,task,mode,date,ms:0,start:null};
  resume();return state;
}
export function clear(){state=null;write();}
export const active=()=>state;
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
addEventListener('pagehide',pause);
setInterval(()=>{if(state?.start!=null){state.ms=elapsed();state.start=Date.now();write();}},5000);
