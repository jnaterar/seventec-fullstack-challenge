import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
try {
  admin.initializeApp();
  console.log('Administrador Firebase inicializado correctamente');

} catch (error) {
  console.log('Administrador Firebase ya inicializado');
}

// Exporta una función inicial
export const initialMessage = functions.https.onRequest((_request, response) => {
  response.json({ message: "Firebase Functions en ejecución" });
});

// Exporta la función programada para eliminar historias expiradas
export * from './clear-expired-stories';
