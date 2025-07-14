import { Request } from 'express';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { UserFirestoreRepository } from '@backend/infrastructure/persistence/firebase/user.firestore.repository';
import { CreateUserDto, UserResponseDto, UpdateUserDto, UserHttpMapper } from '@backend/infrastructure/http/mappers/user.mapper';
import { CreateUserUseCase, UserAlreadyExistsError, InvalidUserDataError } from '@backend/core/application/use-cases/create-user.use-case';
import { UpdateUserProfileUseCase } from '@backend/core/application/use-cases/update-user-profile.use-case';
import { UpdateProfileDto } from '@backend/infrastructure/http/dtos/update-profile.dto';

/**
 * Controlador para manejar las solicitudes HTTP relacionadas con usuarios
 */
export class UserController {
  // Adaptadores
  private readonly userAdapter : UserPort;
  // Casos de uso
  private readonly createUserUseCase : CreateUserUseCase;
  private readonly updateUserProfileUseCase : UpdateUserProfileUseCase;

  private static instance: UserController;
  
  private constructor() {
    // Inicializar el adaptador de usuarios
    this.userAdapter = UserFirestoreRepository.getInstance(null as any);
    
    // Actualizar la instancia del UserFirestoreRepository con el authAdapter
    UserFirestoreRepository.getInstance(this.userAdapter);
    
    // Inicializar casos de uso
    this.createUserUseCase = new CreateUserUseCase(this.userAdapter);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(this.userAdapter);
  }

  /**
   * Obtiene la instancia única del UserController
   */
  public static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  /**
   * Crea un nuevo usuario
   */
  public createUser = async (req: Request): Promise<{ status: number; data: { message: string; user?: UserResponseDto; }, error?: string }> => {
    try {
      const userData: CreateUserDto = req.body;
      
      // Validar que el cuerpo de la petición no esté vacío
      if (!userData || Object.keys(userData).length === 0) {
        return { status: 400, data: { message: 'El cuerpo de la petición no puede estar vacío' } };
      }

      // Establecer el rol por defecto como PARTICIPANT si no se proporciona
      if (!userData.roles || userData.roles.length === 0) {
        userData.roles = [UserRole.PARTICIPANT];
      } else {
        // Si se proporcionan roles, validar que sean válidos
        const validRoles = Object.values(UserRole);
        const invalidRoles = userData.roles.filter(role => !validRoles.includes(role as UserRole));
        
        if (invalidRoles.length > 0) {
          return { 
            status: 400, 
            data: { 
              message: `Roles no válidos: ${invalidRoles.join(', ')}. Roles válidos: ${validRoles.join(', ')}` 
            } 
          };
        }
      }

      // Ejecutar el caso de uso
      const result = await this.createUserUseCase.execute(userData);
      
      // Mapear la respuesta (excluyendo información sensible como la contraseña)
      const userResponse = UserHttpMapper.toResponse(result.user);
      
      return { 
        status: 201, 
        data: { 
          message : 'Usuario registrado exitosamente',
          user    : userResponse
        } 
      };

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      
      // Manejar errores específicos del dominio
      if (error instanceof UserAlreadyExistsError) {
        return { 
          status: 400, // Cambiado a 400 para mejor manejo en el frontend
          data: { 
            message: 'El correo electrónico ya está registrado' 
          } 
        };
      }
      
      if (error instanceof InvalidUserDataError) {
        return { 
          status: 400, 
          data: { 
            message: error.message.replace('Datos de usuario inválidos: ', '') 
          } 
        };
      }
      
      // Para otros errores, devolver un error genérico
      return { 
        status: 500, 
        data: { 
          message: 'Error al procesar el registro. Por favor, intente nuevamente.' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  public getUsers = async (req: Request): Promise<{ status: number; data: { users: UserResponseDto[]; message?: string }, error?: string }> => {
    try {
      // Obtener parámetros de consulta
      const { nombre, role } = req.query;
      
      // Construir criterios de búsqueda
      const criteria: any = {};
      
      if (nombre && typeof nombre === 'string') {
        criteria.nombre = nombre;
      }
      
      if (role) {
        // Asegurarse de que el rol sea uno de los valores válidos
        const validRoles = Object.values(UserRole);
        const roles = Array.isArray(role) 
          ? role.filter(r => validRoles.includes(r as UserRole))
          : validRoles.includes(role as UserRole) 
            ? [role as UserRole] 
            : [];
        
        if (roles.length > 0) {
          criteria.roles = roles;
        }
      }
      
      // Buscar usuarios que coincidan con los criterios
      const users = await this.userAdapter.find(criteria);
      
      // Mapear usuarios a DTOs de respuesta
      const usersResponse = users.map(user => UserHttpMapper.toResponse(user));
      
      return { 
        status: 200, 
        data: { 
          users: usersResponse 
        } 
      };
      
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      return { 
        status: 500, 
        data: { 
          users: [],
          message: 'Error interno del servidor al obtener los usuarios' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un usuario por su ID
   */
  public getUserById = async (req: Request): Promise<{ status: number; data: { user?: UserResponseDto; message?: string }, error?: string }> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return { status: 400, data: { message: 'Se requiere el ID del usuario' } };
      }
      
      const user = await this.userAdapter.findById(id);
      
      if (!user) {
        return { status: 404, data: { message: 'Usuario no encontrado' } };
      }
      
      return { 
        status: 200, 
        data: { 
          user: UserHttpMapper.toResponse(user) 
        } 
      };
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      return { 
        status: 500, 
        data: { 
          message: 'Error interno del servidor al obtener el usuario' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Actualiza un usuario existente
   */
  public updateUser = async (req: Request): Promise<{ status: number; data: { user?: UserResponseDto; message?: string }, error?: string }> => {
    try {
      const { id } = req.params;
      const updateData = req.body as Partial<UpdateUserDto>;
      
      if (!id) {
        return { status: 400, data: { message: 'Se requiere el ID del usuario' } };
      }

      // Verificar si el usuario existe
      const existingUser = await this.userAdapter.findById(id);
      if (!existingUser) {
        return { status: 404, data: { message: 'Usuario no encontrado' } };
      }

      // Verificar si el correo ya está en uso por otro usuario
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailInUse = await this.userAdapter.isEmailTaken(updateData.email, id);
        if (emailInUse) {
          return { status: 409, data: { message: 'El correo electrónico ya está en uso' } };
        }
      }

      // Actualizar el usuario
      const updatedUser = await this.userAdapter.update(id, updateData);
      
      if (!updatedUser) {
        return { status: 404, data: { message: 'Usuario no encontrado' } };
      }

      return { 
        status: 200, 
        data: { 
          user: UserHttpMapper.toResponse(updatedUser),
          message: 'Usuario actualizado exitosamente'
        } 
      };

    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      return { 
        status: 500, 
        data: { 
          message: 'Error interno del servidor al actualizar el usuario' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Obtiene el perfil del usuario autenticado
   */
  public getProfile = async (req: Request): Promise<{ status: number; data: { user?: UserResponseDto; message?: string }, error?: string }> => {
    try {
      // El middleware de autenticación ya validó el token y adjuntó el usuario a la solicitud
      const authUser = (req as any).user;
      
      if (!authUser) {
        return { status: 401, data: { message: 'No autorizado' } };
      }

      // Obtener información del usuario desde el adaptador
      const user = await this.userAdapter.findById(authUser.uid);
      
      if (!user) {
        return { status: 404, data: { message: 'Usuario no encontrado' } };
      }

      // Mapear la respuesta según la entidad User
      const profile = UserHttpMapper.toResponse(user);

      return { 
        status: 200, 
        data: { 
          user: profile,
          message: 'Perfil obtenido exitosamente'
        } 
      };

    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      return { 
        status: 500, 
        data: { 
          message: 'Error interno del servidor al obtener el perfil' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  /**
   * Elimina un usuario
   */
  public deleteUser = async (req: Request): Promise<{ status: number; data: { success: boolean; message?: string }, error?: string }> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return { status: 400, data: { success: false, message: 'Se requiere el ID del usuario' } };
      }

      // Verificar si el usuario existe
      const existingUser = await this.userAdapter.findById(id);
      if (!existingUser) {
        return { status: 404, data: { success: false, message: 'Usuario no encontrado' } };
      }

      // Eliminar el usuario
      const success = await this.userAdapter.delete(id);
      
      if (!success) {
        return { status: 500, data: { success: false, message: 'Error al eliminar el usuario' } };
      }

      return { 
        status: 200, 
        data: { 
          success: true,
          message: 'Usuario eliminado exitosamente'
        } 
      };
      
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      return { 
        status: 500, 
        data: { 
          success: false,
          message: 'Error interno del servidor al eliminar el usuario' 
        }, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  public updateUserProfile = async (req: Request): Promise<{ status: number; data: { user?: UserResponseDto; message?: string }, error?: string }> => {
    try {
      // El middleware de autenticación ya validó el token y adjuntó el usuario a la solicitud
      const authUser = (req as any).user;
      
      console.log('[DEBUG] authUser:', authUser);
      
      if (!authUser) {
        return { status: 401, data: { message: 'No autorizado' } };
      }
      
      const userId = authUser.uid;
      console.log('[DEBUG] userId:', userId);
      console.log('[DEBUG] requestBody:', req.body);
      
      const updateData = req.body as UpdateProfileDto;
      console.log('[DEBUG] updateData:', updateData);
      
      // Ejecutar el caso de uso de actualización
      try {
        const result = await this.updateUserProfileUseCase.execute(userId, updateData);
        
        // Retornar respuesta exitosa
        return { 
          status: 200, 
          data: { 
            user: UserHttpMapper.toResponse(result.user),
            message: 'Perfil actualizado exitosamente'
          } 
        };
      } catch (useCase_error) {
        console.error('[DEBUG] Error en el caso de uso:', useCase_error);
        throw useCase_error;
      }
    } catch (error: any) {
      // Si es un error de validación, retornar 400
      if (error instanceof InvalidUserDataError) {
        console.error('[DEBUG] Error de validación:', error.message);
        return { status: 400, data: { message: error.message }, error: error.message };
      }
      
      // Cualquier otro error se considera un error del servidor
      console.error('[DEBUG] Error al actualizar el perfil:', error);
      console.error('[DEBUG] Stack trace:', error.stack);
      return { 
        status: 500, 
        data: { message: 'Error interno del servidor' },
        error: error.message || 'Error desconocido' 
      };
    }
  };
}