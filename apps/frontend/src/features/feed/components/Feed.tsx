import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Container, Alert, Button, Skeleton, Fade, 
  Paper, Tooltip 
} from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { Post, PostType } from '@frontend/features/feed/types/post.types';
import { postService } from '@frontend/features/feed/services/post.service';
import { PostCard } from '@frontend/features/feed/components/PostCard';
import { NewPostForm } from '@frontend/features/feed/components/NewPostForm';
import { useAuth } from '@frontend/shared/context/AuthContext';
import { UserRole } from '@enums';
import { logger } from '@frontend/shared/utils/logger';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPostForm, setShowPostForm] = useState(false);
  const { currentUser } = useAuth();
  
  const postsPerPage = 5;

  // Cargar publicaciones
  useEffect(() => {
    let isMounted = true;
    let initialLoad = true;
    let controller: AbortController | null = null;
    
    const fetchPosts = async () => {
      if (import.meta.env.MODE === 'development') {
        logger.debug('Cargando publicaciones...');
      }
      
      // Solo mostrar loading en la carga inicial
      if (initialLoad) {
        setLoading(true);
      }
      
      setError(null);
      
      try {
        // Crear un nuevo AbortController para esta solicitud
        controller = new AbortController();
        const signal = controller.signal;
        
        // Llamada a la API para obtener publicaciones con soporte para cancelación
        const response = await postService.getPosts(postsPerPage, 0, signal);
        
        if (!isMounted) return;
        
        // Ahora la respuesta siempre tiene la estructura PostsResponse
        setPosts(response.posts);
        setHasMore(response.posts.length < response.total);
        initialLoad = false;

      } catch (err: any) {
        // Ignorar errores de cancelación
        if (err.name === 'AbortError' || err.message === 'canceled') {
          logger.log('Solicitud cancelada');
          return;
        }
        
        if (!isMounted) return;
        
        logger.error('Error al cargar publicaciones:', err);
        setError('No pudimos cargar las publicaciones. Intenta de nuevo más tarde.');
        
        // Cargar datos de prueba cuando no hay conexión al backend
        const mockPosts: Post[] = [
          {
            id: '1',
            imagen: 'https://picsum.photos/id/237/800/600',
            descripcion: 'Esta es una publicación de prueba cuando no hay conexión al backend.',
            fechaCreacion: new Date(),
            fechaEdicion: new Date(),
            fechaRelativa: 'hace un momento',
            userId: 'user1',
            tipo: PostType.NORMAL,
            autor: {
              id: 'user1',
              nombre: 'Usuario de Prueba',
              roles: ['usuario']
            },
            likes: [
              { id: 'mock1', nombre: 'Usuario Mock 1' },
              { id: 'mock2', nombre: 'Usuario Mock 2' },
              { id: 'mock3', nombre: 'Usuario Mock 3' },
              { id: 'mock4', nombre: 'Usuario Mock 4' },
              { id: 'mock5', nombre: 'Usuario Mock 5' },
              { id: 'mock6', nombre: 'Usuario Mock 6' },
              { id: 'mock7', nombre: 'Usuario Mock 7' },
              { id: 'mock8', nombre: 'Usuario Mock 8' },
              { id: 'mock9', nombre: 'Usuario Mock 9' },
              { id: 'mock10', nombre: 'Usuario Mock 10' }
            ],
            comentarios: [],
            userHasLiked: true
          },
          {
            id: '2',
            imagen: 'https://picsum.photos/id/250/800/600',
            descripcion: 'Otra publicación de ejemplo para probar la interfaz.',
            fechaCreacion: new Date(Date.now() - 3600000 * 2), // Hace 2 horas
            fechaEdicion: new Date(Date.now() - 3600000 * 2),
            fechaRelativa: 'hace 2 horas',
            userId: 'user2',
            tipo: PostType.STORY,
            autor: {
              id: 'user2',
              nombre: 'Organizador Ejemplo',
              roles: ['organizador']
            },
            likes: [
              { id: 'mock1', nombre: 'Usuario Mock 1' },
              { id: 'mock2', nombre: 'Usuario Mock 2' }
            ],
            comentarios: [],
            userHasLiked: false
          }
        ];
        
        setPosts(mockPosts);
        setHasMore(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchPosts();
    
    // Función de limpieza para cancelar la solicitud pendiente
    return () => {
      isMounted = false;
      if (controller) {
        controller.abort();
      }
    };
  }, [refreshKey]);

  // Cargar más publicaciones
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try { 
      logger.log('setLoadingMore - Cargando más publicaciones...');
      const nextPage = page + 1;
      const offset = (nextPage - 1) * postsPerPage;
      const response = await postService.getPosts(postsPerPage, offset);
      
      // Ahora la respuesta siempre tiene la estructura PostsResponse
      setPosts(prev => [...prev, ...response.posts]);
      setPage(nextPage);
      setHasMore(posts.length + response.posts.length < response.total);
      
      if (response.posts.length === 0) {
        // Si no hay más publicaciones, actualizar hasMore
        setHasMore(false);
      }
    } catch (err) {
      logger.error('Error al cargar más publicaciones:', err);
      setError('No pudimos cargar más publicaciones. Intenta de nuevo más tarde.');
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Actualizar una publicación
  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  // Eliminar una publicación
  const handleDeletePost = (postId: string) => {
    // Retrasamos la eliminación visual para que la notificación tenga tiempo de mostrarse
    setTimeout(() => {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }, 1000); // Retraso de 1 segundo
  };

  // Refrescar el feed
  const handleRefresh = () => {
    // Forzar un nuevo renderizado y recargar las publicaciones
    setPage(1);
    setPosts([]);
    // Solo incrementar refreshKey si no hay una carga en curso
    if (!loading) {
      setRefreshKey(prev => prev + 1);
    }
  };

  // Cuando se crea una nueva publicación
  const handlePostCreated = () => {
    handleRefresh();
    setShowPostForm(false); // Ocultar el formulario después de crear una publicación
  };

  // Renderizar esqueletos durante la carga
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Box key={index} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={60} animation="wave" />
        <Skeleton variant="rectangular" height={350} animation="wave" />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" height={20} width="80%" animation="wave" />
          <Skeleton variant="text" height={20} width="40%" animation="wave" />
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <Skeleton variant="rectangular" height={40} width="100%" animation="wave" />
        </Box>
      </Box>
    ));
  };

  // Verificar si el usuario puede publicar
  const canPublish = currentUser && (currentUser.roles?.includes(UserRole.ADMIN) || currentUser.roles?.includes(UserRole.ORGANIZER));

  if (import.meta.env.MODE === 'development') {
    logger.debug('Renderizando Feed', { loading, postsCount: posts.length });
  }
  
  return (
    <Container maxWidth="md">
      {/* Contenedor principal */}
      <Box sx={{ pt: 0 }}>
        {/* Botón de crear publicación (visible para administradores y organizadores) */}
        {canPublish && (
          <Box mb={3}>
            {!showPostForm ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth
                size="large"
                onClick={() => setShowPostForm(true)}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  fontWeight: 'bold'
                }}
              >
                Crear Publicación
              </Button>
            ) : (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">Nueva Publicación</Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowPostForm(false)}
                    size="small"
                  >
                    Cancelar
                  </Button>
                </Box>
                <NewPostForm onPostCreated={handlePostCreated} isVisible={true} />
              </Paper>
            )}
          </Box>
        )}

        {/* Botón de actualizar */} 
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Actualizar publicaciones">
            <span> {/* Wrapper span for the disabled button */}
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
                variant="contained"
              >
                Actualizar
              </Button>
            </span>
          </Tooltip>
        </Box>
        
        {/* Mensaje de error */}
        {error && (
          <Fade in={Boolean(error)}>
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}
        
        {/* Lista de publicaciones */}
        {loading ? (
          renderSkeletons()
        ) : posts.length > 0 ? (
          <Box>
            {posts.map((post) => (
              <Box key={post.id} sx={{ mb: 3 }}>
                <PostCard
                  key={post.id} 
                  post={post} 
                  onUpdatePost={handleUpdatePost} 
                  onDeletePost={handleDeletePost}
                />
              </Box>
            ))}
            
            {/* Botón de cargar más */}
            {hasMore && (
              <Box textAlign="center" mt={2} mb={4}>
                <Button 
                  variant="outlined" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  sx={{ px: 4 }}
                >
                  {loadingMore ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Cargar más'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            No hay publicaciones disponibles. {currentUser?.roles?.includes(UserRole.ORGANIZER) && '¡Sé el primero en crear una!'}
          </Alert>
        )}
      </Box>
    </Container>
  );
};
