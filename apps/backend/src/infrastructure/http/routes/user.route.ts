import { Router } from 'express';
import { UserController as Controller } from '@backend/infrastructure/http/controllers/user.controller';
import { routeHandler } from '@backend/infrastructure/http/middlewares/common/routeHandler.middleware';
import { validateRequest } from '@backend/infrastructure/http/middlewares/user/validateRequest.middleware';
import { authorizeResourceOwner } from '@backend/infrastructure/http/middlewares/user/authorizeResourceOwner.middleware';
import { CreateUserDto, UpdateUserDto } from '@backend/infrastructure/http/mappers/user.mapper';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { requireUserRole } from '@backend/infrastructure/http/middlewares/user/requireUserRole.middleware';
import { authenticateToken } from '@backend/infrastructure/http/middlewares/common/auth.middleware';

// Inicializar enrutador y controlador
const router = Router();
const controller = Controller.getInstance();

// Obtener perfil del usuario autenticado
router.get(
  '/profile',
  authenticateToken,
  routeHandler(controller.getProfile)
);

// Obtener todos los usuarios
router.get(
  '/',
  requireUserRole(UserRole.ADMIN),
  routeHandler(controller.getUsers)
);

// Obtener un usuario por ID
router.get(
  '/:id',
  requireUserRole(UserRole.ADMIN),
  routeHandler(controller.getUserById)
);

// Crear un nuevo usuario (ruta pública para registro)
router.post(
  '/signup',
  validateRequest(CreateUserDto, 'body'),
  routeHandler(controller.createUser)
);

// Actualizar un usuario existente
router.put(
  '/:id',
  requireUserRole(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.PARTICIPANT),
  authorizeResourceOwner,
  validateRequest(UpdateUserDto, 'body'),
  routeHandler(controller.updateUser)
);

// Eliminar un usuario
router.delete(
  '/:id',
  requireUserRole(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.PARTICIPANT),
  authorizeResourceOwner,
  routeHandler(controller.deleteUser)
);

export { router as UserRouter };
