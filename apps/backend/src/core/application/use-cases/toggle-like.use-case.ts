import { LikePort } from '@backend/core/application/ports/post.port';
import { Like } from '@backend/core/domain/entities/like.entity';

export class ToggleLikeUseCase {
  constructor(private readonly likePort: LikePort) {}

  async execute(postId: string, userId: string): Promise<Like | null> {
    const likeExists = await this.likePort.exists(postId, userId);
    
    if (likeExists) {
      await this.likePort.deleteByPostIdAndUserId(postId, userId);
      return null;
    }

    const like = Like.fromJSON({
      postId,
      userId,
      createdAt: new Date()
    });

    return await this.likePort.create(like);
  }
}
