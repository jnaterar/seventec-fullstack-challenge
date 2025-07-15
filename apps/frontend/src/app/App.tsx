import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/shared/components/ProtectedRoute';
import { useAuth } from '@/shared/context/AuthContext';
import Navbar from '@/shared/components/Navbar';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';
import UserProfile from '@/features/profile/components/UserProfile';
import { Feed } from '@/features/feed';
import { useEffect } from 'react';
import { NotificationService } from '@/services/notifications.service';

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
  const location = useLocation();
  const { currentUser } = useAuth();

  // Verificar autenticación en cada cambio de ruta
  useEffect(() => {
    // Aquí podrías verificar el token con el servidor si es necesario
  }, [location.pathname]);
  
  // Inicializar el servicio de notificaciones cuando el usuario esté autenticado
  useEffect(() => {
    if (currentUser) {
      console.log('Inicializando servicio de notificaciones para el usuario:', currentUser.email);
      // Inicializar el servicio de notificaciones y solicitar permisos
      const notificationService = NotificationService.getInstance();
      notificationService.requestPermissionAndRegisterToken()
        .then(success => {
          if (success) {
            console.log('Token FCM registrado exitosamente');
          } else {
            console.warn('No se pudo registrar el token FCM');
          }
        })
        .catch(error => console.error('Error al registrar token FCM:', error));
    }
  }, [currentUser]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AuthCheck>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, sm: 3 }, mt: '64px' }}>
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
                <Route index element={<Feed />} />
                <Route path="/profile" element={<UserProfile />} />
                
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
