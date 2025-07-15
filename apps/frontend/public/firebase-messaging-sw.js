// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Inicializar la aplicación Firebase
firebase.initializeApp({
  // Las credenciales de Firebase se cargarán desde el frontend
  // Este service worker solo necesita saber que la app existe
  apiKey: 'placeholder-value',
  authDomain: 'placeholder-value',
  projectId: 'placeholder-value',
  storageBucket: 'placeholder-value',
  messagingSenderId: 'placeholder-value',
  appId: 'placeholder-value',
});

// Obtener una instancia de Firebase Messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification.body || 'Nueva notificación de Seventec',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento de instalación del service worker
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service Worker instalado');
  self.skipWaiting();
});

// Evento de activación del service worker
self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service Worker activado');
  return self.clients.claim();
});

// Evento de notificación cuando el usuario hace clic en una notificación
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notificación clickeada:', event);
  
  // Cerrar la notificación
  event.notification.close();
  
  // Abrir el sitio o navegar a una URL específica
  const urlToOpen = event.notification.data?.postId
    ? `/post/${event.notification.data.postId}`
    : '/';
    
  // Abrir o enfocar una ventana existente
  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then(function(clientList) {
      // Revisar si ya hay una ventana/tab abierta con la URL
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventanas abiertas, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
