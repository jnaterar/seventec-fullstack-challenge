import { Request } from 'express';
import { AuthPort } from '@backend/core/application/ports/auth.port';
import { UserPort } from '@backend/core/application/ports/user.port';
import { LoginUseCase } from '@backend/core/application/use-cases/login.use-case';
import { UserFirestoreRepository as UserFirestoreAdapter } from '@backend/infrastructure/persistence/firebase/user.firestore.repository';
import { FirebaseAuthRepository as FirebaseAuthAdapter } from '@backend/infrastructure/persistence/firebase/auth.firestore.repository';

/**
 * Controlador de autenticación
 */
export class AuthController {
  private readonly userAdapter   : UserPort;    
  private readonly loginUseCase  : LoginUseCase;
  private readonly authAdapter   : AuthPort;

  constructor() {
    this.userAdapter   = UserFirestoreAdapter.getInstance();
    this.authAdapter   = FirebaseAuthAdapter.getInstance(this.userAdapter);
    this.loginUseCase  = new LoginUseCase(this.authAdapter, this.userAdapter);
  }

  /**
   * Iniciar sesión
   */
  login = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { email, password } = req.body;
      const token               = await this.loginUseCase.execute(email, password);

      return { status: 200, data: token };

    } catch (error: any) {
      return { status: 401, data: { message: error.message } };
    }
  };

  /**
   * Validar token
   */
  validateToken = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { token } = req.body;
      const isValid   = await this.authAdapter.validateToken(token);

      return { status: 200, data: { isValid } };

    } catch (error: any) {
      return { status: 401, data: { message: error.message } };
    }
  };

  /**
   * Obtener perfil de usuario
   */
  getProfile = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { token } = req.body;
      const profile   = await this.authAdapter.getProfileFromToken(token);

      return { status: 200, data: profile };

    } catch (error: any) {
      return { status: 401, data: { message: error.message } };
    }
  };
}
