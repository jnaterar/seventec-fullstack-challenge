import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PostDto } from '@backend/infrastructure/http/dtos/post.dto';
import { PostType } from '@backend/core/domain/enums/post-type.enum';
import { createDateWithLimaTimezone, convertToLimaTimezone } from '@backend/shared/utils/date.utils';

/**
 * Entidad que representa un post en el dominio de la aplicación
 */
export class Post {
  private _id              : string;
  private _imagen          : string;
  private _descripcion     : string;
  private _fechaCreacion   : Date;
  private _fechaEdicion    : Date;
  private _userId          : string;
  private _tipo            : PostType;
  private _fechaExpiracion : Date | null;

  constructor(props: PostDto | Partial<PostDto>) {
    this._id                 = props.id              || '';
    this._imagen             = props.imagen          || '';
    this._descripcion        = props.descripcion     || '';
    
    // Usar zona horaria de Lima para las fechas
    if (props.fechaCreacion) {
      // Si ya existe una fecha, convertirla a zona horaria de Lima
      this._fechaCreacion = convertToLimaTimezone(new Date(props.fechaCreacion));
    } else {
      // Si es nueva, crear con zona horaria de Lima
      this._fechaCreacion = createDateWithLimaTimezone();
    }
    
    if (props.fechaEdicion) {
      // Si ya existe una fecha de edición, convertirla a zona horaria de Lima
      this._fechaEdicion = convertToLimaTimezone(new Date(props.fechaEdicion));
    } else {
      // Si es nueva, usar la misma que la de creación
      this._fechaEdicion = this._fechaCreacion;
    }
    
    this._userId             = props.userId          || '';
    this._tipo               = props.tipo            || PostType.NORMAL;
    this._fechaExpiracion    = props.fechaExpiracion || null;

    // Si es una historia y no tiene fecha de expiración, establecer 24 horas por defecto
    if (this._tipo === PostType.STORY && !this._fechaExpiracion) {
      const expiresAt = createDateWithLimaTimezone();
      expiresAt.setHours(expiresAt.getHours() + 24);
      this._fechaExpiracion = expiresAt;
    }    
  }

  static fromJSON(data: PostDto | Partial<PostDto>): Post {
    return new Post(data);
  }

  get id(): string {
    return this._id;
  }

  get imagen(): string {
    return this._imagen;
  }

  set imagen(value: string) {
    this._imagen = value;
    this._fechaEdicion = createDateWithLimaTimezone();
  }

  get descripcion(): string {
    return this._descripcion;
  }

  set descripcion(value: string) {
    this._descripcion = value;
    this._fechaEdicion = createDateWithLimaTimezone();
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaEdicion(): Date {
    return this._fechaEdicion;
  }

  set fechaEdicion(value: Date) {
    this._fechaEdicion = value;
  }  

  get userId(): string {
    return this._userId;
  }

  get tipo(): PostType {
    return this._tipo;
  }

  set tipo(value: PostType) {
    this._tipo = value;
    this._fechaEdicion = createDateWithLimaTimezone();
  }

  get fechaExpiracion(): Date | null {
    return this._fechaExpiracion;
  }

  set fechaExpiracion(value: Date | null) {
    // Si el valor es una fecha, convertirla a zona horaria de Lima
    if (value) {
      this._fechaExpiracion = convertToLimaTimezone(new Date(value));
    } else {
      this._fechaExpiracion = null;
    }
    this._fechaEdicion = createDateWithLimaTimezone();
  } 

  get fechaRelativa(): string {
    return formatDistanceToNow(this._fechaEdicion, {
      addSuffix : true,
      locale    : es
    });
  }

  toJSON(): PostDto {
    return {
      id                : this._id,
      imagen            : this._imagen,
      descripcion       : this._descripcion,
      fechaCreacion     : this._fechaCreacion,
      fechaEdicion      : this._fechaEdicion,
      userId            : this._userId,
      tipo              : this._tipo,
      fechaExpiracion   : this._fechaExpiracion
    };
  }

}
