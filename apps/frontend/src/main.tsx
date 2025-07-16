import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from '@frontend/shared/context/AuthContext';
import App from './app/App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5A2BE5',      // Púrpura principal
      light: '#7D55FF',     // Versión más clara
      dark: '#3D00B3',      // Versión más oscura
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B6B',      // Coral para acentos
      light: '#FF8E8E',
      dark: '#E64A4A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF4D4F',      // Rojo para errores
    },
    warning: {
      main: '#FAAD14',      // Amarillo para advertencias
    },
    info: {
      main: '#1890FF',      // Azul para información
    },
    success: {
      main: '#52C41A',      // Verde para éxito
    },
    background: {
      default: '#F8F9FA',   // Fondo general ligeramente grisáceo
      paper: '#FFFFFF',     // Fondo blanco para tarjetas
    },
    text: {
      primary: '#1A1A1A',   // Casi negro para texto principal
      secondary: '#595959', // Gris oscuro para texto secundario
      disabled: '#BFBFBF',  // Gris para texto deshabilitado
    },
    grey: {
      50: '#FAFAFA',       // Fondo muy claro
      100: '#F5F5F5',      // Fondo claro
      200: '#EEEEEE',      // Bordes y separadores
      300: '#E0E0E0',      // Hover sobre elementos
      400: '#BDBDBD',      // Texto deshabilitado
      500: '#9E9E9E',      // Texto secundario
      600: '#757575',      // Texto secundario oscuro
      700: '#424242',      // Texto casi negro
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
    h1: { 
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: { 
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h3: { 
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h4: { 
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h5: { 
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h6: { 
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.3333,
      color: '#050505'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 8,  // Bordes redondeados estándar de Facebook
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          fontSize: '0.9375rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#5A2BE5',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#3D00B3',
            boxShadow: '0 4px 12px rgba(90, 43, 229, 0.2)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#E0E0E0',
            color: '#9E9E9E',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
          '&:hover': {
            backgroundColor: 'rgba(90, 43, 229, 0.05)',
            borderColor: '#5A2BE5',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(90, 43, 229, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #EEEEEE',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #EEEEEE',
          padding: '8px 0',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 0 2px rgba(90, 43, 229, 0.2)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5A2BE5',
              borderWidth: '1px',
            },
          },
          '&:hover:not(.Mui-focused)': {
            backgroundColor: '#EEEEEE',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E0E0E0',
            },
          },
        },
        input: {
          padding: '10px 14px',
          '&::placeholder': {
            color: '#9E9E9E',
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'transparent',
          transition: 'border-color 0.2s ease-in-out',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#595959',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(90, 43, 229, 0.1)',
            color: '#5A2BE5',
          },
        },
      },
    },
  },
});

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
