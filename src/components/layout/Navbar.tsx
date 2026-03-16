'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dumbbell, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/classes',   label: 'Classes' },
  { href: '/workout',   label: 'Workouts' },
  { href: '/ai-chat',   label: 'AI Coach' },
  { href: '/profile',   label: 'Profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => { logout(); router.push('/'); };
  const showAuth = mounted && hasHydrated && isAuthenticated;

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">FitPulse</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {showAuth && navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}>{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {showAuth ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm font-medium">{user?.name ?? 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : mounted && hasHydrated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors">Login</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Sign up</Link>
            </div>
          ) : null}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {showAuth && navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={cn(
              'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            )}>{label}</Link>
          ))}
          {showAuth
            ? <>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">Logout</button>
              </>
            : mounted && hasHydrated ? <>
                <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">Login</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm bg-primary text-primary-foreground">Sign up</Link>
              </> : null
          }
        </div>
      )}
    </nav>
  );
}
