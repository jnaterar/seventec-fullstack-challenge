import { AuthPort } from '@backend/core/application/ports/auth.port';
import { UserPort } from '@backend/core/application/ports/user.port';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';

export class LoginUseCase {
  constructor(
    private readonly authPort: AuthPort,
    private readonly userPort: UserPort
  ) {}

  async execute(email: string, password: string): Promise<{ token: string }> {
    try {
      // Primero validamos las credenciales
      const token = await this.authPort.login(email, password);

      // Verificamos que el usuario exista en nuestra base de datos
      const user = await this.userPort.findByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificamos que el usuario tenga al menos el rol PARTICIPANT
      if (!user.roles.includes(UserRole.PARTICIPANT)) {
        throw new Error('El usuario no tiene permisos suficientes');
      }

      return token;
      
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  }
}
