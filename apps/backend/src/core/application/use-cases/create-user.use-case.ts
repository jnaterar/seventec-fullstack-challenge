import { User } from '@core/domain/entities/user.entity';
import { UserPort } from '../ports/user.port';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserDto } from '@backend/infrastructure/http/dtos/user.dto';

/**
 * DTO para la creación de un usuario
 */
export interface CreateUserDto extends Omit<UserDto, 'id'> {}

/**
 * Respuesta exitosa de la creación de usuario
 */
export interface CreateUserResponse {
  success: boolean;
  user: User;
}

/**
 * Errores específicos del caso de uso
 */
export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`El usuario con el correo ${email} ya existe`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(`Datos de usuario inválidos: ${message}`);
    this.name = 'InvalidUserDataError';
  }
}

/**
 * Caso de uso para crear un nuevo usuario
 * Sigue el patrón Command del Domain-Driven Design (DDD)
 */
export class CreateUserUseCase {
  constructor(private readonly userPort: UserPort) {}

  /**
   * Ejecuta el caso de uso para crear un usuario
   * @param userData Datos del usuario a crear
   * @returns Promesa que resuelve con el usuario creado
   * @throws {UserAlreadyExistsError} Si ya existe un usuario con el mismo correo
   * @throws {InvalidUserDataError} Si los datos del usuario son inválidos
   */
  async execute(userData: CreateUserDto): Promise<CreateUserResponse> {
    // Validar datos de entrada
    this.validateUserData(userData);

    // Verificar si el correo ya está en uso
    if (await this.userPort.isEmailTaken(userData.email)) {
      throw new UserAlreadyExistsError(userData.email);
    }

    // Crear la entidad de usuario
    const user = await this.userPort.create({
      ...userData,
      // Asegurar que el usuario tenga al menos el rol de PARTICIPANT por defecto
      roles: userData.roles?.length ? userData.roles : [UserRole.PARTICIPANT]
    });

    return {
      success: true,
      user
    };
  }

  /**
   * Valida los datos del usuario antes de crearlo
   * @param userData Datos del usuario a validar
   * @throws {InvalidUserDataError} Si los datos no son válidos
   */
  private validateUserData(userData: CreateUserDto): void {
    if (!userData.nombre || userData.nombre.trim().length === 0) {
      throw new InvalidUserDataError('El nombre es requerido');
    }

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new InvalidUserDataError('El correo electrónico no es válido');
    }

    if (userData.alergias && !Array.isArray(userData.alergias)) {
      throw new InvalidUserDataError('Las alergias deben ser un array');
    }

    if (userData.roles && !Array.isArray(userData.roles)) {
      throw new InvalidUserDataError('Los roles deben ser un array');
    }
  }
}