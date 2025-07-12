import { PostPort } from '@backend/core/application/ports/post.port';
import { PostDto } from '@backend/infrastructure/http/dtos/post.dto';

import { Post } from '@backend/core/domain/entities/post.entity';

export class CreatePostUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly notificationService?: { notifyParticipantsOfPost: (postId: string, title: string, body: string, isUpdate: boolean) => Promise<void> }
  ) {}

  async execute(postDto: PostDto): Promise<Post> {
    const post    = Post.fromJSON(postDto);
    const created = await this.postPort.create(post);
    try {
      if (this.notificationService) {
        await this.notificationService.notifyParticipantsOfPost(
          created.id,
          'Nueva publicación',
          'Se ha realizado una nueva publicación',
          false
        );
      }
    } catch (err) {
      console.error('Error al enviar notificación push:', err);
    }
    return created;
  }
}
