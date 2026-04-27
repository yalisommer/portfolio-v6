// Service worker to inject COOP/COEP headers for SharedArrayBuffer support.
// GitHub Pages does not allow custom HTTP headers, so this SW intercepts
// responses and adds them. Required for ONNX Runtime Web threaded WASM backend.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigations and subresources
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      })
    )
  } else if (event.request.url.startsWith(self.location.origin)) {
    // Same-origin subresources: add COEP/CORP headers
    event.respondWith(
      fetch(event.request).then((response) => {
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
        newHeaders.set('Cross-Origin-Resource-Policy', 'same-origin')
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      })
    )
  }
})
