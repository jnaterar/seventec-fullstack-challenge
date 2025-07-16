import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { ProtectedRoute, PublicRoute } from '@frontend/shared/components/ProtectedRoute';
import { useAuth } from '@frontend/shared/context/AuthContext';
import Navbar from '@frontend/shared/components/Navbar';
import { logger } from '@frontend/shared/utils/logger';
import { LoginForm } from '@frontend/features/auth/components/LoginForm';
import { SignupForm } from '@frontend/features/auth/components/SignupForm';
import { ForgotPassword } from '@frontend/features/auth/components/ForgotPassword';
import UserProfile from '@frontend/features/profile/components/UserProfile';
import { Feed } from '@frontend/features/feed';
import { NotificationService } from '@frontend/services/notifications.service';

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
  const { currentUser } = useAuth();

  // Efecto para inicialización única
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      if (!currentUser) return;
      
      logger.log('Inicializando servicio de notificaciones para el usuario:', currentUser.email);
      
      try {
        const notificationService = NotificationService.getInstance();
        const success = await notificationService.requestPermissionAndRegisterToken();
        
        if (isMounted) {
          if (success) {
            logger.log('Token FCM registrado exitosamente');
          } else {
            logger.warn('No se pudo registrar el token FCM');
          }
        }
      } catch (error) {
        logger.error('Error al registrar token FCM:', error);
      }
    };
    
    initializeApp();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]); // Solo dependemos del email del usuario

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AuthCheck>
        {/* Navbar */}
        <Navbar />
        
        {/* Contenido principal */}
        <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 }, mt: '64px' }}>
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
