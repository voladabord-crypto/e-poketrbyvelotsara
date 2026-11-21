/* Service worker : installation sur l'écran d'accueil + notifications push.
   Il ne met RIEN en cache : les données (soldes, retraits) et les mises à jour viennent toujours du réseau. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',()=>{});

/* Notification reçue (même application fermée) */
self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{}}catch(_){try{d={body:e.data.text()}}catch(__){}}
  const opt={body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./'}};
  if(d.tag)opt.tag=d.tag;
  e.waitUntil(self.registration.showNotification(d.title||"E-POKETR'BY",opt))});

/* Touche sur la notification : ouvre (ou ramène au premier plan) l'application */
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c)return c.focus()}
    return self.clients.openWindow(url)}))});
