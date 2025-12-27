// Service Worker for WebClone Pro 2026
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'webclone-pro-v1.0.0'
const STATIC_CACHE = 'webclone-static-v1.0.0'
const DYNAMIC_CACHE = 'webclone-dynamic-v1.0.0'

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/templates',
  '/ai-models',
  '/offline',
  '/manifest.json',
  // Add your CSS and JS assets here
  // '/assets/main.css',
  // '/assets/main.js'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/health/,
  /^\/api\/templates/,
  /^\/api\/models/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same origin requests
    if (url.pathname.startsWith('/api/')) {
      // API requests - network first with cache fallback
      event.respondWith(handleApiRequest(request))
    } else if (url.pathname.startsWith('/_next/static/')) {
      // Static assets - cache first
      event.respondWith(handleStaticAssets(request))
    } else {
      // App shell - network first with cache fallback
      event.respondWith(handleAppShell(request))
    }
  }
})

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  // Check if this API should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
  
  if (!shouldCache) {
    // Just fetch from network for non-cacheable APIs
    try {
      return await fetch(request)
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Network unavailable', 
        offline: true 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Network first with cache fallback for cacheable APIs
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // No cache available, return offline response
    return new Response(JSON.stringify({ 
      error: 'Network unavailable and no cached data', 
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle static assets with cache first strategy
async function handleStaticAssets(request) {
  // Cache first
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Could not fetch from network
    return new Response('Asset not available offline', {
      status: 404,
      statusText: 'Not Found'
    })
  }
}

// Handle app shell with network first strategy
async function handleAppShell(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // No cache available, return offline page if it's a navigation request
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline')
      return offlineResponse || new Response('Offline', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    return new Response('Content not available offline', {
      status: 404,
      statusText: 'Not Found'
    })
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag)
  
  if (event.tag === 'project-sync') {
    event.waitUntil(syncProjects())
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics())
  }
})

// Sync projects when connection is restored
async function syncProjects() {
  try {
    // Get pending projects from IndexedDB
    const pendingProjects = await getPendingProjects()
    
    for (const project of pendingProjects) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(project.data)
        })
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingProject(project.id)
          
          // Show success notification
          self.registration.showNotification('Project Synced', {
            body: `Project "${project.data.name}" has been synchronized`,
            icon: '/icons/manifest-icon-192.maskable.png',
            badge: '/icons/badge-72x72.png',
            tag: 'project-sync'
          })
        }
      } catch (error) {
        console.error('[SW] Failed to sync project:', project.id, error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    const pendingAnalytics = await getPendingAnalytics()
    
    for (const analytics of pendingAnalytics) {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(analytics.data)
        })
        
        if (response.ok) {
          await removePendingAnalytics(analytics.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync analytics:', analytics.id, error)
      }
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error)
  }
}

// IndexedDB helpers for offline storage
async function getPendingProjects() {
  // This would be implemented with IndexedDB
  return []
}

async function removePendingProject(id) {
  // This would remove from IndexedDB
}

async function getPendingAnalytics() {
  // This would be implemented with IndexedDB
  return []
}

async function removePendingAnalytics(id) {
  // This would remove from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: 'You have new updates in WebClone Pro',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('WebClone Pro', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})