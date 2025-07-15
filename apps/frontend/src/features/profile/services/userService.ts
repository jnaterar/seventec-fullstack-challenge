import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

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
      console.log('Token FCM guardado correctamente:', data);
      return true;
    } catch (error) {
      console.error('Error al guardar el token FCM:', error);
      return false;
    }
  },
};

export type UserProfile = IUserProfile;
