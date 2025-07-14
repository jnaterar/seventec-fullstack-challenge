import axios from 'axios';

// Crear instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    // No añadir el token a las rutas de autenticación
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verificar si el token está a punto de expirar (opcional)
      // Aquí podrías implementar la lógica para refrescar el token si es necesario
      
      // Añadir el token al encabezado de autorización
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 o 403 (no autorizado/forbidden) y no es una solicitud de login
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      // Evitar bucles de redirección
      if (window.location.pathname.includes('/login')) {
        return Promise.reject(error);
      }
      
      // Limpiar el estado de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login con la ruta actual
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
