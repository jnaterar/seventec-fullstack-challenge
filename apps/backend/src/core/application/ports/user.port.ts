import { User } from '@core/domain/entities/user.entity';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserDto } from '@backend/infrastructure/http/dtos/user.dto';

/**
 * Interfaz que define las operaciones disponibles para el manejo de usuarios
 * Debe ser implementada por cualquier repositorio de usuarios
 */
export interface UserPort {
  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario a crear
   * @returns Promesa que resuelve con el usuario creado
   */
  create(userData: Omit<UserDto, 'id'>): Promise<User>;

  /**
   * Busca un usuario por su ID
   * @param id ID del usuario a buscar
   * @returns Promesa que resuelve con el usuario encontrado o null si no existe
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca usuarios por criterios específicos
   * @param criteria Criterios de búsqueda
   * @returns Promesa que resuelve con un array de usuarios que coinciden con los criterios
   */
  find(criteria?: Partial<UserDto>): Promise<User[]>;

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param updates Campos a actualizar
   * @returns Promesa que resuelve con el usuario actualizado o null si no existe
   */
  update(id: string, updates: Partial<Omit<UserDto, 'id'>>): Promise<User | null>;

  /**
   * Elimina un usuario por su ID
   * @param id ID del usuario a eliminar
   * @returns Promesa que resuelve con true si se eliminó correctamente, false en caso contrario
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verifica si un correo electrónico ya está en uso
   * @param email Correo electrónico a verificar
   * @param excludeId ID de usuario a excluir de la verificación (útil en actualizaciones)
   * @returns Promesa que resuelve con true si el correo ya está en uso, false en caso contrario
   */
  isEmailTaken(email: string, excludeId?: string): Promise<boolean>;

  /**
   * Busca un usuario por su correo electrónico
   * @param email Correo electrónico del usuario a buscar
   * @returns Promesa que resuelve con el usuario encontrado o null si no existe
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca usuarios por rol
   * @param role Rol por el cual filtrar los usuarios
   * @returns Promesa que resuelve con un array de usuarios que tienen el rol especificado
   */
  findByRole(role: UserRole): Promise<User[]>;
}