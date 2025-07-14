import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Divider, 
  Container, Alert, Button, Skeleton, Fade, Paper
} from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { Post, PostType } from '../types/post.types';
import { postService } from '../services/post.service';
import { PostCard } from './PostCard';
import { NewPostForm } from './NewPostForm';
import { useAuth } from '../../../shared/context/AuthContext';
import { UserRole } from '@shared/enums/user-role.enum';

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
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Llamada a la API para obtener publicaciones
        const response = await postService.getPosts(postsPerPage, 0);
        
        // Ahora la respuesta siempre tiene la estructura PostsResponse
        setPosts(response.posts);
        setHasMore(response.posts.length < response.total);

      } catch (err) {
        console.error('Error al cargar publicaciones:', err);
        setError('No pudimos cargar las publicaciones. Intenta de nuevo más tarde.');
        
        // Cargar datos de prueba cuando no hay conexión al backend
        // Esto permite que la interfaz funcione sin errores mientras no haya conexión
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
              roles: ['participant']
            },
            likes: 5,
            comentarios: [],
            userHasLiked: false
          },
          {
            id: '2',
            imagen: 'https://picsum.photos/id/238/800/600',
            descripcion: 'Otra publicación de ejemplo para desarrollo sin backend.',
            fechaCreacion: new Date(),
            fechaEdicion: new Date(),
            fechaRelativa: 'hace 5 minutos',
            userId: 'user2',
            tipo: PostType.STORY,
            autor: {
              id: 'user2',
              nombre: 'Organizador Demo',
              roles: ['organizer']
            },
            likes: 10,
            comentarios: [],
            userHasLiked: true
          }
        ];
        
        setPosts(mockPosts);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [refreshKey]);

  // Cargar más publicaciones
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
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
      console.error('Error al cargar más publicaciones:', err);
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
    setRefreshKey(prev => prev + 1);
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

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Publicaciones
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            variant="outlined"
          >
            Actualizar
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        {/* Botón para mostrar el formulario (visible para todos pero funcionará solo para organizadores) */}
        {currentUser && (
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
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpdatePost={handleUpdatePost} 
                onDeletePost={handleDeletePost}
              />
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
