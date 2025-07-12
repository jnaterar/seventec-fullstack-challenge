import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Obtener ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);

// Obtener ruta absoluta del directorio del archivo actual
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el archivo .env en el directorio de backend
config({ path: path.resolve(__dirname, '../../.env') });

// Configuración de rutas
export const API_PATHS = {
  TEST     : '/test',
  USERS    : '/users',
  POSTS    : '/posts',
  COMMENTS : '/posts/:postId/comments',
  LIKES    : '/posts/:postId/likes',
  AUTH     : '/auth'
} as const;

// Configuración de JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';