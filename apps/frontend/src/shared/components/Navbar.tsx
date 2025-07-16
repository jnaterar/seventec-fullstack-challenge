import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Person as PersonIcon, ExitToApp as LogoutIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useAuth } from '@frontend/shared/context/AuthContext';
import { logger } from '@frontend/shared/utils/logger';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleToggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null); // Cerrar si ya estaba abierto
    } else {
      setAnchorEl(event.currentTarget); // Abrir si estaba cerrado
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      handleCloseMenu();
    }
  };

  return (
    <AppBar position="fixed" sx={{ height: '60px', justifyContent: 'center' }}>
      <Toolbar sx={{ minHeight: '60px' }}>
        {/* Logo del sitio web */}
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

        {/* Botones de la cuenta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentUser ? (
            <>
              {/* Avatar de la cuenta */}
              <Tooltip title="Cuenta">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleToggleMenu}
                  color="inherit"
                  sx={{ padding: 0 }}
                >
                  <Avatar 
                    alt={currentUser.displayName || 'Usuario'}
                    src={currentUser.photoURL || ''}
                    sx={{ width: 36, height: 36 }}
                  >
                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Menu de la cuenta */}
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    transform: 'translateY(-8px) !important',
                  }
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
                      minWidth: '200px',
                      width: '200px',
                      borderRadius: '8px 8px 8px 8px',
                      overflow: 'visible',
                      position: 'relative',
                      right: 0
                    }
                  }
                }}                
              >
                <MenuItem disabled>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{currentUser?.displayName || 'Usuario'}</ListItemText>
                </MenuItem>
                <Divider/>
                {currentUser?.roles?.includes('admin') && (
                  <MenuItem onClick={() => {
                    navigate('/admin');
                    handleCloseMenu();
                  }}>
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Panel de Administración</ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={() => {
                  navigate('/profile');
                  handleCloseMenu();
                }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mi Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <ListItemIcon>
                    {isLoggingOut ? (
                      <CircularProgress size={20} />
                    ) : (
                      <LogoutIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                  </ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Boton de iniciar sesion */}
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ textTransform: 'none' }}
              >
                Iniciar Sesión
              </Button>

              {/* Boton de registrarse */}
              <Button 
                variant="contained" 
                color="secondary" 
                component={RouterLink} 
                to="/register"
                sx={{ textTransform: 'none' }}
              >
                Registrarse
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
