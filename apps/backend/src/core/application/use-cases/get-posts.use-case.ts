import { PostPort } from '@backend/core/application/ports/post.port';
import { CommentPort } from '@backend/core/application/ports/post.port';
import { LikePort } from '@backend/core/application/ports/post.port';
import { Comment } from '@backend/core/domain/entities/comment.entity';
import { UserPort } from '@backend/core/application/ports/user.port';

export class GetPostsUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly commentPort: CommentPort,
    private readonly likePort: LikePort,
    private readonly userPort: UserPort
  ) {}

  async execute(limit: number, offset: number): Promise<Array<{
    id: string;
    imagen: string;
    descripcion: string;
    fechaCreacion: Date;
    fechaEdicion: Date;
    userId: string;
    comments: Comment[];
    likes: number;
  }>> {
    try {
      const posts = await this.postPort.findAll(limit, offset);
      
      // Procesamos cada post individualmente para evitar que un error en uno afecte a todos
      const postsWithDetails = [];
      
      for (const post of posts) {
        try {
          // Obtenemos comentarios y likes con manejo de errores para cada publicación
          let comments: Comment[] = [];
          try {
            comments = await this.commentPort.findByPostId(post.id);
          } catch (error) {
            console.error(`Error al obtener comentarios para el post ${post.id}:`, error);
          }
          
          let likes = 0;
          try {
            likes = await this.likePort.countByPostId(post.id);
          } catch (error) {
            console.error(`Error al obtener likes para el post ${post.id}:`, error);
          }
          
          // Obtenemos información del autor
          let author = null;
          try {
            if (post.userId) {
              author = await this.userPort.findById(post.userId);
            }
          } catch (error) {
            console.error(`Error al obtener información del autor para el post ${post.id}:`, error);
          }
          
          // Calculamos la fecha relativa basada en la fecha de edición
          // Función auxiliar para convertir de forma segura cualquier valor a una instancia de Date válida
          const safeDate = (dateInput: any, fallback: Date = new Date()): Date => {
            if (!dateInput) return fallback;
            
            if (dateInput instanceof Date) {
              return isNaN(dateInput.getTime()) ? fallback : dateInput;
            }
            
            if (typeof dateInput === 'string') {
              try {
                const parsedDate = new Date(dateInput);
                return isNaN(parsedDate.getTime()) ? fallback : parsedDate;
              } catch (e) {
                return fallback;
              }
            }
            
            if (typeof dateInput === 'number') {
              try {
                const parsedDate = new Date(dateInput);
                return isNaN(parsedDate.getTime()) ? fallback : parsedDate;
              } catch (e) {
                return fallback;
              }
            }
            
            return fallback;
          };
          
          // Aseguramos que fechaCreacion sea una instancia válida de Date
          const now = new Date();
          const fechaCreacion = safeDate(post.fechaCreacion, now);
          
          // Usamos la fecha de edición para el cálculo de la fecha relativa, ya que refleja la última actualización
          // Si la fecha de edición es inválida, usamos la fecha de creación como respaldo
          const fechaEdicion = safeDate(post.fechaEdicion, fechaCreacion);
          
          // Calculamos la fecha relativa
          const fechaRelativa = this.getRelativeTimeString(fechaEdicion);
          
          // Añadimos el post con sus detalles
          postsWithDetails.push({
            id: post.id,
            imagen: post.imagen || '',
            descripcion: post.descripcion || '',
            fechaCreacion,
            // Usar fechaCreacion como fallback para fechaEdicion en lugar de fecha actual
            fechaEdicion: post.fechaEdicion instanceof Date ? post.fechaEdicion : fechaCreacion,
            userId: post.userId || '',
            comments,
            likes,
            autor: author ? {
              id: author.id,
              nombre: author.nombre || 'Usuario',
              roles: author.roles || []
            } : undefined,
            fechaRelativa
          });
        } catch (error) {
          console.error(`Error al procesar el post ${post.id}:`, error);
          // Continuamos con el siguiente post en caso de error
        }
      }
      
      return postsWithDetails;
    } catch (error) {
      console.error('Error en GetPostsUseCase:', error);
      // Devolvemos un array vacío en caso de error para evitar que falle toda la operación
      return [];
    }
  }
  
  /**
   * Obtiene una representación de tiempo relativo en español
   */
  private getRelativeTimeString(date: Date): string {
    try {
      // Validar que la fecha sea una instancia válida
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Fecha inválida proporcionada a getRelativeTimeString:', date);
        return 'Fecha reciente';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (isNaN(diffInSeconds)) {
        return 'Fecha reciente';
      }
      
      // Menos de 1 minuto
      if (diffInSeconds < 60) {
        return 'Hace un momento';
      }
      
      // Menos de 1 hora
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
      }
      
      // Menos de 1 día
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      }
      
      // Menos de 1 semana
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
      }
      
      // Menos de 1 mes
      if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      }
      
      // Menos de 1 año
      if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
      }
      
      // Más de 1 año
      const years = Math.floor(diffInSeconds / 31536000);
      return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
    } catch (error) {
      console.error('Error al calcular fecha relativa:', error);
      return 'Fecha reciente';
    }
  }
}
