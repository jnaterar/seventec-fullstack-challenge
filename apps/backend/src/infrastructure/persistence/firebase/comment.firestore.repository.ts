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
    const docRef = await this.collection.add(comment);
    return docRef.id;
  }

  /**
   * Busca comentarios por ID de post
   * @param {string} postId - ID del post
   * @returns {Promise<any[]>} Lista de comentarios
   */
  async findByPostId(postId: string): Promise<any[]> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
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
