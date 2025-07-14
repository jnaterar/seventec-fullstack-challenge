import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

/**
 * DTO para la actualización del perfil del usuario autenticado
 * Ejemplo de uso:
 * {
 *   "nombre": "Jhonder Natera",
 *   "biografia": "Biografía del usuario",
 *   "alergias": ["alergia1", "alergia2"],
 *   "roles": ["ORGANIZER"]
 * }
 */
export class UpdateProfileDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  nombre?: string;

  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  @IsOptional()
  biografia?: string;

  @IsArray({ message: 'Las alergias deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada alergia debe ser una cadena de texto' })
  @IsOptional()
  alergias?: string[];

  @IsArray({ message: 'Los roles deben ser un arreglo' })
  @IsEnum(UserRole, { each: true, message: 'Cada rol debe ser un valor válido' })
  @IsOptional()
  roles?: UserRole[];
}
