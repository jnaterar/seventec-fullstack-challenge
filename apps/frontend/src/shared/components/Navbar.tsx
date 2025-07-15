import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Box,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { useAuth } from '@/shared/context/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      handleClose();
      await logout();
      // La navegación se maneja en el AuthContext después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: '#5A2BE5',
            fontWeight: 700,
            fontSize: '1.8rem',
            letterSpacing: '-0.5px',
            fontFamily: '"Poppins", "Segoe UI", Roboto, sans-serif',
            '&:hover': {
              opacity: 0.9,
              '& .logo-circle': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(90, 43, 229, 0.3)'
              }
            },
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Box 
            className="logo-circle"
            component="span" 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#5A2BE5',
              background: 'linear-gradient(135deg, #5A2BE5 0%, #8A2BE2 100%)',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              mr: 0.2,
              transition: 'all 0.3s ease-in-out',
              boxShadow: '0 2px 8px rgba(90, 43, 229, 0.2)'
            }}
          >
            C
          </Box>
          onvention App
        </Typography>

        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Cuenta">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'inherit'
                  }
                }}
              >
                <Box 
                  className="logo-circle"
                  component="span" 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    padding: '10px',
                    bgcolor: '#5A2BE5',
                    background: 'linear-gradient(135deg, #5A2BE5 0%, #8A2BE2 100%)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease-in-out',
                  }}
                >                
                  <Avatar 
                    alt={currentUser.displayName || 'Usuario'} 
                    src={currentUser.photoURL || ''}
                    sx={{ width: 30, height: 30, mx: 0.5 }}
                  />
                </Box>              
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              slotProps={{
                list: {
                  sx: {
                    width: '250px',
                    minWidth: '250px'
                  }
                }
              }}
            >
              <MenuItem>{currentUser.displayName}</MenuItem>
              <Divider/>
              <MenuItem 
                component={RouterLink} 
                to="/profile"
                onClick={handleClose}
              >
                Mi Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <Box display="flex" alignItems="center" width="100%">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Cerrando sesión...
                  </Box>
                ) : 'Cerrar sesión'}
              </MenuItem>
            </Menu>
          </Box>
        ) : !loading && (
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{ mr: 1 }}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              component={RouterLink} 
              to="/signup"
              sx={{ 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)'
                }
              }}
            >
              Registrarse
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
