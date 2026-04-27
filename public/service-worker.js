// Service Worker для GlucoCalc PWA
// Обеспечивает кэширование и работу в офлайне

const CACHE_NAME = 'glucocalc-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Кэширование ресурсов');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Ошибка при кэшировании:', err);
      });
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем запросы не-GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Возвращаем кэшированный ответ, если он существует
      if (response) {
        return response;
      }

      // Иначе пытаемся получить ресурс с сети
      return fetch(event.request)
        .then((response) => {
          // Не кэшируем некорректные ответы
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Кэшируем успешные ответы
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Если сеть недоступна, возвращаем кэшированный ответ
          return caches.match(event.request);
        });
    })
  );
});
