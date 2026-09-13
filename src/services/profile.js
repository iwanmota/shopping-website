import { apiRequest } from './api';

export const updateProfile = (profile, token) => apiRequest('/api/auth/me', {
  method: 'PUT', body: profile, token
});
