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
    const participants : User[]   = await this.userPort.findByRole(UserRole.PARTICIPANT);
    const tokens       : string[] = participants.flatMap((user: User) => user.fcmTokens ?? []);
    
    await this.notifier.sendMulticast(tokens, title, body, {
      postId,
      action: isUpdate ? 'updated' : 'created'
    });
  }
}
