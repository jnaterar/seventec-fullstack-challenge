import { IsString, IsNotEmpty, IsOptional, IsUrl, IsDateString, IsEnum } from 'class-validator';
import { PostType } from '@backend/core/domain/enums/post-type.enum';

/**
 * DTO base para la representación de un post
 */
export interface PostDto {
  id                : string;
  imagen            : string;
  descripcion       : string;
  fechaCreacion     : Date;
  fechaEdicion      : Date;
  userId            : string;
  tipo              : PostType;
  fechaExpiracion   ?: Date | null;
}

/**
 * DTO para la creación de un post a través de HTTP
 */
export class CreatePostDto {
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsNotEmpty({ message: 'La imagen es requerida' })
  imagen!: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsString({ message: 'El ID de usuario es requerido' })
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userId!: string;

  @IsEnum(PostType, { message: 'El tipo de publicación debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de publicación es requerido' })
  tipo!: PostType;

  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  @IsOptional()
  fechaExpiracion?: Date | null;
}

/**
 * DTO para la actualización de un post
 */
export class UpdatePostDto {
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  imagen?: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsDateString({}, { message: 'La fecha de edición debe ser una fecha válida' })
  @IsOptional()
  fechaEdicion?: Date;

  @IsEnum(PostType, { message: 'El tipo de publicación debe ser válido' })
  @IsOptional()
  tipo?: PostType;

  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  @IsOptional()
  fechaExpiracion?: Date | null;
}

/**
 * DTO para la respuesta de la API de posts
 */
export class PostResponseDto {
  constructor(
    public id                : string,
    public imagen            : string,
    public descripcion       : string,
    public fechaCreacion     : Date,
    public fechaEdicion      : Date,
    public fechaRelativa     : string,
    public userId            : string,
    public tipo              : PostType,
    public fechaExpiracion   ?: Date | null,
  ) {}
}

/**
 * DTO para la lista de posts
 */
export class PostListResponseDto {
  constructor(
    public posts             : PostResponseDto[],
    public total             : number,
    public pagina            : number,
    public porPagina         : number,
  ) {}
}
