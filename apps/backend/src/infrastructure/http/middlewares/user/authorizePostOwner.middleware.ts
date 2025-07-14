import { RequestHandler, Request, Response, NextFunction } from 'express';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { AuthenticatedRequest } from '@backend/infrastructure/http/types/authenticated-request';
import { PostFirestoreRepository } from '@backend/infrastructure/persistence/firebase/post.firestore.repository';

/**
 * Middleware de autorización que permite el acceso únicamente si el usuario autenticado 
 * es el propietario del post al que intenta acceder o modificar, o si posee un 
 * rol privilegiado (administrador u organizador)
 * 
 * @param req - Request Express con usuario autenticado
 * @param res - Response Express
 * @param next - NextFunction Express
 * @returns void
 */
export const authorizePostOwner: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  let statusCode = 403;
  let message    = 'No tienes permiso para acceder o modificar esta publicación';   

  try {
    const { user } = req as AuthenticatedRequest;
    const { roles } = user;

    // Si es admin u organizador, puede acceder a cualquier recurso
    if (roles.includes(UserRole.ADMIN) || roles.includes(UserRole.ORGANIZER)) {
      return next();
    }

    const postId = req.params.postId;
    
    // Si no hay postId, continuar (puede ser una creación)
    if (!postId) {
      return next();
    }

    // Obtener el post para verificar si el usuario es el dueño
    const postRepo = new PostFirestoreRepository();
    const post = await postRepo.findById(postId);
    
    // Si no existe el post
    if (!post) {
      statusCode = 404;
      message = 'La publicación no existe';
      return res.status(statusCode).json({ statusCode, message });
    }
    
    // Si no es dueño del post
    if (user.id !== post.userId) {
      return res.status(statusCode).json({ statusCode, message });
    }

    // Si es dueño del post, continuar
    next();

  } catch (error) {
    statusCode = 500;
    message    = 'Error al verificar si el usuario es dueño de la publicación';
    res.status(statusCode).json({ statusCode, message });
  }
};
