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

// Configuración de URL Frontend
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// Configuración de URL Reset Password
export const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL || 'http://localhost:4200/reset-password';

// Configuración de JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';