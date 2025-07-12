import { Firestore } from 'firebase-admin/firestore';
import { Post } from '@backend/core/domain/entities/post.entity';
import { PostPort } from '@backend/core/application/ports/post.port';
import { getFirestoreInstance } from '@backend/infrastructure/persistence/firebase/firebase.config';

/**
 * Implementación del repositorio de posts usando Firestore
 */
export class PostFirestoreRepository implements PostPort {
  private static instance         : PostFirestoreRepository;
  private readonly db             : Firestore;
  private readonly collectionName : string;

  constructor() {
    this.db             = getFirestoreInstance();
    this.collectionName = 'posts';
  }

  /**
   * Obtiene la instancia de PostFirestoreRepository
   * @returns {PostFirestoreRepository} Instancia de PostFirestoreRepository
   */
  public static getInstance(): PostFirestoreRepository {
      if (!PostFirestoreRepository.instance) {
          PostFirestoreRepository.instance = new PostFirestoreRepository();
      }

      return PostFirestoreRepository.instance;
  }    

  /**
   * Obtiene la colección de posts
   * @returns {CollectionReference} Colección de posts
   */
  private get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Obtener todos los posts con paginación
   */
  async findAll(limit: number, offset: number): Promise<Post[]> {
    const query = this.collection
      .orderBy('fechaCreacion', 'desc')
      .limit(limit)
      .offset(offset);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data) {
        return null;
      }
      return new Post({
        id: doc.id,
        imagen: data.imagen || '',
        descripcion: data.descripcion || '',
        fechaCreacion: data.fechaCreacion || new Date(),
        fechaEdicion: data.fechaEdicion || new Date(),
        userId: data.userId || ''
      });
    }).filter((post): post is Post => post !== null);
  }

  /**
   * Obtener un post por su ID
   */
  async findById(id: string): Promise<Post | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    if (!data) {
      return null;
    }
    return new Post({
      id: doc.id,
      imagen: data.imagen || '',
      descripcion: data.descripcion || '',
      fechaCreacion: data.fechaCreacion || new Date(),
      fechaEdicion: data.fechaEdicion || new Date(),
      userId: data.userId || ''
    });
  }

  /**
   * Crear un nuevo post
   */
  async create(post: Post): Promise<Post> {
    const docRef = await this.collection.add({
      imagen: post.imagen,
      descripcion: post.descripcion,
      fechaCreacion: post.fechaCreacion,
      fechaEdicion: post.fechaEdicion,
      userId: post.userId
    });
    const doc = await docRef.get();

    return new Post({
      id: doc.id,
      imagen: doc.data()?.imagen,
      descripcion: doc.data()?.descripcion,
      fechaCreacion: doc.data()?.fechaCreacion,
      fechaEdicion: doc.data()?.fechaEdicion,
      userId: doc.data()?.userId
    });
  }

  /**
   * Actualizar un post existente
   */
  async update(post: Post): Promise<Post> {
    const docRef = this.collection.doc(post.id);
    await docRef.update({
      imagen: post.imagen,
      descripcion: post.descripcion,
      fechaEdicion: post.fechaEdicion,
      userId: post.userId
    });
    const updatedDoc = await docRef.get();
    const data = updatedDoc.data();

    if (!data) {
      throw new Error('Post no encontrado');
    }

    return new Post({
      id: post.id,
      imagen: data.imagen || '',
      descripcion: data.descripcion || '',
      fechaCreacion: data.fechaCreacion || new Date(),
      fechaEdicion: data.fechaEdicion || new Date(),
      userId: data.userId || ''
    });
  }

  /**
   * Eliminar un post
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Buscar posts por usuario
   */
  async findByUserId(userId: string): Promise<Post[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('fechaCreacion', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data) {
        return null;
      }
      return new Post({
        id: doc.id,
        imagen: data.imagen || '',
        descripcion: data.descripcion || '',
        fechaCreacion: data.fechaCreacion || new Date(),
        fechaEdicion: data.fechaEdicion || new Date(),
        userId: data.userId || ''
      });
    }).filter((post): post is Post => post !== null);
  }

  /**
   * Obtener el número total de posts
   */
  async count(): Promise<number> {
    const snapshot = await this.collection.get();
    return snapshot.size;
  }
}