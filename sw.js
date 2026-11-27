/* Service worker : installation sur l'écran d'accueil + notifications push (vibration, ouverture directe).
   Il ne met RIEN en cache : soldes, retraits et mises à jour viennent toujours du réseau. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',()=>{});

/* Notification reçue (même application fermée) */
self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{}}catch(_){try{d={body:e.data.text()}}catch(__){}}
  const k=d.kind||'info', urgent=(k==='admin'||k==='update');
  const opt={body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./#notif',kind:k},
    vibrate:urgent?[300,120,300,120,300]:[200,100,200],timestamp:Date.now(),requireInteraction:urgent};
  if(d.tag){opt.tag=d.tag;opt.renotify=true}
  e.waitUntil(self.registration.showNotification(d.title||"E-POKETR'BY",opt))});

/* Touche sur la notification : ramène l'application au premier plan et ouvre la liste */
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./#notif',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){c.postMessage({type:'notif'});return c.focus()}}
    return self.clients.openWindow(url)}))});
