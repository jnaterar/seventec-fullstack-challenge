import { Request } from 'express';
import { PostType } from '@backend/core/domain/enums/post-type.enum';
import { UserPort } from '@backend/core/application/ports/user.port';
import { NotificationService } from '@backend/core/application/services/notification.service';
import { CommentPort, LikePort, PostPort } from '@backend/core/application/ports/post.port';
import { CreatePostUseCase } from '@backend/core/application/use-cases/create-post.use-case';
import { GetPostsUseCase } from '@backend/core/application/use-cases/get-posts.use-case';
import { UpdatePostUseCase } from '@backend/core/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '@backend/core/application/use-cases/delete-post.use-case';
import { GetPostByIdUseCase } from '@backend/core/application/use-cases/get-post-by-id.use-case';
import { CreateCommentUseCase } from '@backend/core/application/use-cases/create-comment.use-case';
import { ToggleLikeUseCase } from '@backend/core/application/use-cases/toggle-like.use-case';
import { PostDto } from '@backend/infrastructure/http/dtos/post.dto';
import { CommentDto } from '@backend/infrastructure/http/dtos/comment.dto';
import { PostFirestoreRepository as PostFirestoreAdapter } from '@backend/infrastructure/persistence/firebase/post.firestore.repository';
import { CommentFirestoreRepository as CommentFirestoreAdapter } from '@backend/infrastructure/persistence/firebase/comment.firestore.repository';
import { LikeFirestoreRepository as LikeFirestoreAdapter } from '@backend/infrastructure/persistence/firebase/like.firestore.repository';
import { UserFirestoreRepository as UserFirestoreAdapter } from '@backend/infrastructure/persistence/firebase/user.firestore.repository';
import { FcmNotificationService as NotificationAdapter } from '@backend/infrastructure/services/fcm.notification.service';

export class PostController {
  // Adaptadores
  private readonly postAdapter         : PostPort;
  private readonly commentAdapter      : CommentPort;
  private readonly likeAdapter         : LikePort;
  private readonly userAdapter         : UserPort;
  private readonly notificationService : NotificationService;
  // Casos de usos
  private readonly createPostUseCase    : CreatePostUseCase;
  private readonly getPostsUseCase      : GetPostsUseCase;
  private readonly updatePostUseCase    : UpdatePostUseCase;
  private readonly deletePostUseCase    : DeletePostUseCase;
  private readonly getPostByIdUseCase   : GetPostByIdUseCase;
  private readonly createCommentUseCase : CreateCommentUseCase;
  private readonly toggleLikeUseCase    : ToggleLikeUseCase;

  constructor() {
    // Inicializar adaptadores
    this.postAdapter          = PostFirestoreAdapter.getInstance();
    this.commentAdapter       = CommentFirestoreAdapter.getInstance();
    this.likeAdapter          = LikeFirestoreAdapter.getInstance();
    this.userAdapter          = UserFirestoreAdapter.getInstance();

    // Servicio de notificaciones
    this.notificationService  = new NotificationService(this.userAdapter, new NotificationAdapter());

    // Inicializar casos de usos
    this.createPostUseCase    = new CreatePostUseCase(this.postAdapter, this.notificationService);
    this.updatePostUseCase    = new UpdatePostUseCase(this.postAdapter, this.notificationService);
    this.deletePostUseCase    = new DeletePostUseCase(this.postAdapter);
    this.getPostsUseCase      = new GetPostsUseCase(this.postAdapter, this.commentAdapter, this.likeAdapter);
    this.getPostByIdUseCase   = new GetPostByIdUseCase(this.postAdapter, this.commentAdapter, this.likeAdapter);
    this.createCommentUseCase = new CreateCommentUseCase(this.commentAdapter);
    this.toggleLikeUseCase    = new ToggleLikeUseCase(this.likeAdapter);
  }

  /**
   * Obtener lista de posts con paginación
   */
  public getPosts = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const posts = await this.getPostsUseCase.execute(Number(limit), Number(offset));
      
      return { status: 200, data: posts };
    
    } catch (error) {
      return { status: 500, data: { message: 'Error al obtener las publicaciones' } };
    }
  }

  /**
   * Obtener un post específico
   */
  public getPost = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { postId } = req.params;
      const post       = await this.getPostByIdUseCase.execute(postId);
      if (!post) {
        return { status: 404, data: { message: 'Publicación no encontrada' } };
      }

      return { status: 200, data: post };

    } catch (error) {
      return { status: 500, data: { message: 'Error al obtener la publicación' } };
    }
  }

  /**
   * Crear un nuevo post
   */
  public createPost = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      // Obtener el post desde el cuerpo de la solicitud
      const postDto = req.body as PostDto;
      // Si es una historia y no tiene fecha de expiración, establecer 24 horas por defecto
      if (postDto.tipo === PostType.STORY && !postDto.fechaExpiracion) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        postDto.fechaExpiracion = expiresAt;
      }
      // Crear el post
      const post = await this.createPostUseCase.execute(postDto);
      
      return { status: 201, data: post };

    } catch (error) {
      return { status: 500, data: { message: 'Error al crear la publicación', error: error instanceof Error ? error.message : 'Error desconocido' } };
    }
  }

  /**
   * Actualizar un post
   */
  public updatePost = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { postId } = req.params;
      const postDto = req.body as Partial<PostDto>;
      const post = await this.updatePostUseCase.execute(postId, postDto);
      if (!post) {
        return { status: 404, data: { message: 'Publicación no encontrada' } };
      }

      return { status: 200, data: post };

    } catch (error) {
      return { status: 500, data: { message: 'Error al actualizar la publicación', error: error instanceof Error ? error.message : 'Error desconocido' } };
    }
  }

  /**
   * Eliminar un post
   */
  public deletePost = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { postId } = req.params;
      await this.deletePostUseCase.execute(postId);
      return { status: 204, data: {} };

    } catch (error) {
      return { status: 500, data: { message: 'Error al eliminar la publicación', error: error instanceof Error ? error.message : 'Error desconocido' } };
    }
  }

  /**
   * Crear un nuevo comentario
   */
  public createComment = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { postId } = req.params;
      const commentDto = { ...req.body, postId } as CommentDto;
      const comment = await this.createCommentUseCase.execute(commentDto);

      return { status: 201, data: comment };

    } catch (error) {
      return { status: 500, data: { message: 'Error al crear el comentario', error: error instanceof Error ? error.message : 'Error desconocido' } };
    }
  }

  /**
   * Dar o quitar like a un post
   */
  public toggleLike = async (req: Request): Promise<{ status: number; data: any }> => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
      const likes = await this.toggleLikeUseCase.execute(postId, userId);

      return { status: 200, data: { likes } };

    } catch (error) {
      return { status: 500, data: { message: 'Error al actualizar el like', error: error instanceof Error ? error.message : 'Error desconocido' } };
    }
  }
}
