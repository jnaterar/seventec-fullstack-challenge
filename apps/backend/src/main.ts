import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { initializeFirebase } from '@backend/infrastructure/persistence/firebase/firebase.config';
import cors from 'cors';
import { exec } from 'child_process';
import { API_PATHS } from '@backend/config';
import { verifyToken } from '@backend/infrastructure/http/middlewares/common/auth.middleware';
import { errorHandler } from '@backend/infrastructure/http/middlewares/common/error.middleware';
import { UserRouter } from '@backend/infrastructure/http/routes/user.route';
import { PostRouter } from '@backend/infrastructure/http/routes/post.route';
import { AuthRouter } from '@backend/infrastructure/http/routes/auth.route';

// Inicializar Firebase
initializeFirebase();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de autenticación con exclusión de rutas públicas
const authMiddleware = (req: any, res: any, next: any) => {
  // Lista de rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/api/auth',  // Todas las rutas de autenticación son públicas
    '/generate-token',
    '/api/users/signup'  // Ruta específica para registro
  ];

  // Si la ruta es pública, continuar sin verificar token
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Se requiere el encabezado de autorización' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Se requiere un token válido' });
    return;
  }

  verifyToken(token)
    .then((decoded: any) => {
      req.user = decoded;
      next();
    })
    .catch(() => {
      res.status(401).json({ message: 'Token inválido' });
    });
};

// Ruta Pública - Prueba
app.get(`/api${API_PATHS.TEST}`, (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API ejecutandose correctamente' });
});

// Ruta Pública - Generar Token
app.get(`/api${API_PATHS.AUTH}/generate-token`, (_req, res) => {
  exec('npx tsx apps/backend/src/scripts/generate-token.ts', (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando generate-token.ts:', stderr);
      return res.status(500).json({ message: 'Error generando token', error: stderr });
    }

    const token = stdout.split('Token:')[1].trim();
    return res.json(token);
  });
});

// Ruta Pública - Autenticación
app.use(`/api${API_PATHS.AUTH}`, AuthRouter);

// Middleware de autenticación aplicado después de rutas públicas
app.use(authMiddleware);

// Rutas Privadas - Usuarios
app.use(`/api${API_PATHS.USERS}`, UserRouter);

// Rutas Privadas - Posts
app.use(`/api${API_PATHS.POSTS}`, PostRouter);

// Manejo de errores global
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});

// Manejo de cierre de la aplicación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando correctamente.');
  server.close(() => {
    console.log('Proceso terminado');
  });
});

export { app };

