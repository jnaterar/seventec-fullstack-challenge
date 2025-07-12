import { Post } from '@backend/core/domain/entities/post.entity';
import { Comment } from '@backend/core/domain/entities/comment.entity';
import { Like } from '@backend/core/domain/entities/like.entity';

/**
 * Interfaz para el repositorio de posts
 */
export interface PostPort {
  /**
   * Obtiene todos los posts con paginación
   * @param limit  Número de posts por página
   * @param offset Número de posts a saltar
   * @returns Promesa que resuelve con un array de posts
   */
  findAll(limit: number, offset: number): Promise<Post[]>;
  /**
   * Obtiene un post por su ID
   * @param id ID del post a buscar
   * @returns Promesa que resuelve con el post encontrado o null si no existe
   */
  findById(id: string): Promise<Post | null>;
  /**
   * Obtiene todos los posts de un usuario
   * @param userId ID del usuario
   * @returns Promesa que resuelve con un array de posts
   */
  findByUserId(userId: string): Promise<Post[]>;
  /**
   * Crea un nuevo post
   * @param post Datos del post a crear
   * @returns Promesa que resuelve con el post creado
   */
  create(post: Post): Promise<Post>;
  /**
   * Actualiza un post existente
   * @param post Datos del post a actualizar
   * @returns Promesa que resuelve con el post actualizado
   */
  update(post: Post): Promise<Post>;
  /**
   * Elimina un post
   * @param id ID del post a eliminar
   * @returns Promesa que resuelve cuando el post se ha eliminado
   */
  delete(id: string): Promise<void>;
  /**
   * Obtiene el número total de posts
   * @returns Promesa que resuelve con el número total de posts
   */
  count(): Promise<number>;
}

/**
 * Interfaz para el repositorio de comentarios
 */
export interface CommentPort {
  /**
   * Crea un nuevo comentario
   * @param comment Datos del comentario a crear
   * @returns Promesa que resuelve con el comentario creado
   */
  create(comment: Comment): Promise<Comment>;
  /**
   * Obtiene todos los comentarios de un post
   * @param postId ID del post
   * @returns Promesa que resuelve con un array de comentarios
   */
  findByPostId(postId: string): Promise<Comment[]>;
  /**
   * Elimina un comentario
   * @param id ID del comentario a eliminar
   * @returns Promesa que resuelve cuando el comentario se ha eliminado
   */
  delete(id: string): Promise<void>;
}

/**
 * Interfaz para el repositorio de likes
 */
export interface LikePort {
  /**
   * Crea un nuevo like
   * @param like Datos del like a crear
   * @returns Promesa que resuelve con el like creado
   */
  create(like: Like): Promise<Like>;
  /**
   * Elimina un like
   * @param id ID del like a eliminar
   * @returns Promesa que resuelve cuando el like se ha eliminado
   */
  delete(id: string): Promise<void>;
  /**
   * Obtiene todos los likes de un post
   * @param postId ID del post
   * @returns Promesa que resuelve con un array de likes
   */
  findByPostId(postId: string): Promise<Like[]>;
  /**
   * Obtiene el número total de likes por ID de post
   * @param postId ID del post
   * @returns Promesa que resuelve con el número total de likes
   */
  countByPostId(postId: string): Promise<number>;
  /**
   * Verifica si un like existe
   * @param postId ID del post
   * @param userId ID del usuario
   * @returns Promesa que resuelve con true si el like existe, false en caso contrario
   */
  exists(postId: string, userId: string): Promise<boolean>;
  /**
   * Elimina un like por ID de post y ID de usuario
   * @param postId ID del post
   * @param userId ID del usuario
   * @returns Promesa que resuelve cuando el like se ha eliminado
   */
  deleteByPostIdAndUserId(postId: string, userId: string): Promise<void>;
}