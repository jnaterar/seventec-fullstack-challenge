import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import { getAuthInstance as getFirebaseAuth } from '@frontend/config/firebase-config';
import { API_ENDPOINTS } from '@frontend/config/api';
import { logger } from '@frontend/shared/utils/logger'; 

// Variable para almacenar la instancia de autenticación
let authInstance: Auth | null = null;

// Función para obtener la instancia de autenticación
const initializeAuth = async (): Promise<Auth> => {
  if (!authInstance) {
    authInstance = await getFirebaseAuth();
  }
  return authInstance;
};

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  roles?: string[];
  token?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAuthHeader: () => { Authorization: string } | {};
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [_, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    // Inicializar autenticación
    const initAuth = async () => {
      try {
        authInstance = await initializeAuth();
        setAuthInitialized(true);
      } catch (error) {
        logger.error('Error al inicializar autenticación:', error);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    if (!authInstance) return;
    
    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        
        // Recuperar los roles almacenados si existen
        let savedRoles: string[] = [];
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            savedRoles = userData.roles || [];
          } catch (e) {
            logger.error('Error al recuperar roles guardados:', e);
          }
        }
        
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          roles: savedRoles // Usar los roles almacenados
        };
        setUser(user);
        setCurrentUser({ ...user, token });
        
      } else {
        setUser(null);
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, [authInitialized]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Asegurarnos de que los roles se preserven
        setCurrentUser({
          ...userData,
          token,
          roles: userData.roles || []
        });
      } catch (error) {
        logger.error('Error al procesar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // 1. Iniciar sesión con Firebase
      const auth = await initializeAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Obtener el token de Firebase
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Autenticarse en el backend con el token de Firebase
      const loginResponse = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        idToken: idToken
      });
      
      if (!loginResponse.data.success) {
        throw new Error(loginResponse.data.message || 'Error en la autenticación');
      }
      
      const { token: backendToken, user: userData } = loginResponse.data;
      
      // 4. Guardar el token del backend en localStorage
      localStorage.setItem('token', backendToken);
      
      // 5. Crear el objeto de usuario
      const user = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.nombre || userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Usuario',
        roles: userData.roles || [],
        token: backendToken
      };
      
      // 6. Actualizar el estado
      setCurrentUser(user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 7. Redirigir al usuario
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      logger.error('Error al iniciar sesión:', error);
      // Limpiar el token en caso de error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const auth = await initializeAuth();
      await firebaseSignOut(auth);
      
      // Obtener la ruta actual para redirigir después del login
      const currentPath = window.location.pathname;
      
      // Limpiar el estado
      setCurrentUser(null);
      setUser(null);
      
      // Limpiar el almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login con la ruta actual para redirigir después del login
      if (currentPath !== '/login') {
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtener el encabezado de autenticación y asegurar que los roles estén presentes
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token && currentUser) {
      // Si currentUser no tiene roles pero hay datos en localStorage, actualizar
      if (!currentUser.roles || currentUser.roles.length === 0) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData.roles && userData.roles.length > 0 && currentUser.uid) {
              // Actualizar el currentUser con los roles del localStorage
              setCurrentUser({
                ...currentUser,
                roles: userData.roles
              });
            }
          } catch (error) {
            logger.error('Error al recuperar roles del usuario:', error);
          }
        }
      }
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const signup = async (email: string, password: string, nombre: string): Promise<void> => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, { 
        email, 
        password, 
        nombre 
      });
      
      if (response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser({ ...user, token });
        navigate('/');
      }
    } catch (error) {
      logger.error('Error en el registro:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error) {
      logger.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    signup,
    resetPassword,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
