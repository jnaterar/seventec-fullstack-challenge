import { PostPort } from '@backend/core/application/ports/post.port';
import { UserPort } from '@backend/core/application/ports/user.port';
import { PostDto } from '@backend/infrastructure/http/dtos/post.dto';

import { Post } from '@backend/core/domain/entities/post.entity';

export class CreatePostUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly userPort?: UserPort,
    private readonly notificationService?: { notifyParticipantsOfPost: (postId: string, title: string, body: string, isUpdate: boolean) => Promise<void> }
  ) {}

  async execute(postDto: PostDto): Promise<Post> {
    const post    = Post.fromJSON(postDto);
    const created = await this.postPort.create(post);
    
    try {
      // Solo enviar notificación si el servicio está disponible
      if (this.notificationService) {
        // Buscar información del autor para personalizar la notificación
        let authorName = "Un organizador";
        if (this.userPort && created.userId) {
          const author = await this.userPort.findById(created.userId);
          if (author && author.nombre) {
            authorName = author.nombre;
          }
        }
        
        // Crear un extracto de la descripción (primeros 50 caracteres)
        const descriptionExcerpt = created.descripcion 
          ? (created.descripcion.length > 50 
              ? `${created.descripcion.substring(0, 47)}...` 
              : created.descripcion)
          : 'Nueva información importante';
        
        await this.notificationService.notifyParticipantsOfPost(
          created.id,
          `Nueva publicación de ${authorName}`,
          descriptionExcerpt,
          false
        );
      }
    } catch (err) {
      console.error('Error al enviar notificación push:', err);
      // La notificación no es crítica, continuamos aunque falle
    }
    
    return created;
  }
}
