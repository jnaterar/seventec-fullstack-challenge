import { getFirestore } from 'firebase-admin/firestore';
import { onSchedule, ScheduledEvent } from 'firebase-functions/v2/scheduler';

// Tipos de publicaciones disponibles
enum PostType {
  NORMAL = 'NORMAL',
  STORY  = 'STORY',
}

// Función programada para eliminar historias expiradas
export const clearExpiredStories = onSchedule(
  {
    schedule : 'every 1 hours',
    timeZone : 'America/Lima'
  },
  async (_event: ScheduledEvent) => {
    const db    = getFirestore();
    const today = new Date();
    
    try {
      console.log('Buscando historias expiradas...');
      
      const expiredStories = await db
        .collection('posts')
        .where('tipo', '==', PostType.STORY)
        .where('fechaExpiracion', '<=', today)
        .get();

      const batch = db.batch();
      const deletedCount = expiredStories.size;

      if (deletedCount === 0) {
        console.log('No se encontraron historias expiradas');
        return;
      }

      console.log(`Eliminando ${deletedCount} historias expiradas...`);
      
      expiredStories.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Se eliminaron ${deletedCount} historias expiradas correctamente`);

    } catch (error) {
      console.error('Error al eliminar historias expiradas:', error);
      throw error;
    }
  }
);