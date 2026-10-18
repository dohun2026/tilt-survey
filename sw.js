// 앱을 수정해서 올릴 때마다 아래 버전 숫자를 올려 주세요 (index.html의 APP_VERSION과 같게)
var CACHE_NAME = 'tilt-survey-v1';
var urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './xlsx.full.min.js',
  './exceljs.min.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 설치 시 앱 파일 전부를 폰에 저장 (오프라인용)
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); })
  );
  self.skipWaiting();
});

// 새 버전이 오면 예전 저장본 삭제
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; })
        .map(function(n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

// 저장본 우선, 없으면 인터넷
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
        }
        return res;
      }).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
