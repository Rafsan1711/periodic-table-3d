/**
 * Service Worker for Offline Support
 * ✅ Cache static assets
 * ✅ Offline functionality
 * ✅ Fast loading from cache
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `periodic-table-${CACHE_VERSION}`;

// Files to cache immediately (critical resources)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/data/elements-data.js',
    '/js/data/molecules-data.js',
    '/js/data/reactions-data.js',
    '/js/data/reactivity-data.js',
    '/js/threejs-cache.js'
];

// CDN resources to cache on first load
const CDN_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    'https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js'
];

/**
 * Install event - cache critical files
 */
self.addEventListener('install', event => {
    console.log('[SW] 📦 Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] ✅ Caching app shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .catch(error => {
                console.error('[SW] ❌ Failed to cache:', error);
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', event => {
    console.log('[SW] 🔄 Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('[SW] 🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip chrome extensions and non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Handle Firebase requests separately (always network)
    if (url.hostname.includes('firebase') || url.hostname.includes('firebaseapp')) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Cache strategy: Cache First, fallback to Network
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('[SW] 📂 Serving from cache:', url.pathname);
                    return cachedResponse;
                }
                
                // Clone request for caching
                const fetchRequest = request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache new files (skip large files)
                        const contentLength = response.headers.get('content-length');
                        const isSmallFile = !contentLength || parseInt(contentLength) < 5000000; // < 5MB
                        
                        if (isSmallFile) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseToCache);
                            });
                        }
                        
                        console.log('[SW] 🌐 Fetched from network:', url.pathname);
                        return response;
                    })
                    .catch(error => {
                        console.error('[SW] ❌ Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // Return offline message for other requests
                        return new Response('Offline - cached version not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', event => {
    const { data } = event;
    
    // Skip waiting and activate immediately
    if (data === 'skipWaiting') {
        console.log('[SW] ⚡ Skipping waiting...');
        self.skipWaiting();
    }
    
    // Clear all caches
    if (data === 'clearCache') {
        console.log('[SW] 🧹 Clearing all caches...');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('[SW] ✅ All caches cleared');
            })
        );
    }
    
    // Get cache size
    if (data === 'getCacheSize') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.keys().then(keys => {
                    return { cacheSize: keys.length };
                });
            }).then(result => {
                event.ports[0].postMessage(result);
            })
        );
    }
});

/**
 * Sync event - background sync (future feature)
 */
self.addEventListener('sync', event => {
    console.log('[SW] 🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Background sync function
 */
async function syncData() {
    try {
        console.log('[SW] 📡 Syncing data...');
        // Add your sync logic here
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] ❌ Sync failed:', error);
        return Promise.reject(error);
    }
}

console.log('[SW] ✅ Service Worker script loaded');
