import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export const PublicRoute = ({ restricted = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (currentUser && restricted) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
