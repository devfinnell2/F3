// ─────────────────────────────────────────────
//  F3 — Service Worker
//  Handles push notifications when app is closed
// ─────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'F3 Notification',
      body:  event.data.text(),
      icon:  '/icon-192.png',
      url:   '/dashboard/client',
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  data.icon  ?? '/icon-192.png',
      badge: '/icon-72.png',
      data:  { url: data.url ?? '/dashboard/client' },
      vibrate: [200, 100, 200],
      tag: 'f3-notification', // replaces previous if still showing
    })
  );
});

// ── Open the app when notification is tapped ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard/client';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Cache app shell on install ─────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));