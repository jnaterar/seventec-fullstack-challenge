import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/shared/components/ProtectedRoute';
import { useAuth } from '@/shared/context/AuthContext';
import Navbar from '@/shared/components/Navbar';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';
import { useEffect } from 'react';

// Componente para mostrar mientras se verifica la autenticación
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return <>{children}</>;
};

export function App() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Verificar autenticación en cada cambio de ruta
  useEffect(() => {
    // Aquí podrías verificar el token con el servidor si es necesario
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AuthCheck>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, sm: 3 } }}>
          <Container maxWidth="lg">
            <Routes>
              {/* Rutas públicas - solo accesibles para usuarios no autenticados */}
              <Route element={<PublicRoute restricted />}>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Rutas protegidas - solo accesibles para usuarios autenticados */}
              <Route element={<ProtectedRoute />}>
                <Route index element={
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                      {currentUser ? `Bienvenido, ${currentUser.displayName || 'Usuario'}` : 'Bienvenido a Convention App'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Comienza a explorar las publicaciones o comparte algo nuevo.
                    </Typography>
                    {/* Aquí irá el feed de publicaciones */}
                  </Box>
                } />
                <Route path="/profile" element={
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                      Mi Perfil
                    </Typography>
                    {/* Aquí irá el perfil del usuario */}
                  </Box>
                } />
                
                {/* Ejemplo de ruta con roles específicos */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}>
                    <Box>
                      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                        Panel de Administración
                      </Typography>
                      {/* Contenido del panel de administración */}
                    </Box>
                  </ProtectedRoute>
                } />
              </Route>

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      
        {/* Footer */}
        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Convention App. Todos los derechos reservados.
            </Typography>
          </Container>
        </Box>
      </AuthCheck>
    </Box>
  );
}

export default App;
