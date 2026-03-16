import { api } from '@/lib/axios';

export const getMeApi = () => api.get('/auth/me');
export const updateMeApi = (data: { name?: string; avatar_url?: string }) => api.patch('/users/me', data);
