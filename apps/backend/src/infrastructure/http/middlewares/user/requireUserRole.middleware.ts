import { Request, Response, NextFunction } from 'express';
import { AuthUserPayload } from '@backend/infrastructure/http/dtos/user.dto';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { AuthenticatedRequest } from '@backend/infrastructure/http/types/authenticated-request';

/**
 * Middleware para validar si el usuario tiene alguno de los roles permitidos
 * @param allowedRoles Roles permitidos para acceder al recurso
 */
export const requireUserRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    let statusCode = 401;
    let message    = 'Usuario no autenticado';

    if (!user) {
      return res.status(statusCode).json({ statusCode, message });
    }

    const hasPermission = user.roles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      statusCode = 403;
      message    = 'No tienes permisos suficientes';

      return res.status(statusCode).json({ statusCode, message });
    }

    next();
  };
};
