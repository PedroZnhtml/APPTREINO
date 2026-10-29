/**
 * Service Worker - IronPulse PWA
 * Suporte offline robusto com estratégia Cache First para assets estáticos
 * Totalmente compatível com subpastas (ex: GitHub Pages)
 */

const CACHE_NAME = 'ironpulse-cache-v6';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './cloud-config.js',
  './cloud-db.js',
  './auth.js',
  './taco.js',
  './db.js',
  './app.js',
  './manifest.json',
  './icon.svg'
];

// Instalação resiliente: armazena os arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Aviso ao carregar asset:', asset, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Ativação: remove versões antigas de caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições: responde do cache ou busca na rede
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
