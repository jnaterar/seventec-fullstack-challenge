import { AuthPort } from '@backend/core/application/ports/auth.port';
import { UserPort } from '@backend/core/application/ports/user.port';

export class LoginUseCase {
  constructor(
    private readonly authPort: AuthPort,
    private readonly userPort: UserPort
  ) {}

  /**
   * Verifica un ID Token de Firebase y devuelve la información del usuario
   * @param idToken ID Token de Firebase
   * @returns Token personalizado y datos del usuario
   */
  async execute(idToken: string): Promise<{ 
    token: string;
    user: {
      id: string;
      email: string;
      nombre: string;
      roles: string[];
    } 
  }> {
    try {
      // Verificar el ID Token y obtener la información del usuario
      const { token, user } = await this.authPort.verifyIdToken(idToken);

      if (!user.email) {
        throw new Error('El usuario no tiene un correo electrónico asociado');
      }

      // Verificar que el usuario exista en nuestra base de datos
      const dbUser = await this.userPort.findByEmail(user.email);
      if (!dbUser) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      // Usar los roles de la base de datos si existen, de lo contrario, los del token
      const roles = dbUser.roles?.length ? dbUser.roles : user.roles;

      return { 
        token,
        user: {
          id: user.uid,
          email: user.email,
          nombre: user.displayName || '',
          roles: roles
        }
      };
      
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      throw new Error('Error al verificar la autenticación');
    }
  }
}
