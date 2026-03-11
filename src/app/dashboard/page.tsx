'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getMyBookings, getClassesApi } from '@/api/classes.api';
import { getWorkoutsApi } from '@/api/workout.api';
import { Dumbbell, Calendar, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data: bookingsData } = useQuery({ queryKey: ['my-bookings'], queryFn: getMyBookings, enabled: isAuthenticated });
  const { data: workoutsData } = useQuery({ queryKey: ['my-workouts'], queryFn: () => getWorkoutsApi(1), enabled: isAuthenticated });
  const { data: classesData  } = useQuery({ queryKey: ['classes-home'], queryFn: () => getClassesApi(1, 3), enabled: isAuthenticated });

  const bookings = bookingsData?.data?.data?.bookings ?? [];
  const workouts = workoutsData?.data?.data ?? {};
  const classes  = classesData?.data?.data?.classes ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hey, {user?.name ?? 'there'} 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your fitness overview.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: 'Bookings', value: bookings.length },
          { icon: Dumbbell, label: 'Workouts', value: workouts.total ?? 0 },
          { icon: Flame,    label: 'Streak',   value: `${workouts.streak ?? 0} days` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Classes</h2>
          <Link href="/classes" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((c: any) => (
            <Link key={c.id} href="/classes" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.trainer_name}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(c.scheduled_at).toLocaleDateString()} · {c.duration_min}min</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.booked_count}/{c.capacity} booked</span>
                <span className="text-xs text-primary font-medium">Book →</span>
              </div>
            </Link>
          ))}
          {classes.length === 0 && <div className="col-span-3 py-8 text-center text-muted-foreground text-sm">No upcoming classes</div>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/ai-chat', icon: '🤖', label: 'Ask AI Coach', desc: 'Get personalized fitness advice' },
          { href: '/workout', icon: '💪', label: 'Log Workout',  desc: 'Track your training session' },
          { href: '/classes', icon: '📅', label: 'Book Class',   desc: 'Find and book a class' },
        ].map(({ href, icon, label, desc }) => (
          <Link key={href} href={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex items-center gap-4">
            <span className="text-2xl">{icon}</span>
            <div><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
