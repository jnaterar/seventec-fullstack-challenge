import { Firestore } from 'firebase-admin/firestore';
import { CommentPort } from '@backend/core/application/ports/post.port';
import { getFirestoreInstance } from '@backend/infrastructure/persistence/firebase/firebase.config';

/**
 * Implementación del repositorio de comentarios usando Firestore
 */
export class CommentFirestoreRepository implements CommentPort {
    private static instance       : CommentFirestoreRepository;
  private readonly db             : Firestore;
  private readonly collectionName : string;

  constructor() {
    this.db             = getFirestoreInstance();
    this.collectionName = 'comments';
  }

  /**
   * Obtiene la instancia de CommentFirestoreRepository
   * @returns {CommentFirestoreRepository} Instancia de CommentFirestoreRepository
   */
  public static getInstance(): CommentFirestoreRepository {
      if (!CommentFirestoreRepository.instance) {
          CommentFirestoreRepository.instance = new CommentFirestoreRepository();
      }

      return CommentFirestoreRepository.instance;
  }  

  /**
   * Obtiene la colección de comentarios
   * @returns {CollectionReference} Colección de comentarios
   */
  private get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Crea un nuevo comentario
   * @param {Comment} comment - Objeto de comentario
   * @returns {Promise<string>} ID del comentario creado
   */
  async create(comment: {
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<any> {
    // Convertir la instancia de Comment a un objeto plano para Firestore
    const plainComment = {
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
    
    const docRef = await this.collection.add(plainComment);
    return docRef.id;
  }

  /**
   * Busca comentarios por ID de post
   * @param {string} postId - ID del post
   * @returns {Promise<any[]>} Lista de comentarios
   */
  async findByPostId(postId: string): Promise<any[]> {
    try {
      // Definimos interfaces para tipar correctamente los datos
      interface CommentData {
        id: string;
        postId: string;
        userId: string;
        content: string;
        createdAt: string | Date;
        updatedAt: string | Date;
        [key: string]: any; // Para otros campos que pudiera tener
      }

      // Opción 1: Intenta usar el índice compuesto si existe
      try {
        const snapshot = await this.collection
          .where('postId', '==', postId)
          .orderBy('createdAt', 'desc')
          .get();

        // Tipamos y procesamos los datos explícitamente para garantizar que sean correctos
        const comments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            postId: data.postId || '',
            userId: data.userId || '',
            content: data.content || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
            ...data // Incluimos otros campos que pueda tener
          } as CommentData;
        });
        return comments;
      } catch (error: any) { // Tipamos el error como any para poder acceder a message
        // Si hay un error de índice, usa la alternativa sin ordenamiento
        console.log(`Índice no encontrado para comments.postId + createdAt, usando alternativa: ${error.message || 'Error desconocido'}`);
        
        // Opción 2: Primero obtenemos los documentos por postId sin ordenar
        const snapshot = await this.collection
          .where('postId', '==', postId)
          .get();

        // Luego ordenamos manualmente en memoria - asegurándonos de que cada documento sea tipado correctamente
        const comments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            postId: data.postId || '',
            userId: data.userId || '',
            content: data.content || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
            ...data // Incluimos otros campos que pueda tener
          } as CommentData;
        });

        // Ordenamos por createdAt en forma descendente
        // Ordenar con manejo robusto de fechas
        return comments.sort((a, b) => {
          // Manejamos posibles valores inválidos
          let timeA: number;
          let timeB: number;
          
          try {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || Date.now());
            timeA = dateA.getTime();
          } catch (e) {
            console.warn(`Error al procesar fecha createdAt en comentario ${a.id}:`, e);
            timeA = 0; // Fallback para comparación
          }
          
          try {
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || Date.now());
            timeB = dateB.getTime();
          } catch (e) {
            console.warn(`Error al procesar fecha createdAt en comentario ${b.id}:`, e);
            timeB = 0; // Fallback para comparación
          }
          
          return timeB - timeA; // Orden descendente (más reciente primero)
        });
      }
    } catch (error: any) {
      console.error('Error al obtener comentarios:', error?.message || error);
      return []; // Devolvemos un array vacío en caso de error para evitar que la aplicación falle
    }
  }

  /**
   * Elimina un comentario por ID
   * @param {string} id - ID del comentario
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
