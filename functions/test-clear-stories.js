// Configuración de Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://seventec-fullstack-challenge.firebaseio.com'
});

const db = admin.firestore();

// Tipos de publicaciones disponibles
const PostType = {
  NORMAL: 'NORMAL',
  STORY: 'STORY'
};

// Función para eliminar historias expiradas
async function testClearExpiredStories() {
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

// Ejecutar la prueba
console.log('Iniciando prueba de clearExpiredStories...');
testClearExpiredStories()
  .then(() => {
    console.log('Prueba completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en la prueba:', error);
    process.exit(1);
  });
