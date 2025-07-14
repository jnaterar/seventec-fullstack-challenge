// Importaciones de Firebase
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase para el frontend
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Variable para almacenar la configuración cargada
let firebaseConfig: FirebaseConfig | null = null;

// Cargar la configuración desde el archivo JSON de forma asíncrona
// Construir la configuración desde variables de entorno Vite
const buildConfigFromEnv = (): FirebaseConfig | null => {
  const {
    VITE_FIREBASE_API_KEY: apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: authDomain,
    VITE_FIREBASE_PROJECT_ID: projectId,
    VITE_FIREBASE_STORAGE_BUCKET: storageBucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    VITE_FIREBASE_APP_ID: appId,
    VITE_FIREBASE_MEASUREMENT_ID: measurementId,
  } = import.meta.env as any;

  if (apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId) {
    return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } as FirebaseConfig;
  }
  return null;
};

// Cargar la configuración desde el archivo JSON de forma asíncrona
const loadFirebaseConfig = async (): Promise<FirebaseConfig> => {
  try {
    // Importación dinámica del archivo JSON desde la carpeta pública
    const response = await fetch('/firebase-web-keys.json', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!response.ok) {
      throw new Error('No se pudo cargar la configuración de Firebase');
    }
    
    const config = await response.json();
    
    // Validar configuración requerida
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      console.error('Configuración de Firebase incompleta:', config);
      throw new Error('La configuración de Firebase está incompleta');
    }
    
    // Asegurarse de que todas las propiedades requeridas estén presentes
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      console.error('Campos faltantes en la configuración de Firebase:', missingFields);
      throw new Error(`Faltan campos requeridos en la configuración de Firebase: ${missingFields.join(', ')}`);
    }
    
    return config as FirebaseConfig;
  } catch (error) {
    console.error('Error al cargar la configuración de Firebase:', error);
    // Intentar construir desde variables de entorno como respaldo
    const envConfig = buildConfigFromEnv();
    if (envConfig) {
      console.warn('Usando configuración de Firebase desde variables de entorno');
      return envConfig;
    }
    throw new Error('No se pudo cargar la configuración de Firebase. Verifica que el archivo firebase-web-keys.json exista en el directorio público, tenga el formato correcto o define las variables de entorno VITE_FIREBASE_* correspondientes.');
  }
};

// Inicializar la configuración
const initializeFirebaseConfig = async (): Promise<FirebaseConfig> => {
  if (!firebaseConfig) {
    const config = await loadFirebaseConfig();
    // Validar que la configuración sea válida
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      throw new Error('La configuración de Firebase está incompleta');
    }
    firebaseConfig = config;
  }
  return firebaseConfig;
};

// Variable para almacenar la promesa de inicialización
let initializationPromise: Promise<FirebaseConfig> | null = null;

// Función para obtener la configuración de Firebase
export const getFirebaseConfig = (): Promise<FirebaseConfig> => {
  if (!initializationPromise) {
    initializationPromise = initializeFirebaseConfig();
  }
  return initializationPromise;
};

// Inicializar Firebase
let firebaseApp: FirebaseApp;
let firebaseAuth: ReturnType<typeof getAuth>;

// Función para inicializar Firebase
export const initializeFirebase = async () => {
  try {
    const config = await getFirebaseConfig();
    
    // Inicializar la aplicación de Firebase si no existe
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    // Inicializar autenticación
    firebaseAuth = getAuth(firebaseApp);
    
    return { app: firebaseApp, auth: firebaseAuth };
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    throw error;
  }
};

// Inicializar Firebase inmediatamente
initializeFirebase().catch(error => {
  console.error('Error al inicializar Firebase:', error);
});

// Función para obtener la instancia de auth asegurando la inicialización
export const getAuthInstance = async () => {
  try {
    // Asegurarse de que Firebase esté inicializado
    await initializeFirebase();
    return getAuth();
  } catch (error) {
    console.error('Error al obtener la instancia de autenticación:', error);
    throw error;
  }
};

export default initializeFirebase;
