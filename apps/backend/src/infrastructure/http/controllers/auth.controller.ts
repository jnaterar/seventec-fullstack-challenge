import { Request, Response } from 'express';
import { AuthPort } from '@backend/core/application/ports/auth.port';
import { UserPort } from '@backend/core/application/ports/user.port';
import { LoginUseCase } from '@backend/core/application/use-cases/login.use-case';
import { UserFirestoreRepository } from '@backend/infrastructure/persistence/firebase/user.firestore.repository';
import { FirebaseAuthRepository } from '@backend/infrastructure/persistence/firebase/auth.firestore.repository';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';

/**
 * Controlador de autenticación
 */
export class AuthController {
  private readonly userAdapter   : UserPort;    
  private readonly loginUseCase  : LoginUseCase;
  private readonly authAdapter   : AuthPort;

  private static instance: AuthController;
  
  private constructor() {
    // Primero creamos una instancia del adaptador de usuarios
    this.userAdapter = UserFirestoreRepository.getInstance(null as any);
    
    // Luego creamos el adaptador de autenticación con la instancia de usuarios
    this.authAdapter = FirebaseAuthRepository.getInstance(this.userAdapter);
    
    // Actualizamos la instancia del UserFirestoreRepository con el authAdapter
    UserFirestoreRepository.getInstance(this.userAdapter);
    
    // Finalmente, creamos el caso de uso con ambos adaptadores
    this.loginUseCase = new LoginUseCase(this.authAdapter, this.userAdapter);
  }

  /**
   * Obtiene la instancia única del AuthController
   */
  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * Iniciar sesión con Firebase ID Token
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        res.status(400).json({ 
          success: false,
          message: 'Se requiere un ID Token de Firebase' 
        });
        return;
      }

      // Verificar el ID Token y obtener el token personalizado
      const result = await this.loginUseCase.execute(idToken);
      
      res.status(200).json({
        success: true,
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          nombre: result.user.nombre,
          roles: result.user.roles
        }
      });
    } catch (error) {
      console.error('Error en el controlador de login:', error);
      res.status(401).json({ 
        success: false,
        message: 'No se pudo autenticar. Por favor, verifica tus credenciales.'
      });
    }
  }

  /**
   * Validar token
   */
  /**
   * Validar un token de autenticación
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un token para validar'
        });
        return;
      }

      const isValid = await this.authAdapter.validateToken(token);
      
      res.status(200).json({ 
        success: true,
        isValid 
      });

    } catch (error: any) {
      console.error('Error al validar el token:', error);
      res.status(401).json({ 
        success: false,
        message: 'Token inválido o expirado',
        error: error.message 
      });
    }
  };

  /**
   * Registrar un nuevo usuario
   */
  /**
   * Registrar un nuevo usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre } = req.body;
      
      console.log('Datos de registro recibidos:', { email, nombre, passwordLength: password?.length || 0 });
      
      // Validar campos requeridos
      if (!email || !password || !nombre) {
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!nombre) missingFields.push('nombre');
        
        const errorMessage = `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`;
        console.error('Error de validación:', errorMessage);
        
        res.status(400).json({ 
          message: errorMessage,
          success: false,
          missingFields
        });
        return;
      }

      // Verificar si el usuario ya existe
      try {
        await this.authAdapter.getUserByEmail(email);
        res.status(400).json({ 
          message: 'El correo electrónico ya está en uso',
          success: false
        });
        return;
      } catch (error) {
        // El usuario no existe, continuar con el registro
      }

      // Crear el usuario en Firebase Auth
      const userRecord = await this.authAdapter.createUser({
        email,
        password,
        displayName: nombre
      });

      // Crear el perfil del usuario en Firestore
      const userData = {
        email,
        nombre,
        roles: [UserRole.PARTICIPANT],
        // Campos opcionales con valores por defecto
        biografia: '',
        alergias: []
      };
      
      console.log('Intentando crear usuario con datos:', JSON.stringify(userData, null, 2));
      
      try {
        await this.userAdapter.create(userData);
        console.log('Usuario creado exitosamente en Firestore');
      } catch (createError: any) {
        console.error('Error al crear el usuario en Firestore:', {
          message: createError.message,
          stack: createError.stack,
          name: createError.name,
          code: (createError as any).code
        });
        throw createError; // Relanzar el error para manejarlo en el catch externo
      }

      // Obtener el ID Token del usuario recién creado
      const idToken = await this.authAdapter.createCustomToken(userRecord.uid);
      
      // Iniciar sesión automáticamente después del registro
      const loginResult = await this.loginUseCase.execute(idToken);

      res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        success: true,
        user: {
          id: userRecord.uid,
          email,
          nombre,
          roles: [UserRole.PARTICIPANT] // Usar el rol que se asignó al crear el usuario
        },
        token: loginResult.token
      });

    } catch (error: any) {
      console.error('Error en el registro:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code,
        errors: (error as any).errors || 'No hay detalles de validación adicionales'
      });
      
      // Determinar el código de estado y mensaje de error apropiados
      let statusCode = 500;
      let errorMessage = 'Error al registrar el usuario';
      
      if (error.name === 'UserAlreadyExistsError') {
        statusCode = 400;
        errorMessage = error.message;
      } else if (error.name === 'InvalidUserDataError') {
        statusCode = 400;
        errorMessage = error.message;
      } else if (error.code === 'auth/email-already-exists') {
        statusCode = 400;
        errorMessage = 'El correo electrónico ya está en uso';
      } else if (error.code === 'auth/invalid-email') {
        statusCode = 400;
        errorMessage = 'El correo electrónico no es válido';
      } else if (error.code === 'auth/weak-password') {
        statusCode = 400;
        errorMessage = 'La contraseña es demasiado débil';
      }
      
      res.status(statusCode).json({ 
        message: errorMessage,
        error: error.message,
        errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        success: false
      });
    }
  };

  /**
   * Solicitar restablecimiento de contraseña
   */
  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ 
          success: false,
          message: 'El correo electrónico es requerido' 
        });
        return;
      }

      const result = await this.authAdapter.resetPassword(email);
      
      res.status(200).json({ 
        success: true,
        message: result.message
      });
      
    } catch (error: any) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al procesar la solicitud de restablecimiento de contraseña',
        error: error.message
      });
    }
  };

  /**
   * Obtener perfil del usuario actual
   */
  /**
   * Obtener el perfil del usuario autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // El middleware de autenticación ya validó el token y adjuntó el usuario a la solicitud
      const authUser = (req as any).user;
      
      if (!authUser) {
        res.status(404).json({ 
          success: false,
          message: 'Usuario no encontrado' 
        });
        return;
      }

      // Obtener información del usuario desde el adaptador
      const user = await this.userAdapter.findById(authUser.uid);
      
      if (!user) {
        res.status(404).json({ 
          success: false,
          message: 'Usuario no encontrado' 
        });
        return;
      }

      // Mapear la respuesta según la entidad User
      const profile = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        biografia: user.biografia,
        alergias: user.alergias || [],
        roles: user.roles || [],
        fcmTokens: user.fcmTokens || []
      };

      res.status(200).json({ 
        success: true,
        profile 
      });

    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor al obtener el perfil',
        error: error.message 
      });
    }
  };
}
