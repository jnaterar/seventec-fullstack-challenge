import { UserRole } from '@backend/core/domain/enums/user-role.enum';

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
}

export interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface AuthPort {
  /**
   * Verifica un ID Token de Firebase y devuelve la información del usuario
   * @param idToken ID Token de Firebase
   * @returns Token personalizado y datos del usuario
   */
  verifyIdToken(idToken: string): Promise<{ 
    token: string;
    user: {
      uid: string;
      email?: string;
      displayName?: string;
      roles: string[];
    } 
  }>;

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

  /**
   * Envía un correo para restablecer la contraseña
   * @param email Email del usuario que desea restablecer su contraseña
   */
  resetPassword(email: string): Promise<{ message: string }>;

  /**
   * Obtiene un usuario por su correo electrónico
   * @param email Correo electrónico del usuario
   * @returns Información del usuario
   */
  getUserByEmail(email: string): Promise<UserRecord>;

  /**
   * Crea un token personalizado para un usuario
   * @param uid ID del usuario
   * @returns Token personalizado
   */
  createCustomToken(uid: string): Promise<string>;

  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario a crear
   * @returns Información del usuario creado
   */
  createUser(userData: CreateUserData): Promise<UserRecord>;
}
