import { api } from '@/lib/axios';
export const aiChatApi = (message: string, history: {role: string; content: string}[]) =>
  api.post('/ai/chat', { message, history });
