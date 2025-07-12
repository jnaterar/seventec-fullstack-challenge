import { PostPort } from '@backend/core/application/ports/post.port';
import { CommentPort } from '@backend/core/application/ports/post.port';
import { LikePort } from '@backend/core/application/ports/post.port';
import { Comment } from '@backend/core/domain/entities/comment.entity';

export class GetPostsUseCase {
  constructor(
    private readonly postPort: PostPort,
    private readonly commentPort: CommentPort,
    private readonly likePort: LikePort
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
    const posts = await this.postPort.findAll(limit, offset);
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const comments = await this.commentPort.findByPostId(post.id);
        const likes = await this.likePort.countByPostId(post.id);
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
      })
    );
    return postsWithDetails;
  }
}
