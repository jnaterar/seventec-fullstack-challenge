import { UserPort } from '@backend/core/application/ports/user.port';
import { User } from '@backend/core/domain/entities/user.entity';

/**
 * Caso de uso para guardar un token FCM de un usuario
 */
export class SaveUserFcmTokenUseCase {
  constructor(private readonly userPort: UserPort) {}

  /**
   * Guarda o actualiza un token FCM para un usuario
   * @param userId ID del usuario
   * @param token Token FCM a guardar
   */
  async execute(userId: string, token: string): Promise<User> {
    // Verificar que el usuario exista
    const user = await this.userPort.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si el token ya existe
    const tokens = user.fcmTokens || [];
    if (!tokens.includes(token)) {
      // Agregar el nuevo token
      tokens.push(token);
      
      // Guardar en la base de datos con los nuevos tokens
      await this.userPort.update(userId, {
        fcmTokens: tokens
      });
      
      console.log(`Token FCM guardado para el usuario ${userId}`);
      return user;
    }
    
    console.log(`Token FCM ya existente para el usuario ${userId}`);
    return user;
  }
}
