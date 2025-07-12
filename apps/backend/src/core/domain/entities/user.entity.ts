import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { UserDto } from '@backend/infrastructure/http/dtos/user.dto';

/**
 * Entidad de Usuario que representa un usuario en el dominio de la aplicación.
 * Sigue los principios de la arquitectura hexagonal, siendo una entidad de dominio pura.
 */
export class User {
  private readonly _id  : string;
  private _nombre       : string;
  private _email        : string;
  private _biografia    : string;
  private _alergias     : string[];
  private _roles        : UserRole[];
  private _fcmTokens    : string[];

  /**
   * Crea una nueva instancia de Usuario
   * @param id Identificador único del usuario
   * @param nombre Nombre del usuario
   * @param biografia Biografía del usuario (opcional)
   * @param alergias Lista de alergias del usuario (opcional)
   */
  constructor(props: UserDto) {
    if (!props.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw new Error('El correo electrónico no es válido');
    }

    this._id         = props.id;
    this._nombre     = props.nombre;
    this._email      = props.email;
    this._biografia  = props.biografia || '';
    this._alergias   = [...(props.alergias || [])]; // Crear copia para evitar mutaciones externas
    this._roles      = [...(props.roles || [UserRole.PARTICIPANT])]; // Crear copia del array de roles
    this._fcmTokens  = [...(props.fcmTokens || [])]; // Crear copia del array de tokens
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get email(): string {
    return this._email;
  }

  get biografia(): string {
    return this._biografia;
  }

  get fcmTokens(): string[] {
    return [...this._fcmTokens]; // Devolver una copia para evitar mutaciones externas
  }

  set fcmTokens(tokens: string[]) {
    if (!Array.isArray(tokens)) {
      throw new Error('Los tokens FCM deben ser un array');
    }
    this._fcmTokens = [...tokens]; // Crear copia para evitar mutaciones externas
  }

  get alergias(): string[] {
    return [...this._alergias]; // Devolver copia para mantener la inmutabilidad
  }

  /**
   * Obtiene los roles del usuario
   */
  get roles(): UserRole[] {
    return [...this._roles]; // Devolver copia para mantener la inmutabilidad
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   */
  hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }

  /**
   * Verifica si el usuario es un organizador
   */
  isOrganizer(): boolean {
    return this.hasRole(UserRole.ORGANIZER);
  }

  /**
   * Verifica si el usuario es un participante
   */
  isParticipant(): boolean {
    return this.hasRole(UserRole.PARTICIPANT);
  }

  /**
   * Agrega un rol al usuario si no lo tiene
   * @param role Rol a agregar
   */
  addRole(role: UserRole): void {
    if (!this._roles.includes(role)) {
      this._roles.push(role);
    }
  }

  /**
   * Elimina un rol del usuario si lo tiene
   * @param role Rol a eliminar
   */
  removeRole(role: UserRole): void {
    this._roles = this._roles.filter(r => r !== role);
  }

  /**
   * Establece los roles del usuario
   * @param roles Lista de roles a establecer
   */
  setRoles(roles: UserRole[]): void {
    this._roles = [...new Set(roles)]; // Eliminar duplicados
  }

  // Setters con validación básica
  set nombre(nombre: string) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío');
    }
    this._nombre = nombre.trim();
  }

  set biografia(biografia: string) {
    this._biografia = biografia || '';
  }

  /**
   * Añade una nueva alergia a la lista de alergias del usuario
   * @param alergia Nueva alergia a añadir
   */
  agregarAlergia(alergia: string): void {
    if (alergia && !this._alergias.includes(alergia)) {
      this._alergias.push(alergia);
    }
  }

  /**
   * Elimina una alergia de la lista de alergias del usuario
   * @param alergia Alergia a eliminar
   */
  eliminarAlergia(alergia: string): void {
    this._alergias = this._alergias.filter(a => a !== alergia);
  }

  /**
   * Verifica si el usuario tiene una alergia específica
   * @param alergia Alergia a verificar
   * @returns true si el usuario tiene la alergia, false en caso contrario
   */
  tieneAlergia(alergia: string): boolean {
    return this._alergias.includes(alergia);
  }

  /**
   * Crea una copia inmutable del usuario
   * @returns Una nueva instancia de User con los mismos valores
   */
  clone(): User {
    return new User({
      id         : this._id,
      nombre     : this._nombre,
      email      : this._email,
      biografia  : this._biografia,
      alergias   : [...this._alergias],
      roles      : [...this._roles]
    });
  }

  /**
   * Convierte la entidad a un objeto plano
   * @returns Representación del usuario como objeto plano
   */
  toJSON(): UserDto {
    return {
      id         : this._id,
      nombre     : this._nombre,
      email      : this._email,
      biografia  : this._biografia,
      roles      : [...this._roles],
      alergias   : [...this._alergias],
    };
  }

  /**
   * Crea una instancia de User a partir de un objeto plano
   * @param data Datos para crear el usuario
   * @returns Nueva instancia de User
   */
  static fromJSON(data: Partial<UserDto>): User {
    if (!data.email) {
      throw new Error('El correo electrónico es requerido');
    }

    // Validar y convertir los roles a UserRole
    const roles = Array.isArray(data.roles) 
      ? data.roles
          .filter((role: any) => Object.values(UserRole).includes(role as UserRole))
          .map((role: any) => role as UserRole)
      : [UserRole.PARTICIPANT]; // Valor por defecto si no hay roles

    return new User({
      id         : data.id        || '',
      nombre     : data.nombre    || '',
      email      : data.email,
      biografia  : data.biografia || '',
      alergias   : Array.isArray(data.alergias) ? data.alergias : [],
      roles      : roles
    });
  }
}
