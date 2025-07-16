/**
 * Tipos de publicaciones disponibles
 */
export enum PostType {
  NORMAL = 'NORMAL',
  STORY = 'STORY'
}

/**
 * Interfaz para las publicaciones
 */
export interface Post {
  id: string;
  imagen: string;
  descripcion: string;
  fechaCreacion: Date;
  fechaEdicion: Date;
  fechaRelativa: string;
  userId: string;
  tipo: PostType;
  fechaExpiracion?: Date | null;
  // Datos adicionales para mostrar en la UI
  autor?: {
    id: string;
    nombre: string;
    roles: string[];
  };
  likes?: {id: string; nombre: string}[];
  comentarios?: Comment[];
  userHasLiked?: boolean;
}

/**
 * Interfaz para la creación de publicaciones
 */
export interface CreatePostDto {
  imagen: string;
  descripcion: string;
  userId: string;
  tipo: PostType;
  fechaExpiracion?: Date | null;
}

/**
 * Interfaz para los comentarios
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  contenido: string;
  fechaCreacion: Date;
  fechaRelativa: string;
  autor?: {
    nombre: string;
    roles: string[];
  };
}

/**
 * Interfaz para la creación de comentarios
 */
export interface CreateCommentDto {
  postId: string;
  userId: string;
  contenido: string;
}

/**
 * Interfaz para la respuesta paginada de publicaciones
 */
export interface PostsResponse {
  posts: Post[];
  total: number;
  pagina: number;
  porPagina: number;
}
