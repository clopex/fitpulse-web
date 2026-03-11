import { api } from '@/lib/axios';
export const getClassesApi = (page = 1, limit = 12) => api.get('/classes', { params: { page, limit } });
export const bookClassApi  = (class_id: string) => api.post('/bookings', { class_id });
export const getMyBookings = () => api.get('/bookings/me');
