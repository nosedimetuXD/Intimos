const CACHE_NAME = 'intimos-pwa-v3'
const OFFLINE_URL = '/index.html'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Clear ALL old caches on activate and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)))
    }).then(() => self.clients.claim())
  )
})

// Only intercept navigation if network completely fails, always returning a valid Response
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL)
        return (
          cached ||
          new Response(
            '<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Íntimos — Sin Conexión</title><style>body{background:#0F0F0F;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px}button{background:#2563EB;color:#fff;border:0;padding:12px 24px;border-radius:12px;font-weight:bold;margin-top:16px;cursor:pointer}</style></head><body><div><h2>Sin conexión a internet</h2><p style="color:#888;font-size:14px">Conéctate a una red wifi o datos para continuar.</p><button onclick="window.location.reload()">Reintentar</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        )
      })
    )
  }
})
