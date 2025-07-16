import { Router } from 'express';
import { PostController as Controller } from '@backend/infrastructure/http/controllers/post.controller';
import { routeHandler } from '@backend/infrastructure/http/middlewares/common/routeHandler.middleware';
import { authorizePostOwner } from '@backend/infrastructure/http/middlewares/user/authorizePostOwner.middleware';

// Inicializar enrutador y controlador
const router     = Router();
const controller = new Controller();

// Rutas de posts
router.get('/', 
    routeHandler(controller.getPosts)
);
router.get('/:postId', 
    routeHandler(controller.getPost)
);
router.post('/', 
    routeHandler(controller.createPost)
);
router.put('/:postId', 
    authorizePostOwner,
    routeHandler(controller.updatePost)
);
router.delete('/:postId', 
    authorizePostOwner,
    routeHandler(controller.deletePost)
);

// Rutas de comentarios
router.post('/:postId/comments', 
    routeHandler(controller.createComment)
);

// Rutas de likes
router.post('/:postId/likes', 
    routeHandler(controller.toggleLike)
);
router.get('/:postId/likes', 
    routeHandler(controller.getPostLikes)
);

export { router as PostRouter };
