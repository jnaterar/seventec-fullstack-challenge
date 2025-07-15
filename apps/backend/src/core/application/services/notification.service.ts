import { UserPort } from '@backend/core/application/ports/user.port';
import { NotificationPort } from '@backend/core/application/ports/notification.port';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { User } from '@backend/core/domain/entities/user.entity';

/**
 * Servicio de notificaciones
 */
export class NotificationService {
  constructor(
    private readonly userPort: UserPort,
    private readonly notifier: NotificationPort
  ) {}

  /**
   * Notifica a todos los usuarios con rol PARTICIPANT sobre un evento de post
   */
  async notifyParticipantsOfPost(
    postId   : string,
    title    : string,
    body     : string,
    isUpdate : boolean
  ) {
    console.log(`[Notificación] Iniciando envío para post ${postId} - ${isUpdate ? 'actualización' : 'creación'}`);
    
    const participants : User[] = await this.userPort.findByRole(UserRole.PARTICIPANT);
    console.log(`[Notificación] Encontrados ${participants.length} usuarios participantes`);
    
    if (participants.length === 0) {
      console.warn('[Notificación] No se encontraron participantes para notificar');
      return;
    }
    
    // Verificar usuarios con y sin tokens
    const usersWithTokens = participants.filter(user => (user.fcmTokens?.length ?? 0) > 0);
    const usersWithoutTokens = participants.filter(user => !user.fcmTokens || user.fcmTokens.length === 0);
    
    console.log(`[Notificación] ${usersWithTokens.length} participantes con tokens FCM`);
    console.log(`[Notificación] ${usersWithoutTokens.length} participantes sin tokens FCM`);
    
    // Log de usuarios sin tokens para depuración
    if (usersWithoutTokens.length > 0) {
      console.log('[Notificación] Emails de participantes sin tokens FCM:', 
        usersWithoutTokens.map(u => u.email).join(', '));
    }
    
    const tokens : string[] = participants.flatMap((user: User) => {
      const userTokens = user.fcmTokens ?? [];
      if (userTokens.length > 0) {
        console.log(`[Notificación] Usuario ${user.email} tiene ${userTokens.length} tokens`);
      }
      return userTokens;
    });
    
    console.log(`[Notificación] Total de tokens a notificar: ${tokens.length}`);
    
    if (tokens.length === 0) {
      console.warn('[Notificación] No hay tokens FCM para enviar notificaciones');
      return;
    }
    
    try {
      await this.notifier.sendMulticast(tokens, title, body, {
        postId,
        action: isUpdate ? 'updated' : 'created'
      });
      console.log(`[Notificación] Notificaciones enviadas exitosamente a ${tokens.length} tokens`);
    } catch (error) {
      console.error('[Notificación] Error al enviar notificaciones:', error);
    }
  }
}
