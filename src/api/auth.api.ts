import { api } from '@/lib/axios';
export const loginApi    = (email: string, password: string) => api.post('/auth/login', { email, password });
export const registerApi = (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password });
