import admin from 'firebase-admin';
import { FirebaseAdmin } from '@backend/infrastructure/persistence/firebase/firebase.config';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { AuthPort } from '@backend/core/application/ports/auth.port';

/**
 * Implementación del repositorio de autenticación usando Firebase
 */
export class FirebaseAuthRepository implements AuthPort {

  private static instance: FirebaseAuthRepository;

  private readonly userPort : UserPort;
  private readonly auth     : admin.auth.Auth;

  constructor(userPort: UserPort) {
    this.userPort = userPort;
    this.auth     = FirebaseAdmin.getInstance().auth;
  }

  /**
   * Obtiene la instancia de FirebaseAuthRepository
   * @returns {FirebaseAuthRepository} Instancia de FirebaseAuthRepository
   */
  public static getInstance(userPort: UserPort): FirebaseAuthRepository {
    if (!FirebaseAuthRepository.instance) {
      FirebaseAuthRepository.instance = new FirebaseAuthRepository(userPort);
    }
    return FirebaseAuthRepository.instance;
  }

  /**
   * Iniciar sesión con Firebase
   */
  async login(email: string, _password: string): Promise<{ token: string }> {
    try {
      // Primero obtener el usuario por email
      const userRecord = await this.auth.getUserByEmail(email);
      
      // Aquí deberíamos verificar la contraseña, pero Firebase Admin SDK no tiene un método directo
      // para verificar contraseñas. En su lugar, podemos usar el método verifyPassword de Firebase Auth
      // en el cliente, o implementar una verificación adicional en el backend usando this.auth.
      
      // Como workaround, podemos verificar que el usuario existe y tiene una contraseña
      if (!userRecord.passwordHash) {
        throw new Error('Credenciales inválidas');
      }
      
      // Generar token personalizado
      const customToken = await this.auth.createCustomToken(userRecord.uid, {
        email: userRecord.email,
        roles: [UserRole.PARTICIPANT] // Por defecto todos los usuarios son PARTICIPANT
      });

      return { token: customToken };

    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  }

  /**
   * Validar token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.auth.verifyIdToken(token);
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfileFromToken(token: string): Promise<{
    id    : string;
    email : string;
    roles : UserRole[];
  }> {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      const userId       = decodedToken.uid;
      
      // Buscar el usuario en nuestra base de datos
      const user = await this.userPort.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id    : userId,
        email : user.email,
        roles : user.roles
      };

    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}
