import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@frontend/shared/utils/logger';
import { useAuth } from '@frontend/shared/context/AuthContext';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container, 
  Link as MuiLink,
  Alert,
  CircularProgress
} from '@mui/material';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormError('');
      await login(email, password);
      // La redirección ahora se maneja en el AuthContext después de un inicio de sesión exitoso
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'No se pudo iniciar sesión. Verifica tus credenciales.';
      setFormError(errorMessage);
      logger.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Iniciar sesión
        </Typography>
        
        {formError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {formError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            helperText="Ingresa el correo con el que te registraste"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Ingresa tu contraseña personal"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink component={Link} to="/forgot-password" variant="body2">
              ¿Olvidaste tu contraseña?
            </MuiLink>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿No tienes una cuenta?{' '}
              <MuiLink component={Link} to="/signup" variant="body2">
                Regístrate
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
