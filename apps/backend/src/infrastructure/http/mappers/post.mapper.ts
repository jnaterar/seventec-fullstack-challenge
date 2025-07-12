import { Post } from '@core/domain/entities/post.entity';
import { CreatePostDto, UpdatePostDto, PostResponseDto, PostListResponseDto } from '@backend/infrastructure/http/dtos/post.dto';

/**
 * Mapeador para convertir entre la entidad Post y los DTOs HTTP
 */
export class PostMapper {
  /**
   * Convierte un DTO de creación a una entidad Post
   */
  static toDomain(dto: CreatePostDto, id: string): Post {
    const now = new Date();
    return new Post({
      id,
      imagen         : dto.imagen,
      descripcion    : dto.descripcion || '',
      fechaCreacion  : now,
      fechaEdicion   : now,
      userId         : dto.userId
    });
  }

  /**
   * Convierte una entidad Post a un DTO de respuesta
   */
  static toResponse(post: Post): PostResponseDto {
    return {
      id               : post.id,
      imagen           : post.imagen,
      descripcion      : post.descripcion,
      fechaCreacion    : post.fechaCreacion,
      fechaEdicion     : post.fechaEdicion,
      fechaRelativa    : post.fechaRelativa,
      userId           : post.userId,
      tipo             : post.tipo,
      fechaExpiracion  : post.fechaExpiracion
    };
  }

  /**
   * Convierte una lista de entidades Post a un DTO de lista de respuestas
   */
  static toListResponse(
    posts      : Post[],
    total      : number,
    pagina     : number,
    porPagina  : number
  ): PostListResponseDto {
    return {
      posts : posts.map(post => this.toResponse(post)),
      total,
      pagina,
      porPagina
    };
  }

  /**
   * Actualiza una entidad Post con los datos de un DTO de actualización
   */
  static updateEntity(post: Post, dto: UpdatePostDto): Post {
    // Crear una copia del post existente
    const updatedPost = new Post({
      id             : post.id,
      imagen         : post.imagen,
      descripcion    : post.descripcion,
      fechaCreacion  : post.fechaCreacion,
      fechaEdicion   : post.fechaEdicion,
      userId         : post.userId
    });

    // Actualizar los campos proporcionados
    if (dto.imagen !== undefined) {
      updatedPost.imagen = dto.imagen;
    }
    
    if (dto.descripcion !== undefined) {
      updatedPost.descripcion = dto.descripcion;
    }

    // Actualizar la fecha de edición si hay campos para actualizar
    if (dto.imagen !== undefined || dto.descripcion !== undefined) {
      updatedPost.fechaEdicion = dto.fechaEdicion ? new Date(dto.fechaEdicion) : new Date();
    }

    return updatedPost;
  }
}
