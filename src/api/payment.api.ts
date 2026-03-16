import { api } from '@/lib/axios';
import { SubscriptionPlan } from '@/types';

type PaidPlan = Extract<SubscriptionPlan, 'basic' | 'pro'>;

export const createPaymentIntentApi = (plan: PaidPlan) => api.post('/payment/create-intent', { plan });
export const confirmPaymentApi = (paymentIntentId: string, plan: PaidPlan) =>
  api.post('/payment/confirm', { paymentIntentId, plan });
