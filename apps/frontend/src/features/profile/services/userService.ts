import api from '@frontend/lib/axios';
import { API_ENDPOINTS } from '@frontend/config/api';
import { logger } from '@frontend/shared/utils/logger';

export interface IUserProfile {
  id?: string;
  nombre: string;
  email: string;
  biografia?: string;
  alergias: string[];
  roles: string[];
}

export const userService = {
  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<IUserProfile> {
    const { data } = await api.get(API_ENDPOINTS.USERS.PROFILE);
    // El backend devuelve { success, profile }
    return data.profile || data.user;
  },

  // Actualizar perfil del usuario autenticado
  async updateProfile(profileData: Partial<IUserProfile>): Promise<IUserProfile> {
    const { data } = await api.put(API_ENDPOINTS.USERS.PROFILE, profileData);
    return data.profile || data.user;
  },

  // Guardar token FCM para notificaciones push
  async saveUserFcmToken(token: string): Promise<boolean> {
    try {
      const { data } = await api.post(API_ENDPOINTS.USERS.FCM_TOKEN, { token });
      logger.log('Token FCM guardado correctamente:', data);
      return true;
    } catch (error) {
      logger.error('Error al guardar el token FCM:', error);
      return false;
    }
  },
};

export type UserProfile = IUserProfile;
