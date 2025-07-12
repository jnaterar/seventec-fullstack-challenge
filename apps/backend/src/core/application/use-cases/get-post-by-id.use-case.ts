import { PostPort } from '@backend/core/application/ports/post.port';
import { CommentPort } from '@backend/core/application/ports/post.port';
import { LikePort } from '@backend/core/application/ports/post.port';
import { Post } from '@backend/core/domain/entities/post.entity';
import { Comment } from '@backend/core/domain/entities/comment.entity';

export class GetPostByIdUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly commentPort: CommentPort,
    private readonly likePort: LikePort
  ) {}

  async execute(postId: string): Promise<{
    id: string;
    imagen: string;
    descripcion: string;
    fechaCreacion: Date;
    fechaEdicion: Date;
    userId: string;
    comments: Comment[];
    likes: number;
  } | null> {
    const post = await this.postPort.findById(postId);
    if (!post) {
      return null;
    }

    const comments = await this.commentPort.findByPostId(postId);
    const likes = await this.likePort.countByPostId(postId);

    return {
      id: post.id,
      imagen: post.imagen,
      descripcion: post.descripcion,
      fechaCreacion: post.fechaCreacion,
      fechaEdicion: post.fechaEdicion,
      userId: post.userId,
      comments,
      likes
    };
  }
}
