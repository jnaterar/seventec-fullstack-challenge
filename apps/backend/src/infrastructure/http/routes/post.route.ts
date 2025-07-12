import { Router } from 'express';
import { PostController as Controller } from '@backend/infrastructure/http/controllers/post.controller';
import { routeHandler } from '@backend/infrastructure/http/middlewares/common/routeHandler.middleware';
import { authorizeResourceOwner } from '@backend/infrastructure/http/middlewares/user/authorizeResourceOwner.middleware';

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
    authorizeResourceOwner,
    routeHandler(controller.updatePost)
);
router.delete('/:postId', 
    authorizeResourceOwner,
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

export { router as PostRouter };
