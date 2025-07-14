import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { AuthenticatedRequest } from '@backend/infrastructure/http/types/authenticated-request';

/**
 * Middleware para validar si el usuario tiene alguno de los roles permitidos
 * @param allowedRoles Roles permitidos para acceder al recurso
 */
export const requireUserRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    
    // Verificar si el usuario está autenticado
    if (!user) {
      return res.status(401).json({ 
        statusCode: 401, 
        message: 'Usuario no autenticado' 
      });
    }

    // Verificar si el usuario tiene los permisos necesarios
    const hasPermission = user.roles.some(role => allowedRoles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({ 
        statusCode: 403, 
        message: 'No tienes permisos suficientes' 
      });
    }
    
    // Si el usuario está autenticado y tiene permisos, continuar
    return next();
  };
};
