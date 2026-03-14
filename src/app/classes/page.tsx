'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClassesApi, bookClassApi } from '@/api/classes.api';
import { useAuthStore } from '@/store/auth.store';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClassesPage() {
  const [page, setPage] = useState(1);
  const [booked, setBooked] = useState<string[]>([]);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['classes', page], queryFn: () => getClassesApi(page, 12) });
  const [bookingStates, setBookingStates] = useState<Record<string, 'idle' | 'loading' | 'booked' | 'error'>>({});
  const router = useRouter();

const handleBook = async (classId: string) => {
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }
  setBookingStates(prev => ({ ...prev, [classId]: 'loading' }));
  try {
    await bookClassApi(classId);
    setBookingStates(prev => ({ ...prev, [classId]: 'booked' }));
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
  } catch (err: any) {
    setBookingStates(prev => ({ ...prev, [classId]: 'error' }));
    const msg = err.response?.data?.message || 'Booking failed';
    alert(msg);
    setTimeout(() => setBookingStates(prev => ({ ...prev, [classId]: 'idle' })), 2000);
  }
};

  const classes    = data?.data?.data?.classes ?? [];
  const total      = data?.data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Classes</h1>
        <p className="text-muted-foreground mt-1">{total} classes available</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-lg">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.trainer_name}</p>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{new Date(c.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {c.duration_min}min</div>
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{c.booked_count}/{c.capacity} spots</div>
                {c.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{c.location}</div>}
              </div>
              {c.is_cancelled ? (
                <span className="text-center py-2 rounded-lg text-sm bg-red-500/10 text-red-500">Cancelled</span>
              ) : isAuthenticated ? (
                <button
  onClick={() => handleBook(c.id)}
  disabled={bookingStates[c.id] === 'loading' || bookingStates[c.id] === 'booked' || c.booked_count >= c.capacity}
  className="w-full py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 mt-auto"
>
  {bookingStates[c.id] === 'loading' ? 'Booking...' :
   bookingStates[c.id] === 'booked'  ? '✓ Booked'  :
   bookingStates[c.id] === 'error'   ? 'Try again' :
   c.booked_count >= c.capacity      ? 'Full'       : 'Book Class'}
</button>
              ) : (
                <a href="/login" className="block text-center py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-colors mt-auto">Login to Book</a>
              )}
            </div>
          ))}
          {classes.length === 0 && <div className="col-span-3 py-16 text-center text-muted-foreground">No classes available</div>}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 text-sm">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
