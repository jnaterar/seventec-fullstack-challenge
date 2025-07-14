import admin from 'firebase-admin';
import { FirebaseAdmin } from '@backend/infrastructure/persistence/firebase/firebase.config';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { AuthPort } from '@backend/core/application/ports/auth.port';
import { RESET_PASSWORD_URL } from '@backend/config';

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
   * Verifica un ID Token de Firebase y devuelve un token personalizado
   */
  async verifyIdToken(idToken: string): Promise<{ 
    token: string;
    user: {
      uid: string;
      email?: string;
      displayName?: string;
      roles: string[];
    } 
  }> {
    try {
      // Verificar el ID Token con Firebase Admin
      const decodedToken = await this.auth.verifyIdToken(idToken);
      
      // Obtener información adicional del usuario desde la base de datos
      const userRecord = await this.auth.getUser(decodedToken.uid);
      
      // Verificar que el usuario esté habilitado
      if (userRecord.disabled) {
        throw new Error('La cuenta de usuario está deshabilitada');
      }

      // Obtener roles del usuario desde la base de datos
      // Por defecto, todos los usuarios tienen el rol PARTICIPANT
      const userDoc = await this.userPort.findByEmail(userRecord.email || '');
      const roles = userDoc?.roles || [UserRole.PARTICIPANT];

      // Generar token personalizado con información adicional
      const customToken = await this.auth.createCustomToken(userRecord.uid, {
        email: userRecord.email,
        roles: roles
      });

      return { 
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          roles: roles
        }
      };

    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
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
   * Obtiene el perfil del usuario desde un token
   */
  async getProfileFromToken(token: string) {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      return {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        roles: decodedToken.roles || []
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Envía un correo para restablecer la contraseña
   */
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      // Verificar si el usuario existe
      try {
        await this.auth.getUserByEmail(email);
      } catch (error) {
        // No revelar si el correo existe o no por razones de seguridad
        console.log(`Solicitud de restablecimiento de contraseña para ${email} (usuario no encontrado)`);
        return { message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' };
      }

      // Generar y enviar el correo de restablecimiento
      const resetLink = await this.auth.generatePasswordResetLink(email, {
        url: RESET_PASSWORD_URL,
        handleCodeInApp: true
      });

      // Aquí deberías implementar el envío del correo electrónico con el enlace
      // Por ejemplo, usando un servicio de correo como Nodemailer
      console.log('Enlace de restablecimiento de contraseña:', resetLink);
      
      return { 
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' 
      };
      
    } catch (error) {
      console.error('Error al procesar la solicitud de restablecimiento de contraseña:', error);
      throw new Error('Error al procesar la solicitud de restablecimiento de contraseña');
    }
  }

  /**
   * Obtiene un usuario por su correo electrónico
   * @param email Correo electrónico del usuario a buscar
   */
  async getUserByEmail(email: string) {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || ''
      };
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw new Error('No se pudo encontrar el usuario con el correo proporcionado');
    }
  }

  /**
   * Crea un nuevo usuario en Firebase Authentication
   */
  async createUser(userData: { email: string; password: string; displayName: string }): Promise<{ uid: string }> {
    try {
      const userRecord = await this.auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: false
      });

      return { uid: userRecord.uid };
    } catch (error: any) {
      console.error('Error al crear usuario en Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Crea un token personalizado para un usuario
   * @param uid ID del usuario
   * @returns Token personalizado
   */
  async createCustomToken(uid: string): Promise<string> {
    try {
      // Generar un token personalizado para el usuario
      const customToken = await this.auth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      console.error('Error al crear token personalizado:', error);
      throw new Error('No se pudo generar el token de autenticación');
    }
  }
}
