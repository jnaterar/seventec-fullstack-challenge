"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearExpiredStories = void 0;
const firestore_1 = require("firebase-admin/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
// Tipos de publicaciones disponibles
var PostType;
(function (PostType) {
    PostType["NORMAL"] = "NORMAL";
    PostType["STORY"] = "STORY";
})(PostType || (PostType = {}));
// Función programada para eliminar historias expiradas
exports.clearExpiredStories = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 hours',
    timeZone: 'America/Lima'
}, async (_event) => {
    const db = (0, firestore_1.getFirestore)();
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
    }
    catch (error) {
        console.error('Error al eliminar historias expiradas:', error);
        throw error;
    }
});
//# sourceMappingURL=clear-expired-stories.js.map