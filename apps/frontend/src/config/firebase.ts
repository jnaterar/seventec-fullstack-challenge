import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirebaseConfig } from '@frontend/config/firebase-config';
import { logger } from '@frontend/shared/utils/logger';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initializationPromise: Promise<{ app: FirebaseApp; auth: Auth }> | null = null;

// Función para inicializar Firebase de forma asíncrona
export const initializeFirebase = async (): Promise<{ app: FirebaseApp; auth: Auth }> => {
  // Si ya está inicializado, devolver las instancias existentes
  if (app && auth) {
    return { app, auth };
  }

  // Si ya se está inicializando, devolver la promesa existente
  if (initializationPromise) {
    return initializationPromise;
  }

  try {
    // Crear una nueva promesa de inicialización
    initializationPromise = (async () => {
      // Cargar la configuración de Firebase
      const config = await getFirebaseConfig();
      
      // Verificar si ya hay una aplicación de Firebase inicializada
      const existingApps = getApps();
      
      // Usar la aplicación existente o crear una nueva
      app = existingApps.length ? existingApps[0] : initializeApp(config);
      
      // Obtener la instancia de autenticación
      auth = getAuth(app);
      
      return { app, auth };
    })();

    // Esperar a que se complete la inicialización
    return await initializationPromise;
  } catch (error) {
    logger.error('Error al inicializar Firebase:', error);
    initializationPromise = null;
    throw new Error('No se pudo inicializar Firebase. Por favor, verifica la configuración.');
  }
};

// Exportar getters para acceder a las instancias de Firebase
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase no ha sido inicializado. Por favor, llama a initializeFirebase() primero.');
  }
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth no ha sido inicializado. Por favor, llama a initializeFirebase() primero.');
  }
  return auth;
};

// Inicializar Firebase automáticamente al cargar el módulo
initializeFirebase().catch(error => {
  logger.error('Error al inicializar Firebase:', error);
});
