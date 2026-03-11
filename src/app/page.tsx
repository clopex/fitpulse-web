import Link from 'next/link';
import { Dumbbell, Zap, Brain, Calendar, Star, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Book Classes',   desc: 'Browse and book fitness classes with top trainers.' },
  { icon: Dumbbell, title: 'Track Workouts', desc: 'Log every session and watch your strength grow.' },
  { icon: Brain,    title: 'AI Coach',       desc: 'Get personalized plans and nutrition advice from AI.' },
  { icon: Zap,      title: 'Stay Motivated', desc: 'Track streaks, hit milestones, crush your goals.' },
];

type Plan = { name: string; price: string; popular: boolean; features: string[] };

const plans: Plan[] = [
  { name: 'Free',  price: '$0',  popular: false, features: ['3 classes/month', 'Workout tracker', 'Basic AI chat'] },
  { name: 'Basic', price: '$9',  popular: false, features: ['10 classes/month', 'Workout tracker', 'AI workout plans'] },
  { name: 'Pro',   price: '$19', popular: true,  features: ['Unlimited classes', 'Advanced AI coach', 'Nutrition plans', 'Priority support'] },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" /> AI-Powered Fitness Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Your Fitness Journey<br /><span className="text-primary">Starts Here</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Book classes, track workouts, and get personalized AI coaching — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/classes" className="px-8 py-3.5 rounded-xl font-semibold border border-border hover:bg-accent transition-colors">Browse Classes</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to reach your goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-muted-foreground text-center mb-12">Start free, upgrade when ready.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={[
              'bg-card border rounded-xl p-6 relative',
              plan.popular ? 'border-primary' : 'border-border'
            ].join(' ')}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
              <p className="text-3xl font-black mb-6">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={[
                'block text-center py-2.5 rounded-lg font-medium text-sm transition-colors',
                plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-accent'
              ].join(' ')}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">FitPulse</span>
        </div>
        © {new Date().getFullYear()} FitPulse. All rights reserved.
      </footer>
    </div>
  );
}
