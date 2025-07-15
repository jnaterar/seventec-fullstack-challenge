import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardContent, CardActions, CardMedia,
  Typography, Avatar, IconButton, Box, TextField,
  Chip, Tooltip, Divider, Menu, MenuItem, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  Snackbar, Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Post, CreateCommentDto } from '../types/post.types';
import { postService } from '../services/post.service';
import { useAuth } from '../../../shared/context/AuthContext';
import { EditPostForm } from './EditPostForm';
import { UserRole } from '@shared/enums/user-role.enum';

type PostCardProps = {
  post: Post;
  onUpdatePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdatePost, onDeletePost }) => {
  const { currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Fecha formateada para el tooltip
  const [formattedDate, setFormattedDate] = useState<string>('Fecha no disponible');
  
  useEffect(() => {    
    // Esta función maneja todos los posibles formatos de fecha
    const formatPostDate = () => {
      try {
        let date;
        
        // Si es un objeto de Firestore con seconds
        if (post.fechaEdicion && typeof post.fechaEdicion === 'object' && 'seconds' in (post.fechaEdicion as any)) {
          date = new Date((post.fechaEdicion as any).seconds * 1000);
        }
        // Si es un string ISO
        else if (typeof post.fechaEdicion === 'string') {
          date = new Date(post.fechaEdicion);
        }
        // Si es un objeto Date
        else if (post.fechaEdicion instanceof Date) {
          date = post.fechaEdicion;
        }
        // Fallback a fechaCreacion
        else if (post.fechaCreacion) {
          if (typeof post.fechaCreacion === 'object' && 'seconds' in (post.fechaCreacion as any)) {
            date = new Date((post.fechaCreacion as any).seconds * 1000);
          } else if (typeof post.fechaCreacion === 'string') {
            date = new Date(post.fechaCreacion);
          } else if (post.fechaCreacion instanceof Date) {
            date = post.fechaCreacion;
          } else {
            // Usar la fecha actual como último recurso
            date = new Date();
          }
        } 
        // Último fallback
        else {
          // Usar la fecha actual como último recurso
          date = new Date();
        }
        
        // Formatea la fecha
        const formatted = date.toLocaleString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Lima'
        });
        
        setFormattedDate(formatted);
        
      } catch (error) {
        console.error('Error formateando fecha:', error);
        setFormattedDate('Fecha no disponible');
      }
    };
    
    formatPostDate();
  }, [post]);  // Recalcula cuando el post cambia
  
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [hasLiked, setHasLiked] = useState(post.userHasLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  const authorName = post.autor?.nombre || 'Usuario';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorRoles = post.autor?.roles || [];

  // Verificar si el usuario actual es el autor del post
  // Usamos el ID del autor si está disponible, o el userId del post como alternativa
  const authorId = post.autor?.id || post.userId;
  const isAuthor = Boolean(currentUser?.uid && authorId && currentUser.uid === authorId);

  // Manejo del menú
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Manejar eliminación del post
  const handleDeletePost = async () => {
    try {
      // Cerramos el diálogo de confirmación primero
      handleCloseConfirmDialog();
      
      // Intentamos eliminar el post en el servidor
      await postService.deletePost(post.id);
      
      // Mostramos la notificación de éxito
      setNotification({
        message: 'Publicación eliminada con éxito',
        type: 'success'
      });
      
      // Notificamos al componente padre después de mostrar la notificación
      // El componente padre ya tiene un retraso integrado para la eliminación visual
      onDeletePost(post.id);
    } catch (error) {
      console.error('Error al eliminar la publicación:', error);
      setNotification({
        message: 'Error al eliminar la publicación',
        type: 'error'
      });
    }
  };

  const handleEditPost = () => {
    handleCloseMenu();
    setEditDialogOpen(true);
  };
  
  const handlePostUpdated = (updatedPost: Post) => {
    onUpdatePost(updatedPost);
    setNotification({
      message: 'Publicación actualizada con éxito',
      type: 'success'
    });
  };

  // Manejo de likes
  const handleLikeToggle = async () => {
    if (likeLoading || !currentUser) return;

    setLikeLoading(true);
    try {
      // Usar toggleLike en lugar de likePost/unlikePost
      const result = await postService.toggleLike(post.id, currentUser.uid);
      
      // Actualizar estado local basado en el nuevo estado
      const newLikedState = !hasLiked;
      setHasLiked(newLikedState);
      
      // Si tenemos los likes actualizados desde el servidor, usamos ese valor
      if (result && typeof result.likes === 'number') {
        setLikesCount(result.likes);
      } else {
        // Si no, calculamos localmente
        setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      }
      // Actualizar el post en el estado del padre
      onUpdatePost({
        ...post,
        likes: result?.likes || (newLikedState ? likesCount : Math.max(0, likesCount)),
        userHasLiked: newLikedState
      });
    } catch (error) {
      console.error('Error al gestionar like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Manejo de comentarios
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || submittingComment) return;

    setSubmittingComment(true);
    try {
      const commentDto: CreateCommentDto = {
        contenido: newComment.trim(),
        postId: post.id,
        userId: currentUser.uid,
      };

      const newCommentData = await postService.addComment(commentDto);
      
      // Actualizar el post en el estado del padre
      const updatedPost = {
        ...post,
        comentarios: [
          ...post.comentarios || [],
          newCommentData
        ]
      };
      onUpdatePost(updatedPost);
      
      setNewComment('');
      
      // Notificación de éxito
      setNotification({
        message: '¡Comentario publicado con éxito!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      // Notificación de error
      setNotification({
        message: 'No se pudo publicar el comentario. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 4 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {authorInitial}
          </Avatar>
        }
        action={
          /* Mostrar el menú de opciones solo si el usuario es autor o admin */
          (currentUser && (isAuthor || currentUser.roles?.includes(UserRole.ADMIN) || false)) ? (
            <IconButton aria-label="settings" onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          ) : null
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" fontWeight={500}>
              {authorName}
            </Typography>
            {authorRoles.map(role => (
              <Chip 
                key={role} 
                label={role} 
                size="small" 
                variant="outlined"
                color={role === 'organizador' ? 'primary' : 'default'}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        }
        subheader={
          <Tooltip 
            title={formattedDate}
            arrow
            placement="bottom-start"
          >
            <span className="date-help">{post.fechaRelativa || 'Hace un momento'}</span>
          </Tooltip>
        }
      />
    
      {/* Imagen de la publicación */}
      <CardMedia
        component="img"
        height="350"
        image={post.imagen}
        alt={post.descripcion.substring(0, 20)}
      />
      
      {/* Contenido del post */}
      <CardContent>
        <Typography variant="body1">
          {post.descripcion}
        </Typography>
      </CardContent>
      
      {/* Acciones (like, comentar) */}
      <CardActions sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid #ccc', mx: 1.5 }}>
          <IconButton 
            aria-label="like" 
            onClick={handleLikeToggle}
            disabled={likeLoading || !currentUser}
            sx={{ 
              width: '40%',
              borderRadius: 1,
              my: 1,
              '&:hover': {
                backgroundColor: 'action.hover', // Color de fondo al hacer hover
                '& .MuiTypography-root': {  // Esto selecciona el Typography hijo
                  color: 'primary.main'
                }
              }
            }}          
          >
            {likeLoading ? (
              <CircularProgress size={20} />
            ) : hasLiked ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                ml: 0.5,
                transition: 'color 0.2s ease-in-out'
              }} 
            >            
              Me gusta
            </Typography>
          </IconButton>

          <IconButton 
            aria-label="comentar" 
            onClick={handleCommentToggle}
            sx={{ 
              width: '40%',
              borderRadius: 1,
              my: 1,
              '&:hover': {
                backgroundColor: 'action.hover', // Color de fondo al hacer hover
                '& .MuiTypography-root': {  // Esto selecciona el Typography hijo
                  color: 'primary.main'
                }
              }
            }}            
          >
            <CommentIcon /> 
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                ml: 0.5,
                transition: 'color 0.2s ease-in-out'
              }} 
            >
              Comentar
            </Typography>
          </IconButton>
        </Box>
      </CardActions>
      
      {/* Sección de comentarios (condicional) */}
      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Comentarios existentes */}
          <Box sx={{ mb: 2 }}>
            {post.comentarios && post.comentarios.length > 0 ? (
              post.comentarios.map((comment) => (
                <Box key={comment.id} sx={{ mb: 1.5 }}>
                  <Box display="flex" gap={1}>
                    <Avatar sx={{ width: 30, height: 30 }}>
                      {comment.autor?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {comment.autor?.nombre || 'Usuario'}
                        </Typography>
                        {comment.autor?.roles?.map(role => (
                          <Chip 
                            key={role} 
                            label={role} 
                            size="small" 
                            variant="outlined"
                            color={role === 'organizador' ? 'primary' : 'default'}
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2">{comment.contenido}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.fechaRelativa}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                No hay comentarios aún. ¡Sé el primero en comentar!
              </Typography>
            )}
          </Box>
          
          {/* Formulario para nuevo comentario */}
          {currentUser && (
            <Box display="flex" gap={1} alignItems="flex-start">
              <Avatar sx={{ width: 35, height: 35 }}>
                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box flexGrow={1}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  helperText="Presiona Enter para enviar tu comentario o haz clic en el botón"
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        size="small" 
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !newComment.trim()}
                        title="Enviar comentario"
                      >
                        {submittingComment ? <CircularProgress size={20} /> : <SendIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
      
      {/* Menú de opciones para el autor o administrador */}
      <Menu
        id="post-options-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEditPost}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleOpenConfirmDialog}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
          
      {/* Diálogo de confirmación para eliminar post */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Eliminar publicación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeletePost} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Formulario de edición */}
      <EditPostForm 
        post={post}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onPostUpdated={handlePostUpdated}
      />
      
      {/* Notificación de éxito/error */}
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={5000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key={notification?.message} // Asegura que se vuelva a renderizar cuando cambie el mensaje
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type || 'success'} 
          sx={{ width: '100%' }}
          variant="filled"
          elevation={6}
        >
          {notification?.message || ''}
        </Alert>
      </Snackbar>
    </Card>
)};
