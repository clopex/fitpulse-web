import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@/types';

interface AuthState {
  token: string | null; user: AuthUser | null; isAuthenticated: boolean; hasHydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, user: null, isAuthenticated: false, hasHydrated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (user) => set((state) => ({
        user: state.user ? { ...state.user, ...user } : state.user,
      })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'fitpulse-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
