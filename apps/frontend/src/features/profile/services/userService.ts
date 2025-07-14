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
};

export type UserProfile = IUserProfile;
