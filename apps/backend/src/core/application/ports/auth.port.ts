import { UserRole } from '@backend/core/domain/enums/user-role.enum';

export interface AuthPort {
  /**
   * Inicia sesión con correo y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Token de autenticación
   */
  login(email: string, password: string): Promise<{ token: string }>;

  /**
   * Valida un token de autenticación
   * @param token Token a validar
   * @returns true si el token es válido
   */
  validateToken(token: string): Promise<boolean>;

  /**
   * Obtiene el perfil del usuario desde un token
   * @param token Token de autenticación
   * @returns Perfil del usuario
   */
  getProfileFromToken(token: string): Promise<{
    id    : string;
    email : string;
    roles : UserRole[];
  }>;
}
