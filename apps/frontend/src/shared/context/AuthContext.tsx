import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { getAuthInstance as getFirebaseAuth } from '@/config/firebase-config';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, Auth } from 'firebase/auth';

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
  const [user, setUser] = useState<User | null>(null);
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
        console.error('Error al inicializar autenticación:', error);
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
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
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
      setCurrentUser({ ...JSON.parse(user), token });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      if (!authInstance) {
        throw new Error('La autenticación no está inicializada');
      }
      
      // 1. Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      
      // 2. Obtener el ID Token del usuario autenticado
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Enviar el ID Token al backend para autenticación
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { idToken });
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Establecer el usuario actual
        setCurrentUser({ ...user, token });
        
        // Redirigir al dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'No se pudo iniciar sesión. Verifica tus credenciales.';
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido deshabilitada.';
      } else if (error.response?.data?.message) {
        // Si hay un mensaje de error del backend, usarlo
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (!authInstance) {
        throw new Error('La autenticación no está inicializada');
      }
      // Cerrar sesión en Firebase
      await firebaseSignOut(authInstance);
      
      // Limpiar el estado y el almacenamiento local
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Obtener el encabezado de autenticación
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token && currentUser) {
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
      console.error('Error en el registro:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
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
