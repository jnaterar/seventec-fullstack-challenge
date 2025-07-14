import { PostPort } from '@backend/core/application/ports/post.port';
import { PostDto } from '@backend/infrastructure/http/dtos/post.dto';
import { Post } from '@backend/core/domain/entities/post.entity';

export class UpdatePostUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly notificationService?: { notifyParticipantsOfPost: (postId: string, title: string, body: string, isUpdate: boolean) => Promise<void> }
  ) {}

  async execute(id: string, postDto: Partial<PostDto>): Promise<Post> {
    // Primero obtenemos el post original para conservar datos críticos como el userId
    const originalPost = await this.postPort.findById(id);
    if (!originalPost) {
      throw new Error(`Post con id ${id} no encontrado`);
    }
    
    // Preservamos el userId y otros campos críticos que no deberían cambiar
    const post = Post.fromJSON({
      ...postDto,
      id,
      userId: originalPost.userId // Preservamos el userId original
    });
    
    const updated = await this.postPort.update(post);
    try {
      if (this.notificationService) {
        await this.notificationService.notifyParticipantsOfPost(
          updated.id,
          'Post actualizado',
          `Un post ha sido actualizado`,
          true
        );
      }
    } catch (err) {
      console.error('Error enviando notificaciones push:', err);
    }
    return updated;
  }
}
