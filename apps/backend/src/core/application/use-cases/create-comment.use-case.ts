import { CommentPort } from '@backend/core/application/ports/post.port';
import { CommentDto } from '@backend/infrastructure/http/dtos/comment.dto';

import { Comment } from '@backend/core/domain/entities/comment.entity';

export class CreateCommentUseCase {
  constructor(private readonly commentPort: CommentPort) {}

  async execute(commentDto: CommentDto): Promise<Comment> {
    const comment = Comment.fromJSON(commentDto);
    return await this.commentPort.create(comment);
  }
}
