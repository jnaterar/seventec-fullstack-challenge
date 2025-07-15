import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


import {
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { userService, type UserProfile } from '../services/userService';
import { useAuth } from '@/shared/context/AuthContext';
import { UserRole } from '@/config/api';

const ALLERGY_PLACEHOLDER = 'Introduce alergia y presiona +';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  // Para evitar doble carga en modo Strict de React 18
  const fetchedRef = useRef(false);



  // Cargar perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el perfil');
      } finally {
        setProfileLoading(false);
      }
    };
    if (currentUser && !fetchedRef.current) {
      fetchedRef.current = true;
      loadProfile();
    }
  }, [currentUser]);

  const handleFieldChange = (field: keyof UserProfile) => (e: any) => {
    setProfile(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setProfile(prev => ({
      ...prev,
      alergias: [...(prev.alergias || []), newAllergy.trim()],
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      alergias: (prev.alergias || []).filter(a => a !== allergy),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await userService.updateProfile({
        nombre: profile.nombre!,
        alergias: profile.alergias || [],
        roles: profile.roles || [],
      });
      setProfile(updated);
      setSuccess('¡Perfil actualizado con éxito!');
      // Limpiar el mensaje de error si existía
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al actualizar el perfil');
      // Limpiar mensaje de éxito si existía
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      maxWidth={700} 
      mx="auto" 
      sx={{
        mt: 3,
        p: 3, 
        borderRadius: 2, 
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)', 
        bgcolor: 'background.paper'
      }}
    >
      {/* Encabezado con botón de regresar */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={3}
        pb={2}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="h4" component="h1" fontWeight="500" color="primary.main">
          Mi Perfil
        </Typography>
        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          color="primary"
          variant="contained"
          size="small"
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }
          }}
        >
          Volver al inicio
        </Button>
      </Box>

      {/* Snackbar para mensaje de éxito */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key="success-notification"
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar para mensaje de error */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key="error-notification"
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <form onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'grid', gap: 4, width: '100%' }}>
          {/* Sección de información básica */}
          <Box sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.02)', 
            p: 3, 
            borderRadius: 2,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
          }}>
            <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
              Información Personal
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 3, width: '100%' }}>
              <TextField
                label="Nombre"
                fullWidth
                value={profile.nombre || ''}
                onChange={handleFieldChange('nombre')}
                required
                variant="outlined"
                helperText="Tu nombre completo como deseas que aparezca en la plataforma"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />

              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  value={profile.roles?.[0] ?? ''}
                  label="Rol"
                  onChange={e => setProfile(prev => ({ ...prev, roles: [e.target.value as UserRole] }))}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="" disabled>Seleccione</MenuItem>
                  
                  {Object.entries(UserRole).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1.5 }}>
                  Selecciona tu rol en el sistema (organizador o participante). Esto determinará qué acciones puedes realizar en la plataforma.
                </Typography>
              </FormControl>
            </Box>
          </Box>

          {/* Sección de alergias */}
          <Box sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.02)', 
            p: 3, 
            borderRadius: 2,
            borderLeft: '4px solid',
            borderColor: 'primary.main'
          }}>
            <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
              Información de Alergias
            </Typography>
            
            <Box display="flex" gap={1} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                label="Nueva alergia"
                placeholder={ALLERGY_PLACEHOLDER}
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                fullWidth
                variant="outlined"
                helperText="Especifica cualquier alergia alimentaria que tengas (ej: nueces, mariscos, lactosa)"
              />
              <IconButton 
                color="primary"
                onClick={handleAddAllergy} 
                aria-label="add allergy"
                sx={{ 
                  height: 40,
                  width: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.25rem'
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {(profile.alergias || []).length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(profile.alergias || []).map(al => (
                    <Chip
                      key={al}
                      label={al}
                      onDelete={() => handleRemoveAllergy(al)}
                      deleteIcon={<DeleteIcon />}
                      sx={{ 
                        borderRadius: 1.5, 
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.default' },
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No has agregado alergias a tu perfil
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={saving}
              size="large"
              sx={{ 
                px: 4, 
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                '&:hover': { boxShadow: '0 6px 15px rgba(0,0,0,0.2)' }
              }}
            >
              {saving ? <CircularProgress size={24} /> : 'Guardar cambios'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default UserProfile;
