import admin from 'firebase-admin';
import { NotificationPort } from '@backend/core/application/ports/notification.port';

export class FcmNotificationService implements NotificationPort {
  async sendMulticast(
    tokens : string[],
    title  : string,
    body   : string,
    data   : Record<string, string> = {}
  ): Promise<void> {
    if (!tokens.length) return;
    // Divide en chunks de 500 (límite de FCM)
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500));
    }

    await Promise.all(
      chunks.map(async chunk => {
        await admin.messaging().sendEachForMulticast({
          tokens       : chunk,
          notification : { title, body },
          data
        });
      })
    );
  }
}
