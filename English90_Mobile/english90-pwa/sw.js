// Retire only this prototype's cache and registration.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await caches.delete('english90-v1');
  await self.registration.unregister();
  const pages=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const page of pages) if(page.url.startsWith(self.registration.scope)) await page.navigate(new URL('../../',self.registration.scope).href);
})()));
