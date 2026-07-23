/* Assam Rain & Flood Watch — service worker
   Strategy:
   - App shell (index + app-logic + manifest + icons): precached, cache-first
   - API data (Open-Meteo, GloFAS flood, RainViewer, Copernicus, CWC Proxy): network-first,
     last-good copy kept in cache as offline fallback
   - Everything else static (fonts, Leaflet, Chart.js, map tiles): stale-while-revalidate
*/

// V4 BUMP: This forces all user browsers to delete the old broken cache and download the fixed app
var VERSION = 'arfw-v4';  
var SHELL_CACHE = VERSION + '-shell';
var RUNTIME_CACHE = VERSION + '-runtime';
var DATA_CACHE = VERSION + '-data';
var MAX_RUNTIME_ITEMS = 400;

var SHELL = [
  './',
  './index.html',
  './app-logic.js', // NEW: Added your external logic file to the core shell
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

var API_HOSTS = [
  'api.open-meteo.com',
  'flood-api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'api.rainviewer.com',
  'global-flood-awareness-system.ecmwf.int', // NEW: Added Copernicus River WMS
  'corsproxy.io' // NEW: Added CWC data proxy
];

self.addEventListener('install', function(e){
  // Skip waiting forces the waiting service worker to become the active service worker
  self.skipWaiting();
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function(c){ return c.addAll(SHELL); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // Delete any old caches that do not match the current V4 version strings
        if(k !== SHELL_CACHE && k !== RUNTIME_CACHE && k !== DATA_CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function trimCache(cacheName, maxItems){
  caches.open(cacheName).then(function(c){
    c.keys().then(function(keys){
      if(keys.length > maxItems){
        c.delete(keys[0]).then(function(){ trimCache(cacheName, maxItems); });
      }
    });
  });
}

function networkFirst(request, cacheName){
  return fetch(request).then(function(resp){
    if(resp && resp.ok){
      var clone = resp.clone();
      caches.open(cacheName).then(function(c){ c.put(request, clone); });
    }
    return resp;
  }).catch(function(){
    return caches.match(request).then(function(cached){
      return cached || Response.error();
    });
  });
}

function staleWhileRevalidate(request){
  return caches.match(request).then(function(cached){
    var fetchPromise = fetch(request).then(function(resp){
      if(resp && (resp.ok || resp.type === 'opaque')){
        var clone = resp.clone();
        caches.open(RUNTIME_CACHE).then(function(c){
          c.put(request, clone);
          trimCache(RUNTIME_CACHE, MAX_RUNTIME_ITEMS);
        });
      }
      return resp;
    }).catch(function(){
      return cached || Response.error();
    });
    return cached || fetchPromise;
  });
}

self.addEventListener('fetch', function(e){
  var request = e.request;
  if(request.method !== 'GET') return;
  var url;
  try{ url = new URL(request.url); }catch(err){ return; }

  // page navigations: fresh page when online, cached shell when offline
  if(request.mode === 'navigate'){
    e.respondWith(
      networkFirst(request, SHELL_CACHE).then(function(resp){
        return resp;
      }).catch(function(){
        return caches.match('./index.html');
      })
    );
    return;
  }

  if(API_HOSTS.indexOf(url.hostname) !== -1){
    e.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if(url.protocol === 'https:' || url.protocol === 'http:'){
    e.respondWith(staleWhileRevalidate(request));
  }
});
