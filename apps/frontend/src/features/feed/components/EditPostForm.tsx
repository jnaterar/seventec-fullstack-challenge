import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, CircularProgress, 
  Typography, IconButton, FormControl, InputLabel, MenuItem, 
  Select, FormHelperText, Dialog, DialogActions, DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { PostType, Post } from '../types/post.types';
import { postService } from '../services/post.service';
import { useAuth } from '../../../shared/context/AuthContext';

type EditPostFormProps = {
  post: Post;
  open: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
};

export const EditPostForm: React.FC<EditPostFormProps> = ({ 
  post, 
  open, 
  onClose, 
  onPostUpdated
}) => {
  const { currentUser } = useAuth();
  const [imagen, setImagen] = useState<string>(post.imagen || '');
  const [descripcion, setDescripcion] = useState(post.descripcion || '');
  const [tipo, setTipo] = useState<PostType>(post.tipo || PostType.NORMAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Actualizar los campos cuando cambia el post
  useEffect(() => {
    setImagen(post.imagen || '');
    setDescripcion(post.descripcion || '');
    setTipo(post.tipo || PostType.NORMAL);
    setError('');
  }, [post]);

  // Verificar si el usuario tiene permisos para editar esta publicación
  const canEditPost = currentUser && (
    currentUser.uid === post.userId || 
    currentUser.roles?.includes('admin') ||
    currentUser.roles?.includes('organizador')
  );

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagen(e.target.value);
    setError('');
  };

  const handleClearImage = () => {
    setImagen('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !canEditPost) return;
    
    if (!imagen) {
      setError('La imagen es requerida');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // No incluimos el tipo de publicación en la actualización, lo mantenemos igual al original
      const updatedPostData = {
        imagen,
        descripcion,
        // tipo se mantiene igual al original (no se permite modificar)
        // La fecha de edición se actualizará automáticamente en el backend
      };
      
      const updatedPost = await postService.updatePost(post.id, updatedPostData);
      
      onPostUpdated(updatedPost);
      onClose();
      
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      setError('No se pudo actualizar la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEditPost) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Editar publicación</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Tipo de publicación (sólo lectura) */}
          <FormControl fullWidth variant="outlined" margin="normal" size="small" disabled>
            <InputLabel id="post-type-label">Tipo de publicación</InputLabel>
            <Select
              labelId="post-type-label"
              id="post-type"
              value={tipo}
              label="Tipo de publicación"
              readOnly
            >
              <MenuItem value={PostType.NORMAL}>Normal</MenuItem>
              <MenuItem value={PostType.STORY}>Story</MenuItem>
            </Select>
            <FormHelperText>El tipo de publicación no se puede cambiar durante la edición</FormHelperText>
          </FormControl>
          
          {/* Campo para descripción */}
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="¿Qué quieres compartir?"
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            margin="normal"
            helperText="Modifica la descripción de tu publicación. Los cambios no generarán nuevas notificaciones."
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
            helperText="Ingresa la URL completa de una nueva imagen si deseas cambiarla (https://...)"
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
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
