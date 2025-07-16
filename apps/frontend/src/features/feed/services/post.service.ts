import { Post, CreatePostDto, Comment, CreateCommentDto, PostsResponse } from '@frontend/features/feed/types/post.types';
import { apiClient } from '@frontend/shared/services/api-client';
import { logger } from '@frontend/shared/utils/logger';

/**
 * Servicio para manejar las operaciones relacionadas con publicaciones
 */
export const postService = {
  /**
   * Obtiene todas las publicaciones con paginación
   */
  getPosts: async (limit = 10, offset = 0, signal?: AbortSignal): Promise<PostsResponse> => {
    try {
      logger.log('Solicitud de obtención de publicaciones...');

      const response = await apiClient.get(`/posts?limit=${limit}&offset=${offset}`, {
        signal // Pasar la señal de cancelación a la petición
      });
      
      // Aseguramos que la respuesta tenga la estructura correcta
      if (response.data && Array.isArray(response.data.posts)) {
        logger.log('Publicaciones obtenidas correctamente');
        return response.data;

      } else {
        logger.warn('La respuesta del servidor no tiene el formato esperado');
        return {
          posts: [],
          total: 0,
          pagina: 1,
          porPagina: limit
        };
      }
    } catch (error: unknown) {
      // Manejo de errores con TypeScript seguro
      if (error instanceof Error) {
        // Ignorar errores de cancelación
        if (error.name === 'AbortError' || error.message === 'canceled') {
          logger.warn('Solicitud de obtención de publicaciones cancelada');

        } else if ('response' in error && error.response) {
          // Error de respuesta del servidor (4xx, 5xx)
          const response = error.response as { status?: number; data?: { message?: string } };
          logger.error(`Error ${response.status || 'desconocido'} al obtener publicaciones:`, 
            response.data?.message || 'Error desconocido'
          );

        } else if ('request' in error) {
          // La solicitud se realizó pero no se recibió respuesta
          logger.error('No se recibió respuesta del servidor al obtener publicaciones');

        } else {
          // Error al configurar la solicitud
          logger.error('Error al configurar la solicitud de publicaciones:', error.message);
        }

      } else {
        logger.error('Error desconocido al obtener publicaciones');
      }
      
      // En caso de error, devolvemos una estructura vacía
      return {
        posts: [],
        total: 0,
        pagina: 1,
        porPagina: limit
      };
    }
  },

  /**
   * Obtiene una publicación específica por ID
   */
  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva publicación
   */
  createPost: async (post: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post('/posts', post);
    return response.data;
  },

  /**
   * Actualiza una publicación existente
   */
  updatePost: async (id: string, post: Partial<Post>): Promise<Post> => {
    const response = await apiClient.put(`/posts/${id}`, post);
    return response.data;
  },

  /**
   * Elimina una publicación
   */
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  /**
   * Da/quita like a una publicación
   * @returns Un objeto con la lista actualizada de likes y el estado de si el usuario ha dado like
   */
  toggleLike: async (postId: string, userId: string): Promise<{ likes: {id: string; nombre: string}[] }> => {
    const response = await apiClient.post(`/posts/${postId}/likes`, { userId });
    return response.data;
  },
  
  /**
   * Obtiene la lista de usuarios que dieron like a una publicación
   */
  getLikes: async (postId: string): Promise<{id: string; nombre: string}[]> => {
    try {
      const response = await apiClient.get(`/posts/${postId}/likes`);
      return response.data || [];
    } catch (error: unknown) {
      // Manejo de errores con TypeScript seguro
      if (error instanceof Error) {
        // Ignorar errores de cancelación
        if (error.name === 'AbortError' || error.message === 'canceled') {
          logger.debug('Solicitud de likes cancelada');
          return [];
        }
        
        if ('response' in error && error.response) {
          // Error de respuesta del servidor (4xx, 5xx)
          const response = error.response as { status?: number; data?: { message?: string } };
          logger.error(`Error ${response.status || 'desconocido'} al obtener likes:`, 
                      response.data?.message || 'Error desconocido');
        } else if ('request' in error) {
          // La solicitud se realizó pero no se recibió respuesta
          logger.error('No se recibió respuesta del servidor al obtener likes');
        } else {
          // Error al configurar la solicitud
          logger.error('Error al configurar la solicitud de likes:', error.message);
        }
      } else {
        logger.error('Error desconocido al obtener likes');
      }
      
      // En caso de error, devolvemos un array vacío
      return [];
    }
  },

  /**
   * Añade un comentario a una publicación
   */
  addComment: async (comment: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${comment.postId}/comments`, comment);
    return response.data;
  },

  /**
   * Sube una imagen para una publicación
   * Nota: Este método simulará la subida de una imagen retornando una URL aleatoria
   * En un entorno real, se conectaría con Firebase Storage
   */
  uploadImage: async (file: File): Promise<string> => {
    // Simulamos la carga de la imagen
    // En un entorno real, usaríamos el file para cargarlo a Firebase Storage
    logger.log(`Simulando subida de archivo: ${file.name} (${file.size} bytes)`); 
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generar una URL aleatoria para simular la subida de imagen
        // Usamos un hash basado en el nombre del archivo para tener algo de consistencia
        const fileNameHash = Math.abs(file.name.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0));
        const imageUrl = `https://picsum.photos/id/${fileNameHash % 1000}/800/600`;
        resolve(imageUrl);
      }, 1000);
    });
  }
};
