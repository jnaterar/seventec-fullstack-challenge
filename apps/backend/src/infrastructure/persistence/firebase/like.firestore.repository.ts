import { Firestore } from 'firebase-admin/firestore';
import { LikePort } from '@backend/core/application/ports/post.port';
import { getFirestoreInstance } from '@backend/infrastructure/persistence/firebase/firebase.config';
import { Like } from '@backend/core/domain/entities/like.entity';

/**
 * Implementación del repositorio de likes usando Firestore
 */
export class LikeFirestoreRepository implements LikePort {
  private static instance         : LikeFirestoreRepository;
  private readonly db             : Firestore;
  private readonly collectionName : string;

  constructor() {
    this.db             = getFirestoreInstance();
    this.collectionName = 'likes';
  }

  /**
   * Obtiene la instancia de LikeFirestoreRepository
   * @returns {LikeFirestoreRepository} Instancia de LikeFirestoreRepository
   */
  public static getInstance(): LikeFirestoreRepository {
    if (!LikeFirestoreRepository.instance) {
      LikeFirestoreRepository.instance = new LikeFirestoreRepository();
    }

    return LikeFirestoreRepository.instance;
  }

  /**
   * Obtiene la colección de likes
   * @returns {CollectionReference} Colección de likes
   */
  private get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Crea un nuevo like
   * @param {Like} like - Objeto de like
   * @returns {Promise<Like>} Objeto de like creado
   */
  async create(like: Like): Promise<Like> {
    const docRef = await this.collection.add({
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt,
    });
    return new Like({
      id: docRef.id,
      postId: like.postId,
      userId: like.userId,
      createdAt: like.createdAt
    });
  }

  /**
   * Verifica si un like existe
   * @param {string} postId - ID del post
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} True si el like existe, false en caso contrario
   */
  async exists(postId: string, userId: string): Promise<boolean> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  /**
   * Elimina un like por ID
   * @param {string} id - ID del like
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Busca likes por ID de post
   * @param {string} postId - ID del post
   * @returns {Promise<Like[]>} Lista de likes
   */
  async findByPostId(postId: string): Promise<Like[]> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .get();

    return snapshot.docs.map(doc => new Like({
      id: doc.id,
      postId: doc.data().postId,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt
    }));
  }

  /**
   * Obtiene el número total de likes por ID de post
   * @param {string} postId - ID del post
   * @returns {Promise<number>} Número total de likes
   */
  async countByPostId(postId: string): Promise<number> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .get();

    return snapshot.size;
  }

  /**
   * Elimina un like por ID de post y ID de usuario
   * @param {string} postId - ID del post
   * @param {string} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async deleteByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.delete();
    }
  }
}
