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
