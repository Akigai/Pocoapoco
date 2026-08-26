var CACHE = "poco-a-poco-v1";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Network-first for navigations (so updates arrive), cache fallback for offline.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return; // let fonts etc. go to network
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){ return hit || caches.match("./index.html"); });
    })
  );
});

self.addEventListener("push", function(e){
  var data = { title: "Poco a Poco", body: "¡Hola! Tu español te espera." };
  try { if(e.data) data = e.data.json(); } catch(err){ if(e.data) data.body = e.data.text(); }
  e.waitUntil(self.registration.showNotification(data.title || "Poco a Poco", {
    body: data.body || "",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: self.registration.scope }
  }));
});

self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list){
      for(var i = 0; i < list.length; i++){
        if(list[i].url.indexOf(self.registration.scope) === 0 && "focus" in list[i]) return list[i].focus();
      }
      return clients.openWindow(e.notification.data && e.notification.data.url || "./");
    })
  );
});
