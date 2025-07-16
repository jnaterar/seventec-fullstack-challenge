import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  CircularProgress,
  Snackbar
} from '@mui/material';

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, nombre);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`¡Bienvenido ${nombre}! Tu cuenta ha sido creada con éxito.`);
      setSuccess(true);
      
      // Esperar un momento para que el usuario vea el mensaje antes de redirigir
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError('Error al crear la cuenta. Intenta de nuevo.');
      logger.error('Error al registrarse:', error);
    } finally {
      setLoading(false);
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
          Crear Cuenta
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Notificación de éxito */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
            variant="filled"
            elevation={6}
          >
            {successMessage}
          </Alert>
        </Snackbar>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre Completo"
            name="nombre"
            autoComplete="name"
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            helperText="Ingresa tu nombre y apellido"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Formato: ejemplo@dominio.com"
            type="email"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Mínimo 6 caracteres"
            error={password.length > 0 && password.length < 6}
            inputProps={{ minLength: 6 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            helperText="Debe coincidir exactamente con la contraseña anterior"
            error={confirmPassword !== "" && password !== confirmPassword}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrarse'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿Ya tienes una cuenta?{' '}
              <MuiLink component={Link} to="/login" variant="body2">
                Inicia sesión
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupForm;
