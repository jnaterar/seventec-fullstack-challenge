import { Router } from 'express';
import { routeHandler } from '@backend/infrastructure/http/middlewares/common/routeHandler.middleware';
import { AuthController as Controller } from '@backend/infrastructure/http/controllers/auth.controller';

const router     = Router();
const controller = new Controller();

// Iniciar sesión
router.post('/login', routeHandler(controller.login));
// Validar token
router.post('/validate-token', routeHandler(controller.validateToken));
// Obtener perfil de usuario
router.post('/profile', routeHandler(controller.getProfile));

export { router as AuthRouter };
