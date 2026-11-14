/* Service worker : tout le contenu est servi depuis le cache, puis rafraîchi en arrière-plan.
   Changer VERSION force le renouvellement complet du cache. */
const VERSION = 'v5';
const CACHE = `hyderabad-${VERSION}`;
const SOCLE = [
  './',
  'css/style.css',
  'js/app.js',
  'data/trip.json',
  'data/trip.es.json',
  'assets/photos/credits.json',
  'manifest.webmanifest',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SOCLE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

async function prevenir(type) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type }));
}

async function repondre(event) {
  const url = new URL(event.request.url);
  // Toute navigation reçoit la page unique de l'appli ; les paramètres d'URL sont ignorés pour le cache.
  const cle = event.request.mode === 'navigate' ? new URL('./', self.registration.scope).href : url.origin + url.pathname;
  const cache = await caches.open(CACHE);
  const enCache = await cache.match(cle);

  const reseau = fetch(cle, { cache: 'no-cache' }).then(async (reponse) => {
    if (reponse.ok) {
      if (enCache && /data\/trip(\.es)?\.json$/.test(cle)) {
        const [avant, apres] = await Promise.all([enCache.clone().text(), reponse.clone().text()]);
        if (avant !== apres) prevenir('planning-mis-a-jour');
      }
      await cache.put(cle, reponse.clone());
    }
    return reponse;
  });

  if (enCache) {
    event.waitUntil(reseau.catch(() => {}));
    return enCache;
  }
  return reseau.catch(() => Response.error());
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Le test réseau du bouton « Forcer la mise à jour » (?maj=…) doit réellement partir sur le réseau.
  if (url.searchParams.has('maj')) return;
  event.respondWith(repondre(event));
});
