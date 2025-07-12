import { DocumentData, Firestore, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { User } from '@backend/core/domain/entities/user.entity';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { UserDto } from '@backend/infrastructure/http/dtos/user.dto';
import { getFirestoreInstance } from '@backend/infrastructure/persistence/firebase/firebase.config';

/**
 * Implementación del repositorio de usuarios usando Firestore
 */
export class UserFirestoreRepository implements UserPort {
  private static instance         : UserFirestoreRepository;
  private readonly db             : Firestore;
  private readonly collectionName : string;

  constructor() {
    this.db             = getFirestoreInstance();
    this.collectionName = 'users';
  }

  /**
   * Obtiene la instancia de UserFirestoreRepository
   * @returns {UserFirestoreRepository} Instancia de UserFirestoreRepository
   */
  public static getInstance(): UserFirestoreRepository {
    if (!UserFirestoreRepository.instance) {
      UserFirestoreRepository.instance = new UserFirestoreRepository();
    }

    return UserFirestoreRepository.instance;
  }

  /**
   * Obtiene la colección de usuarios
   * @returns {CollectionReference} Colección de usuarios
   */
  private get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Obtiene un usuario por su ID
   */
  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as UserDto;
    return User.fromJSON({ ...data, id: doc.id });
  }

  /**
   * Busca usuarios que cumplan con los criterios
   */
  async find(criteria: Partial<UserDto> = {}): Promise<User[]> {
    let query: Query<DocumentData> = this.collection;

    // Aplicar filtros
    if (criteria.nombre) {
      query = query.where('nombre', '==', criteria.nombre);
    }
    if (criteria.roles) {
      query = query.where('roles', 'array-contains-any', Array.isArray(criteria.roles) ? criteria.roles : [criteria.roles]);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as UserDto;
      return User.fromJSON({ ...data, id: doc.id });
    });
  }

  /**
   * Crea un nuevo usuario
   */
  async create(userData: Omit<UserDto, 'id'>): Promise<User> {
    const docRef = await this.collection.add(userData);
    const doc    = await docRef.get();
    const data   = doc.data() as UserDto;

    return User.fromJSON({ ...data, id: doc.id });
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, userData: Partial<UserDto>): Promise<User | null> {
    const docRef = this.collection.doc(id);
    await docRef.update(userData);
    const updatedDoc = await docRef.get();
    
    if (!updatedDoc.exists) {
      return null;
    }
    
    const data = updatedDoc.data() as UserDto;

    return User.fromJSON({ ...data, id: updatedDoc.id });
  }

  /**
   * Elimina un usuario
   */
  async delete(id: string): Promise<boolean> {
    await this.collection.doc(id).delete();
    return true;
  }

  /**
   * Obtiene un usuario por su email
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc  = snapshot.docs[0];
    const data = doc.data() as UserDto;

    return User.fromJSON({ ...data, id: doc.id });
  }

  /**
   * Busca usuarios por rol
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const snapshot = await this.collection.where('roles', 'array-contains', role).get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as UserDto;
      return User.fromJSON({ ...data, id: doc.id });
    });
  }

  /**
   * Verifica si un email ya está en uso
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    // Primero buscamos por email
    const query    = this.collection.where('email', '==', email);
    const snapshot = await query.limit(1).get();
    
    // Si no hay resultados, el email no está en uso
    if (snapshot.empty) {
      return false;
    }
    
    // Si no hay que excluir ningún ID, el email está en uso
    if (!excludeUserId) {
      return true;
    }
    
    // Si hay que excluir un ID, verificamos si el documento encontrado es diferente al ID excluido
    const doc = snapshot.docs[0];
    
    return doc.id !== excludeUserId;
  }
}
