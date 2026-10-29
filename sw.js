/**
 * Service Worker - IronPulse PWA
 * Suporte offline robusto com estratégia Cache First para assets estáticos
 * Totalmente compatível com subpastas (ex: GitHub Pages)
 */

const CACHE_NAME = 'ironpulse-cache-v9';

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

// Instalação: armazena os arquivos e pula espera
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

// Ativação: remove versões antigas de caches e reivindica clientes
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

// Interceptação: Network First com fallback de Cache para assets locais
self.addEventListener('fetch', (event) => {
  // Ignora chamadas externas (ex: Firebase RTDB)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Tenta sempre a rede primeiro para garantir que atualizações cheguem imediatamente
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (ex: offline), entrega do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Suporte para pular espera imediata
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
