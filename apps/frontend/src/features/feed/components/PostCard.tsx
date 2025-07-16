import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardContent, CardActions, CardMedia, Typography, Avatar, IconButton, Box, TextField,
  Chip, Tooltip, Divider, Menu, MenuItem, CircularProgress, Button, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, Snackbar, Alert, List, ListItem, ListItemAvatar, ListItemText, Grid
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Post, CreateCommentDto } from '@frontend/features/feed/types/post.types';
import { postService } from '@frontend/features/feed/services/post.service';
import { useAuth } from '@frontend/shared/context/AuthContext';
import { EditPostForm } from '@frontend/features/feed/components/EditPostForm';
import { UserRole } from '@enums';
import { logger } from '@frontend/shared/utils/logger';

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
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesList, setLikesList] = useState<{id: string; nombre: string}[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);

  // Fecha formateada para el tooltip
  const [formattedDate, setFormattedDate] = useState<string>('Fecha no disponible');
  // Determinar si el usuario loggeado ha dado like
  // Efecto para mantener sincronizado el estado con los datos del post
  useEffect(() => {
    // Actualizar el estado local basado en la propiedad userHasLiked del post
    setHasLiked(post.userHasLiked || false);
    // Actualizar el contador de likes basado en el array de likes
    setLikesCount(Array.isArray(post.likes) ? post.likes.length : 0);
  }, [post.userHasLiked, post.likes]);
  
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
        logger.error('Error formateando fecha:', error);
        setFormattedDate('Fecha no disponible');
      }
    };
    
    formatPostDate();
  }, [post]);  // Recalcula cuando el post cambia
  
  const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : 0);
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
      logger.error('Error al eliminar la publicación:', error);
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
      // Llamamos al servicio para actualizar el like en el backend
      await postService.toggleLike(post.id, currentUser.uid);
      const newLikedState = !hasLiked;
      setHasLiked(newLikedState);
      
      // Actualizamos los likes localmente mientras se actualiza el backend
      let updatedLikes = [...(Array.isArray(post.likes) ? post.likes : [])];
      
      if (newLikedState) {
        // Agregar el usuario actual a la lista de likes si no existe
        if (!updatedLikes.some(like => like.id === currentUser.uid)) {
          updatedLikes.push({
            id: currentUser.uid,
            nombre: currentUser.displayName || 'Usuario'
          });
        }
      } else {
        // Remover el usuario actual de la lista de likes
        updatedLikes = updatedLikes.filter(like => like.id !== currentUser.uid);
      }
      
      // Actualizar contador local
      setLikesCount(updatedLikes.length);
      
      // Actualizar el post en el padre
      onUpdatePost({
        ...post,
        likes: updatedLikes,
        userHasLiked: newLikedState
      });
    } catch (error) {
      logger.error('Error al gestionar like:', error);
      // Restaurar estado anterior en caso de error
      setHasLiked(!hasLiked);
    } finally {
      setLikeLoading(false);
    }
  };

  // Manejo de comentarios
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };
  
  // Declaración de estados locales para contador de comentarios
  const [commentsCount, setCommentsCount] = useState(Array.isArray(post.comentarios) ? post.comentarios.length : 0);

  // Efecto para actualizar el contador de comentarios cuando cambia el post
  useEffect(() => {
    setCommentsCount(Array.isArray(post.comentarios) ? post.comentarios.length : 0);
  }, [post.comentarios]);

  // Calcular número de comentarios
  // const commentsCount = post.comentarios?.length || 0;
  
  // Función para abrir modal de likes
  const handleOpenLikesModal = async () => {
    if (!Array.isArray(post.likes) || post.likes.length === 0) return; // No abrir si no hay likes
    
    setLikesLoading(true);
    setLikesModalOpen(true);
    
    try {
      // Ahora usamos directamente el array de likes que viene con el post
      setLikesList(post.likes);
    } catch (error) {
      logger.error('Error al cargar lista de likes:', error);
      setNotification({
        message: 'No se pudo cargar la lista de usuarios',
        type: 'error'
      });
    } finally {
      setLikesLoading(false);
    }
  };
  
  // Función para cerrar modal de likes
  const handleCloseLikesModal = () => {
    setLikesModalOpen(false);
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
      logger.error('Error al enviar comentario:', error);
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
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardHeader sx={{ paddingBottom: 0 }}
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

      {/* Contenido del post */}
      <CardContent sx={{ paddingY: 1.5 }}>
        <Typography variant="body1">
          {post.descripcion}
        </Typography>
      </CardContent>      

      <Divider />
    
      {/* Imagen de la publicación */}
      <CardMedia
        component="img"
        height="350"
        image={post.imagen}
        alt={post.descripcion.substring(0, 20)}
      />

      <Divider />

      {/* Contadores de likes y comentarios */}
      <Grid container sx={{ paddingX: 2, paddingY: 1 }}>
        <Grid size={{ xs: 6 }}>
          {likesCount > 0 && (
            <Tooltip title={hasLiked ? "A ti y a otras personas les gusta esto" : "Personas que les gusta esto"}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { color: 'error.main' } 
                }} 
                onClick={handleOpenLikesModal}
              >
                <FavoriteIcon color="error" fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                {likesCount} {likesCount === 1 ? 'persona' : 'personas'}
              </Typography>
            </Tooltip>
          )}          
        </Grid>
        <Grid size={{ xs: 6 }} display="flex" justifyContent="flex-end">
          <Tooltip title={showComments ? "Ocultar comentarios" : "Ver comentarios"}>
            <Typography 
              variant="body2" 
              color={showComments ? "primary.main" : "text.secondary"}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' } 
              }} 
              onClick={() => setShowComments(!showComments)}
            >
              <CommentIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  fontSize: '1rem',
                  color: showComments ? 'primary.main' : 'inherit'
                }} 
              />
              {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
            </Typography>
          </Tooltip>          
        </Grid>
      </Grid>    
      
      {/* Acciones (like, comentar) */}
      <CardActions sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid #ccc', mx: 1.5 }}>
          <IconButton 
            aria-label="Me gusta"
            onClick={handleLikeToggle}
            disabled={likeLoading || !currentUser}
            sx={{
              color: hasLiked ? 'error.main' : 'default',
              '&:hover': { color: hasLiked ? 'error.main' : 'error.light' }
            }}
          >
            {hasLiked ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
              <Typography 
                variant="body2" 
                color={hasLiked ? "error.main" : "text.secondary"}
                sx={{
                  transition: 'color 0.2s ease-in-out',
                  fontWeight: hasLiked ? 500 : 400
                }} 
              >            
                Me gusta
              </Typography>
              {likesCount > 0 && (
                <Chip 
                  size="small"
                  label={likesCount}
                  color={hasLiked ? "error" : "default"}
                  variant={hasLiked ? "filled" : "outlined"}
                  sx={{ 
                    height: 18, 
                    fontSize: '0.7rem', 
                    ml: 1,
                    fontWeight: 'bold',
                    minWidth: 28
                  }}
                />
              )}
            </Box>
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
            <CommentIcon color={showComments ? "primary" : "inherit"} /> 
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
              <Typography 
                variant="body2" 
                color={showComments ? "primary" : "text.secondary"} 
                sx={{
                  transition: 'color 0.2s ease-in-out'
                }} 
              >
                Comentar
              </Typography>
              {commentsCount > 0 && (
                <Chip 
                  size="small"
                  label={commentsCount}
                  color={showComments ? "primary" : "default"}
                  variant={showComments ? "filled" : "outlined"}
                  sx={{ 
                    height: 18, 
                    fontSize: '0.7rem', 
                    ml: 1,
                    fontWeight: 'bold',
                    minWidth: 28
                  }}
                />
              )}
            </Box>
          </IconButton>
        </Box>
      </CardActions>
      
      {/* Sección de comentarios (condicional) */}
      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Encabezado de comentarios */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
              Comentarios ({commentsCount})
            </Typography>
          </Box>
          
          {/* Comentarios existentes */}
          <Box sx={{ mb: 2 }}>
            {post.comentarios && post.comentarios.length > 0 ? (
              post.comentarios.map((comment) => (
                <Box key={comment.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Box display="flex" gap={1}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light' }}>
                      {comment.autor?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
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
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {comment.fechaRelativa}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {comment.contenido}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <CommentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Formulario para nuevo comentario */}
          {currentUser && (
            <Box display="flex" gap={1} alignItems="flex-start" sx={{ mt: 2 }}>
              <Avatar sx={{ width: 35, height: 35, bgcolor: 'primary.main' }}>
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
                  helperText={submittingComment ? "Enviando comentario..." : "Presiona Enter para enviar tu comentario"}
                  FormHelperTextProps={{
                    sx: { fontStyle: 'italic', fontSize: '0.7rem' }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        size="small" 
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !newComment.trim()}
                        title="Enviar comentario"
                        color="primary"
                      >
                        {submittingComment ? <CircularProgress size={20} /> : <SendIcon />}
                      </IconButton>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disablePortal
        sx={{
          zIndex: (theme) => theme.zIndex.tooltip + 50,
          '& .MuiPaper-root': {
            transform: 'translateX(-20px) !important'
          }
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
              minWidth: '200px',
              width: '200px',
              borderRadius: '8px 0 8px 8px',
              overflow: 'visible',
              position: 'relative',
              right: 0,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -8,
                right: 0,
                width: '16px',
                height: '16px',
                backgroundColor: '#ffffff',
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                zIndex: 1
              }
            }
          }
        }}
      >
        <MenuItem onClick={handleEditPost}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <Divider sx={{ my: 0 }} />
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
      {/* Modal para mostrar usuarios que dieron like */}
      <Dialog
        open={likesModalOpen}
        onClose={handleCloseLikesModal}
        aria-labelledby="likes-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="likes-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon color="error" />
            <Typography variant="h6">Personas que les gusta</Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={handleCloseLikesModal} aria-label="cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {likesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : likesList.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {likesList.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.nombre.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.nombre} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No se pudieron cargar los datos
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
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
