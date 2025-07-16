import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { onMessage } from 'firebase/messaging';
import { userService } from '../features/profile/services/userService';
import { initializeFirebase } from '../config/firebase-config';
import { logger } from '@frontend/shared/utils/logger';

// Variable para almacenar si ya se solicitaron permisos
let permissionsRequested = false;

/**
 * Servicio para gestionar las notificaciones push
 */
export class NotificationService {
  private static instance: NotificationService;
  private messaging: any = null;

  private constructor() {
    try {
      // Inicializar Firebase Messaging una vez que la app esté lista
      this.initMessaging();
    } catch (error) {
      logger.error('Error al inicializar el servicio de notificaciones:', error);
    }
  }

  /**
   * Obtiene la instancia del servicio de notificaciones (Singleton)
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Inicializa Firebase Messaging
   */
  private async initMessaging() {
    try {
      // Verificar que estamos en un navegador con soporte para Service Workers
      if (!('serviceWorker' in navigator)) {
        logger.warn('Este navegador no soporta Service Workers, las notificaciones no funcionarán');
        return;
      }

      // Asegurarnos de que Firebase esté inicializado correctamente
      const { app } = await initializeFirebase();
      
      // Importar dinámicamente el módulo de messaging
      const { getMessaging } = await import('firebase/messaging');
      this.messaging = getMessaging(app);

      // Establecer un listener para cuando el usuario cambie de estado de autenticación
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // El usuario inició sesión, solicitar token FCM
          this.requestPermissionAndRegisterToken();
        }
      });

      logger.log('Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      logger.error('Error al inicializar Firebase Messaging:', error);
    }
  }

  /**
   * Solicita permiso para mostrar notificaciones y registra el token FCM
   */
  public async requestPermissionAndRegisterToken(): Promise<boolean> {
    // Evitar solicitar permisos múltiples veces en la misma sesión
    if (permissionsRequested) {
      logger.log('Ya se solicitaron permisos de notificación en esta sesión');
      return true;
    }
    permissionsRequested = true;

    try {
      if (!this.messaging) {
        // Asegurarnos de que Firebase esté inicializado correctamente
        const { app } = await initializeFirebase();
        const { getMessaging } = await import('firebase/messaging');
        this.messaging = getMessaging(app);
      }

      // Solicitar permiso para mostrar notificaciones
      logger.log('Solicitando permiso para notificaciones...');
      
      const { getToken } = await import('firebase/messaging');
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        logger.warn('Permiso para notificaciones denegado');
        return false;
      }

      logger.log('Permiso para notificaciones concedido');

      // Registrar el service worker si no está registrado
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        logger.log('Service Worker registrado correctamente:', registration);
      } catch (e) {
        logger.error('Error al registrar el Service Worker:', e);
        return false;
      }

      // Obtener el token FCM
      const token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
      });

      if (token) {
        logger.log('Token FCM obtenido:', token);
        // Enviar el token al servidor
        await this.saveTokenToServer(token);
        return true;
      } else {
        logger.warn('No se pudo obtener un token FCM');
        return false;
      }
    } catch (error) {
      logger.error('Error al solicitar permiso o registrar token:', error);
      return false;
    }
  }

  /**
   * Guarda el token FCM en el servidor
   */
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      // Enviar el token al backend
      await userService.saveUserFcmToken(token);
      logger.log('Token FCM guardado en el servidor correctamente');
    } catch (error) {
      logger.error('Error al guardar el token FCM en el servidor:', error);
    }
  }

  /**
   * Configura un listener para mensajes en primer plano
   */
  public setupForegroundNotifications(): void {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      logger.log('Mensaje recibido en primer plano:', payload);
      
      // Mostrar una notificación personalizada
      if (payload.notification) {
        const { title, body } = payload.notification;
        this.showCustomNotification(title as string, body as string, payload.data);
      }
    });
  }

  /**
   * Muestra una notificación personalizada
   */
  private showCustomNotification(title: string, body: string, data?: any): void {
    if (!('Notification' in window)) {
      logger.warn('Este navegador no soporta notificaciones');
      return;
    }

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data,
        });
      });
    }
  }
}

// Exportar la instancia del servicio
export const notificationService = NotificationService.getInstance();
