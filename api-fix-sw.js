// API Fix Service Worker
const CLOUD_RUN_API = 'https://image-generation-api-569099138803.us-central1.run.app';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is an API request to the relative /api endpoint
  if (url.pathname.startsWith('/api/')) {
    console.log('[Service Worker] Intercepting API request:', url.pathname);
    
    // Create a new URL pointing to the Cloud Run service
    const apiUrl = new URL(url.pathname, CLOUD_RUN_API);

    event.respondWith((async () => {
      try {
        // Clone request safely
        const reqClone = event.request.clone();

        // Build init preserving method, headers and body
        const init = {
          method: reqClone.method,
          headers: reqClone.headers,
          // Only include body for methods that support it
          body: ['GET', 'HEAD'].includes(reqClone.method.toUpperCase())
            ? undefined
            : await reqClone.arrayBuffer(),
          mode: 'cors',
          // Include credentials to forward cookies if any
          credentials: 'include',
          redirect: 'follow'
        };

        console.log('[Service Worker] Redirecting to:', apiUrl.toString());
        const resp = await fetch(apiUrl.toString(), init);
        console.log('[Service Worker] API response status:', resp.status);
        return resp;
      } catch (error) {
        console.error('[Service Worker] API fetch error:', error);
        return new Response(JSON.stringify({
          error: 'API request failed: ' + (error && error.message ? error.message : String(error))
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }
  
  // For all other requests, proceed normally
});
