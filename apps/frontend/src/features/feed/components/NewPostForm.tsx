import React, { useState } from 'react';
import { 
  Box, Card, CardContent, TextField, Button, CircularProgress, 
  Typography, IconButton, FormControl, InputLabel, MenuItem, 
  Select, FormHelperText, Avatar, Snackbar, Alert
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { PostType, CreatePostDto } from '../types/post.types';
import { postService } from '../services/post.service';
import { useAuth } from '../../../shared/context/AuthContext';
import { UserRole } from '@shared/enums/user-role.enum';

type NewPostFormProps = {
  onPostCreated: () => void;
  isVisible?: boolean;
};

export const NewPostForm: React.FC<NewPostFormProps> = ({ onPostCreated, isVisible = true }) => {
  // Si no es visible, no renderizar nada
  if (!isVisible) return null;
  const { currentUser } = useAuth();
  const [imagen, setImagen] = useState<string>('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<PostType>(PostType.NORMAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Verificar si el usuario tiene permisos para crear publicaciones
  // Los usuarios pueden ser ORGANIZADOR o ADMINISTRADOR
  const canCreatePosts = currentUser && (
    currentUser.roles?.includes(UserRole.ORGANIZER) ||
    currentUser.roles?.includes(UserRole.ADMIN)
  );
  
  // Si no tiene permisos, mostrar mensaje
  if (!canCreatePosts) {
    return (
      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Solo los organizadores pueden crear publicaciones
        </Typography>
      </Card>
    );
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagen(e.target.value);
    setError('');
  };

  const handleClearImage = () => {
    setImagen('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!imagen) {
      setError('La imagen es requerida');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const postData: CreatePostDto = {
        imagen,
        descripcion,
        userId: currentUser.uid,
        tipo
      };
      
      await postService.createPost(postData);
      
      // Limpiar el formulario
      setImagen('');
      setDescripcion('');
      setTipo(PostType.NORMAL);
      setError('');
      
      // Mostrar notificación de éxito
      setNotification({
        message: 'Publicación creada con éxito. Se enviaron notificaciones a los participantes.',
        type: 'success'
      });
      
      // Notificar al componente padre después de un breve retraso para ver la notificación
      setTimeout(() => {
        onPostCreated();
      }, 1500);
      
    } catch (error) {
      console.error('Error al crear publicación:', error);
      setError('No se pudo crear la publicación');
      setNotification({
        message: 'Error al crear la publicación. Inténtalo de nuevo.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }} elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ mr: 2, bgcolor: 'primary.main' }}
          >
            {currentUser?.displayName?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="h6">Crear nueva publicación</Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Selector de tipo de publicación */}
          <FormControl fullWidth variant="outlined" margin="normal" size="small">
            <InputLabel id="post-type-label">Tipo de publicación</InputLabel>
            <Select
              labelId="post-type-label"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as PostType)}
              label="Tipo de publicación"
            >
              <MenuItem value={PostType.NORMAL}>Normal (permanente)</MenuItem>
              <MenuItem value={PostType.STORY}>Historia (24 horas)</MenuItem>
            </Select>
            <FormHelperText>
              {tipo === PostType.STORY 
                ? 'Las historias son visibles por 24 horas' 
                : 'Las publicaciones normales no caducan'}
            </FormHelperText>
          </FormControl>
          
          {/* Campo para descripción */}
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="¿Qué quieres compartir?"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            margin="normal"
          />
          
          {/* Campo para URL de imagen */}
          <TextField
            fullWidth
            variant="outlined"
            label="URL de la imagen"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imagen}
            onChange={handleImageUrlChange}
            margin="normal"
            InputProps={{
              startAdornment: <ImageIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: imagen ? (
                <IconButton size="small" onClick={handleClearImage}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null
            }}
            helperText="Ingresa la URL de una imagen almacenada en Storage"
          />
          
          {/* Vista previa de imagen (solo si hay una URL) */}
          {imagen && (
            <Box 
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 2,
                mt: 1,
                position: 'relative',
                minHeight: '100px',
                maxHeight: '250px',
                overflow: 'hidden',
                textAlign: 'center'
              }}
            >
              <Box 
                component="img" 
                src={imagen} 
                alt="Vista previa" 
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: '230px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} 
                onError={(e) => {
                  // Mostrar imagen de error si la URL no es válida
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error+al+cargar+imagen';
                }}
              />
            </Box>
          )}
          
          {/* Nota sobre notificaciones push */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'info.light', 
            color: 'info.contrastText',
            borderRadius: 1,
            p: 1.5,
            mb: 2,
            mt: 1 
          }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Al crear una publicación, se enviará automáticamente una notificación push a todos los usuarios con rol de participante.
            </Typography>
          </Box>

          {/* Botón de enviar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mr: 2, alignSelf: 'center' }}>
                {error}
              </Typography>
            )}
            <Button 
              variant="contained" 
              color="primary"
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </Box>
        </Box>
        
        {/* Notificación de éxito/error */}
        <Snackbar 
          open={notification !== null} 
          autoHideDuration={6000} 
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification?.type || 'success'} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {notification?.message || ''}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};
