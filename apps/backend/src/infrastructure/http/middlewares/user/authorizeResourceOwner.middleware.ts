import { RequestHandler, Request, Response, NextFunction } from 'express';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { AuthenticatedRequest } from '@backend/infrastructure/http/types/authenticated-request';

/**
 * Middleware de autorización que permite el acceso únicamente si el usuario autenticado 
 * es el propietario del recurso al que intenta acceder o modificar, o si posee un 
 * rol privilegiado (administrador)
 * 
 * @param req - Request Express con usuario autenticado
 * @param res - Response Express
 * @param next - NextFunction Express
 * @returns void
 */
export const authorizeResourceOwner: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  let statusCode = 403;
  let message    = 'No tienes permiso para acceder o modificar este recurso';   

  try {
    const { user }       = req as AuthenticatedRequest;
    const { roles, id }  = user;

    // Si es admin, puede acceder a cualquier recurso
    if (roles.includes(UserRole.ADMIN)) {
      return next();
    }

    // Si no es dueño del recurso
    if (id !== req.params.id) {
      res.status(statusCode).json({ statusCode, message });
      return;
    }

    // Si es dueño del recurso, continuar
    next();

  } catch (error) {
    statusCode = 500;
    message    = 'Error al verificar si el usuario es dueño del recurso';
    res.status(statusCode).json({ statusCode, message });
    next(error);
  }
};
