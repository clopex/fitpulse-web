import { api } from '@/lib/axios';

export const getMySubscriptionApi = () => api.get('/subscriptions/me');
export const cancelMySubscriptionApi = () => api.delete('/subscriptions/me');
