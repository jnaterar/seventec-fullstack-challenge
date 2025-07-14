import { User } from '@core/domain/entities/user.entity';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { IsString, IsEmail, IsOptional, IsArray, IsNotEmpty, IsEnum, MinLength } from 'class-validator';

/**
 * DTO para la creación de un usuario a través de HTTP
 * Ejemplo de uso:
 * {
 *   "nombre": "Jhonder Natera",
 *   "email": "jhonder.natera@example.com",
 *   "biografia": "Biografía del usuario",
 *   "alergias": ["alergia1", "alergia2"],
 *   "roles": ["ORGANIZER"]
 * }
 */
export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

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

/**
 * DTO para la actualización de un usuario a través de HTTP 
 * Ejemplo de uso:
 * {
 *   "id": "1",
 *   "nombre": "Jhonder Natera",
 *   "email": "jhonder.natera@example.com",
 *   "biografia": "Biografía del usuario",
 *   "alergias": ["alergia1", "alergia2"],
 *   "roles": ["ORGANIZER"]
 * }
 */
export class UpdateUserDto implements Partial<Omit<CreateUserDto, 'id'>> {
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID es requerido' })
  id!: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  nombre?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  email?: string;

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

/**
 * DTO para la respuesta de la API de usuarios
 */
export interface UserResponseDto {
  id        : string;
  nombre    : string;
  email     : string;
  biografia : string;
  alergias  : string[];
  roles     : UserRole[];
}

/**
 * Mapeador para convertir entre la entidad User y los DTOs HTTP
 */
export class UserHttpMapper {
  /**
   * Convertir DTO de creación a entidad User
   */
  static toDomain(dto: CreateUserDto, id: string): User {
    return new User({
      id,
      nombre    : dto.nombre,
      email     : dto.email,
      biografia : dto.biografia || '',
      alergias  : dto.alergias  || [],
      roles     : dto.roles     || [UserRole.PARTICIPANT]
    });
  }

  /**
   * Convertir entidad User a DTO de respuesta
   */
  static toResponse(user: User): UserResponseDto {
    return {
      id        : user.id,
      nombre    : user.nombre,
      email     : user.email,
      biografia : user.biografia,
      alergias  : user.alergias,
      roles     : user.roles
    };
  }

  /**
   * Actualizar entidad User con datos de actualización
   */
  static updateEntity(user: User, dto: UpdateUserDto): User {
    const updatedUser = user.clone();
    
    // Actualizar campos usando los setters de la entidad
    if (dto.nombre    !== undefined) updatedUser.nombre    = dto.nombre;
    if (dto.biografia !== undefined) updatedUser.biografia = dto.biografia;
    
    // Actualizar alergias
    if (dto.alergias !== undefined) {
      // Primero limpiamos las alergias existentes
      const alergiasActuales = [...updatedUser.alergias];
      alergiasActuales.forEach(alergia => updatedUser.eliminarAlergia(alergia));
      
      // Luego agregamos las nuevas alergias
      dto.alergias.forEach(alergia => updatedUser.agregarAlergia(alergia));
    }
    
    // Actualizar roles
    if (dto.roles !== undefined) {
      updatedUser.setRoles(dto.roles);
    }
    
    return updatedUser;
  }
}
