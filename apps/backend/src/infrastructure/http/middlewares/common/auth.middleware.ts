import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@backend/config';
import { AuthUserPayload } from '@backend/infrastructure/http/dtos/user.dto';

/**
 * Verifica y decodifica un token JWT
 * 
 * @param token Token JWT a verificar
 * @returns Promesa que resuelve con el token decodificado
 * @throws Si el token es inválido
 */
export const verifyToken = async (token: string): Promise<AuthUserPayload> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

/**
 * Middleware para autenticar peticiones mediante JWT
 * Verifica el token de autenticación y adjunta el usuario a la solicitud
 */
export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
    }

    try {
      // Verificar y decodificar el token
      const decoded = await verifyToken(token);
      
      // Adjuntar el usuario decodificado a la solicitud
      (req as any).user = decoded;
      
      // Continuar con el siguiente middleware
      return next();
    } catch (error: any) {
      console.error('Error al verificar el token:', error);
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
