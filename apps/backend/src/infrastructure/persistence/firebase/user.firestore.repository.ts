import { DocumentData, Firestore, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { User } from '@backend/core/domain/entities/user.entity';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { UserDto } from '@backend/infrastructure/http/dtos/user.dto';
import { getFirestoreInstance } from '@backend/infrastructure/persistence/firebase/firebase.config';
import { AuthPort } from '@backend/core/application/ports/auth.port';
import { FirebaseAuthRepository } from '@backend/infrastructure/persistence/firebase/auth.firestore.repository';

/**
 * Implementación del repositorio de usuarios usando Firestore
 */
export class UserFirestoreRepository implements UserPort {
  private static instance: UserFirestoreRepository;
  private readonly db: Firestore;
  private readonly collectionName: string;
  private authRepository: AuthPort | null = null;

  private constructor() {
    this.db = getFirestoreInstance();
    this.collectionName = 'users';
  }

  /**
   * Obtiene la instancia única del repositorio de usuarios
   * @param userPort Puerto de usuario (opcional, para inyección de dependencias)
   */
  public static getInstance(userPort?: UserPort | null): UserFirestoreRepository {
    if (!UserFirestoreRepository.instance) {
      UserFirestoreRepository.instance = new UserFirestoreRepository();
    }
    
    // Si se proporciona un userPort, actualizar el authRepository
    if (userPort && !UserFirestoreRepository.instance.authRepository) {
      UserFirestoreRepository.instance.authRepository = FirebaseAuthRepository.getInstance(userPort);
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
  async create(userData: Omit<UserDto, 'id'> & { password?: string }): Promise<User> {
    if (!this.authRepository) {
      throw new Error('Auth repository no ha sido inicializado. Llame a getInstance(userPort) primero.');
    }

    // Extraer la contraseña de los datos del usuario
    const { password, ...userDataWithoutPassword } = userData;
    
    if (!password) {
      throw new Error('La contraseña es requerida para crear un nuevo usuario');
    }
    
    try {
      // Crear el usuario en Firebase Auth
      const authUser = await this.authRepository.createUser({
        email: userData.email,
        password: password,
        displayName: userData.nombre
      });
      
      // Crear el documento en Firestore con el mismo ID del usuario de Auth
      const userToSave = {
        ...userDataWithoutPassword,
        // Asegurarse de que el ID del documento sea el mismo que el UID de Auth
        id: authUser.uid,
        // Asegurarse de que los roles estén definidos
        roles: userData.roles?.length ? userData.roles : [UserRole.PARTICIPANT]
      };
      
      // Guardar en Firestore
      await this.collection.doc(authUser.uid).set(userToSave);
      
      // Obtener el usuario recién creado para devolverlo
      const doc = await this.collection.doc(authUser.uid).get();
      const data = doc.data() as UserDto;
      
      return User.fromJSON({ ...data, id: doc.id });
      
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw new Error('No se pudo crear el usuario. Por favor, verifica los datos e intenta nuevamente.');
    }
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
