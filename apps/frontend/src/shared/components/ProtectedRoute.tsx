import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  roles?: string[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!currentUser) {
    // Guardar la ubicación actual para redirigir después del login
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(from)}`} replace />;
  }

  // Verificar roles si se especifican
  if (roles && roles.length > 0) {
    const hasRequiredRole = currentUser.roles?.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5" color="error" gutterBottom>
            Acceso denegado
          </Typography>
          <Typography variant="body1">
            No tienes los permisos necesarios para acceder a esta página.
          </Typography>
        </Box>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

interface PublicRouteProps {
  restricted?: boolean;
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ restricted = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si el usuario está autenticado y la ruta es restringida, redirigir al home
  if (currentUser && restricted) {
    // Intentar redirigir a la ruta guardada o al home
    const from = new URLSearchParams(location.search).get('redirect');
    return <Navigate to={from || '/'} replace />;
  }

  return <Outlet />;
};
