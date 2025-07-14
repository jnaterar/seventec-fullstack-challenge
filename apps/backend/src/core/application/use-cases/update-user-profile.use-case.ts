import { User } from '@core/domain/entities/user.entity';
import { UserPort } from '@backend/core/application/ports/user.port';
import { UpdateProfileDto } from '@backend/infrastructure/http/dtos/update-profile.dto';

/**
 * Error que se produce cuando se proporcionan datos inválidos para actualizar el usuario
 */
export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(`Datos de usuario inválidos: ${message}`);
    this.name = 'InvalidUserDataError';
  }
}

/**
 * Caso de uso para actualizar el perfil de un usuario existente
 */
export class UpdateUserProfileUseCase {
  constructor(private readonly userPort: UserPort) {}

  /**
   * Ejecuta el caso de uso para actualizar el perfil de usuario
   * @param userId ID del usuario a actualizar
   * @param updateData Datos para actualizar el perfil
   * @returns Usuario actualizado
   * @throws InvalidUserDataError si los datos proporcionados no son válidos
   */
  async execute(userId: string, updateData: Partial<UpdateProfileDto>): Promise<{ user: User }> {
    try {
      // Validaciones básicas
      if (updateData.nombre && updateData.nombre.trim() === '') {
        throw new InvalidUserDataError('El nombre no puede estar vacío');
      }
      
      // Buscar el usuario por ID
      const existingUser = await this.userPort.findById(userId);
      
      if (!existingUser) {
        throw new Error(`Usuario con id ${userId} no encontrado`);
      }
      
      // Convertir el objeto DTO a un objeto plano JavaScript para Firestore
      // Firestore no acepta objetos con prototipos personalizados
      const plainData: Record<string, any> = {};
      if (updateData.nombre !== undefined) plainData.nombre = updateData.nombre;
      if (updateData.biografia !== undefined) plainData.biografia = updateData.biografia;
      if (updateData.alergias !== undefined) plainData.alergias = [...updateData.alergias];
      if (updateData.roles !== undefined) plainData.roles = [...updateData.roles];
      
      // Actualizar usuario con el objeto plano
      const updatedUser = await this.userPort.update(userId, plainData);
      
      if (!updatedUser) {
        throw new Error('Error al actualizar el usuario');
      }
      
      return { user: updatedUser };
      
    } catch (error) {
      if (error instanceof InvalidUserDataError) {
        throw error;
      }
      // Relanzar cualquier otro error como un error genérico
      throw new Error(error instanceof Error ? error.message : 'Error desconocido al actualizar el perfil');
    }
  }
}
