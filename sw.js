const CACHE_NAME = 'weather-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/assets/sun.png',
  '/assets/moon.png',
  '/assets/cloud.png',
  '/assets/clouds-day.png',
  '/assets/clouds-night.png',
  '/assets/rain-day.png',
  '/assets/heavy-rain.png',
  '/assets/shower-rain.png',
  '/assets/thunderstorm.png',
  '/assets/snow.png',
  '/assets/fog.png',
  '/assets/bg-image.jpg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
