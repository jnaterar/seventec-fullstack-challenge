import { Container, Typography, Box } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/shared/components/ProtectedRoute';
import Navbar from '@/shared/components/Navbar';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';

export function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, sm: 3 } }}>
        <Container maxWidth="lg">
          <Routes>
            {/* Rutas públicas */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Ruta protegida */}
            <Route element={<ProtectedRoute />}>
              <Route index element={
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    Bienvenido a Convention App
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
    </Box>
  );
}

export default App;
