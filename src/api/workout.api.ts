import { api } from '@/lib/axios';
export const getWorkoutsApi   = (page = 1) => api.get('/workout', { params: { page, limit: 20 } });
export const createWorkoutApi = (data: object) => api.post('/workout', data);
export const deleteWorkoutApi = (id: string) => api.delete(`/workout/${id}`);
