const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Importar el enum de roles desde la ubicación compartida
import { UserRole } from '@shared/enums/user-role.enum';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/users/signup`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    RESET_PASSWORD: `${API_BASE_URL}/users/reset-password`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    FCM_TOKEN: `${API_BASE_URL}/users/fcm-token`,
  },
  POSTS: `${API_BASE_URL}/posts`,
};

// Re-exportar para usar en el frontend de forma tipada
export { UserRole };
export type UserRoleType = `${UserRole}`;
