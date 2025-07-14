import { apiClient } from '@/shared/services/api-client';
import { Post, CreatePostDto, Comment, CreateCommentDto, PostsResponse } from '../types/post.types';

/**
 * Servicio para manejar las operaciones relacionadas con publicaciones
 */
export const postService = {
  /**
   * Obtiene todas las publicaciones con paginación
   * Normaliza la respuesta para asegurar que siempre tenga la estructura PostsResponse
   */
  getPosts: async (limit = 10, offset = 0): Promise<PostsResponse> => {
    try {
      // Añadir un tiempo de espera para prevenir bloqueos indefinidos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const response = await apiClient.get(`/posts?limit=${limit}&offset=${offset}`, {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      const data = response.data;
      
      // Normalizar la respuesta para asegurar estructura PostsResponse
      if (Array.isArray(data)) {
        // Si el backend devuelve un array, lo adaptamos a la estructura PostsResponse
        return {
          posts: data,
          total: data.length,
          pagina: Math.floor(offset / limit) + 1,
          porPagina: limit
        };
      } else if (data && typeof data === 'object' && 'posts' in data) {
        // Si ya tiene la estructura PostsResponse, la usamos directamente
        return data;
      } else {
        console.warn('Formato de datos inesperado desde el backend:', data);
        // Si no es ni array ni tiene la estructura correcta, devolvemos una estructura vacía
        return {
          posts: [],
          total: 0,
          pagina: 1,
          porPagina: limit
        };
      }
    } catch (error: any) {
      // Mejor manejo de errores con información detallada
      if (error.name === 'AbortError') {
        console.error('La solicitud de publicaciones excedió el tiempo de espera');
      } else if (error.response) {
        // Error de respuesta del servidor (4xx, 5xx)
        console.error(`Error ${error.response.status} al obtener publicaciones:`, 
                      error.response.data?.message || 'Error desconocido');
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor al obtener publicaciones');
      } else {
        // Error al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
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
   */
  toggleLike: async (postId: string, userId: string): Promise<{ likes: number }> => {
    const response = await apiClient.post(`/posts/${postId}/likes`, { userId });
    return response.data;
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
    console.log(`Simulando subida de archivo: ${file.name} (${file.size} bytes)`); 
    
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
