const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/users/signup`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    RESET_PASSWORD: `${API_BASE_URL}/users/reset-password`,
  },
  POSTS: `${API_BASE_URL}/posts`,
};
