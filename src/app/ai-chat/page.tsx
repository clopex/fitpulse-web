'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { aiChatApi } from '@/api/ai.api';
import { Send, Bot, User, Dumbbell } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'Give me a 3-day workout plan for muscle gain',
  'What should I eat before a workout?',
  'How do I improve my running endurance?',
  'Best exercises for lower back pain?',
];

export default function AIChatPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await aiChatApi(text, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bot className="w-7 h-7 text-primary" /> AI Coach</h1>
        <p className="text-muted-foreground mt-1">Your personal fitness & nutrition advisor</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Dumbbell className="w-8 h-8 text-primary" /></div>
            <div><h2 className="font-semibold text-lg mb-1">How can I help you today?</h2><p className="text-muted-foreground text-sm">Ask me anything about fitness, nutrition, or training.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} className="text-left px-4 py-3 bg-card border border-border rounded-xl text-sm hover:border-primary/50 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Bot className="w-4 h-4 text-primary" /></div>
            )}
            <div className={[
              'max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'
            ].join(' ')}>{msg.content}</div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5"><User className="w-4 h-4" /></div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask your AI coach..."
          className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading} />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
