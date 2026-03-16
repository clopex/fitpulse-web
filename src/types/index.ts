export type UserRole = 'user' | 'trainer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export interface User { id: string; name: string; email: string; role: UserRole; avatar_url: string | null; is_active: boolean; created_at: string; }
export interface Class { id: string; trainer_id: string; trainer_name: string; title: string; description: string | null; capacity: number; duration_min: number; scheduled_at: string; location: string | null; is_cancelled: boolean; booked_count: number; created_at: string; }
export interface Booking { id: string; user_id: string; class_id: string; status: BookingStatus; qr_token: string; checked_in: boolean; created_at: string; title?: string; scheduled_at?: string; }
export interface Exercise { name: string; sets?: number; reps?: number; weight_kg?: number; }
export interface WorkoutLog { id: string; user_id: string; title: string | null; exercises: Exercise[]; duration_min: number | null; notes: string | null; logged_at: string; created_at: string; }
export interface AuthUser { userId: string; email: string; role: UserRole; name?: string; }
export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at: string;
  updated_at?: string;
}
export interface ApiResponse<T> { success: boolean; message: string; data: T; }
