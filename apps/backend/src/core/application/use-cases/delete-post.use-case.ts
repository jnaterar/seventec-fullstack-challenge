import { PostPort } from '@backend/core/application/ports/post.port';

export class DeletePostUseCase {
  constructor(private readonly postPort: PostPort) {}

  async execute(postId: string): Promise<void> {
    await this.postPort.delete(postId);
  }
}
