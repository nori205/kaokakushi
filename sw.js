const CACHE_NAME = 'kaokakushi-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vendor/face-api.min.js',
  './models/tiny_face_detector_model-weights_manifest.json',
  './models/tiny_face_detector_model-shard1',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先: オンラインなら常に最新版を取得し、キャッシュも更新する。
// オフラインの時だけキャッシュにフォールバックする(更新後も古い版が残り続けるのを防ぐため)。
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
