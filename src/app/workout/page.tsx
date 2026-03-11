'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getWorkoutsApi, createWorkoutApi, deleteWorkoutApi } from '@/api/workout.api';
import { Exercise } from '@/types';
import { Plus, Trash2, Dumbbell, Flame, X } from 'lucide-react';

export default function WorkoutPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', duration_min: '', notes: '' });
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '' }]);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({ queryKey: ['workouts'], queryFn: () => getWorkoutsApi(1), enabled: isAuthenticated });
  const createMutation = useMutation({
    mutationFn: createWorkoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setShowForm(false);
      setForm({ title: '', duration_min: '', notes: '' });
      setExercises([{ name: '' }]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteWorkoutApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  });

  const workouts = data?.data?.data?.workouts ?? [];
  const streak   = data?.data?.data?.streak ?? 0;
  const total    = data?.data?.data?.total ?? 0;

  const handleSubmit = () => {
    const validEx = exercises.filter(e => e.name.trim());
    if (!validEx.length) return;
    createMutation.mutate({
      title: form.title || undefined,
      duration_min: form.duration_min ? parseInt(form.duration_min) : undefined,
      notes: form.notes || undefined,
      exercises: validEx,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Workouts</h1><p className="text-muted-foreground mt-1">{total} sessions logged</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Log Workout
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Flame className="w-6 h-6 text-primary" /></div>
        <div><p className="text-sm text-muted-foreground">Current Streak</p><p className="text-3xl font-black">{streak} <span className="text-lg font-normal text-muted-foreground">days</span></p></div>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Log New Workout</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block text-muted-foreground">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Monday Strength" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-muted-foreground">Duration (min)</label>
              <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="60" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Exercises</label>
              <button onClick={() => setExercises(e => [...e, { name: '' }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <input value={ex.name} onChange={e => setExercises(prev => prev.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))} className="col-span-2 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Exercise name" />
                  <input type="number" placeholder="Sets" value={ex.sets ?? ''} onChange={e => setExercises(prev => prev.map((p, idx) => idx === i ? { ...p, sets: parseInt(e.target.value) || undefined } : p))} className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex gap-1">
                    <input type="number" placeholder="Reps" value={ex.reps ?? ''} onChange={e => setExercises(prev => prev.map((p, idx) => idx === i ? { ...p, reps: parseInt(e.target.value) || undefined } : p))} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    {exercises.length > 1 && <button onClick={() => setExercises(prev => prev.filter((_, idx) => idx !== i))} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-muted-foreground">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="How did it go?" />
          </div>
          <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            {createMutation.isPending ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>No workouts logged yet. Start tracking!</p></div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w: any) => (
            <div key={w.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{w.title ?? 'Workout'}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(w.logged_at).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}{w.duration_min && ` · ${w.duration_min}min`}</p>
                </div>
                <button onClick={() => { if (confirm('Delete workout?')) deleteMutation.mutate(w.id); }} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {w.exercises?.map((ex: Exercise, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-muted rounded-lg text-xs">{ex.name}{ex.sets ? ` ${ex.sets}x${ex.reps}` : ''}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ''}</span>
                ))}
              </div>
              {w.notes && <p className="text-sm text-muted-foreground mt-3 italic">&ldquo;{w.notes}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
