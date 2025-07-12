import { UserRole } from '@backend/core/domain/enums/user-role.enum';

/**
 * Interfaz para la representación JSON de un usuario
 */
export interface UserDto {
  id         : string;
  nombre     : string;
  email      : string;
  biografia ?: string;
  alergias  ?: string[];
  roles     ?: UserRole[];
  fcmTokens ?: string[];
}

export interface AuthUserPayload {
  id    : string;
  email : string;
  roles : UserRole[];
}

/**
 * DTO para actualizar un usuario existente
 */
export interface UpdateUserDto {
  nombre     ?: string;
  biografia  ?: string;
  alergias   ?: string[];
  roles      ?: UserRole[];
}