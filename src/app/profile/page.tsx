'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Crown, Loader2, Save, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getMeApi, updateMeApi } from '@/api/profile.api';
import { getMySubscriptionApi, cancelMySubscriptionApi } from '@/api/subscriptions.api';
import { confirmPaymentApi, createPaymentIntentApi } from '@/api/payment.api';
import { SubscriptionPlan } from '@/types';

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51T7ILwJLY1F2Nyv2fpcvO7gw8vvWAt3eTi4RacCqYt6EpPe1mMpLyXaQpSqVdWO1oPNQGrGvkS6CNga1YsEMxHwY00vwFQvkVS';

type PaidPlan = Extract<SubscriptionPlan, 'basic' | 'pro'>;

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

const plans: Array<{
  id: PaidPlan;
  name: string;
  price: string;
  badge: string;
  features: string[];
}> = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9/mo',
    badge: 'Popular for regulars',
    features: ['10 classes per month', 'Workout tracker', 'AI workout plans'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19/mo',
    badge: 'Unlimited access',
    features: ['Unlimited classes', 'Advanced AI coach', 'Nutrition plans', 'Priority support'],
  },
];

function loadStripeJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Stripe is only available in the browser.'));
      return;
    }

    if (window.Stripe) {
      resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-stripe-js="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Stripe?.(STRIPE_PUBLISHABLE_KEY)));
      existing.addEventListener('error', () => reject(new Error('Failed to load Stripe.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.dataset.stripeJs = 'true';
    script.onload = () => resolve(window.Stripe?.(STRIPE_PUBLISHABLE_KEY));
    script.onerror = () => reject(new Error('Failed to load Stripe.'));
    document.body.appendChild(script);
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasHydrated, isAuthenticated, updateUser } = useAuthStore();

  const [form, setForm] = useState({ name: '', avatar_url: '' });
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);

  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardRef = useRef<any>(null);
  const clientSecretRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/login');
  }, [hasHydrated, isAuthenticated, router]);

  const queriesEnabled = hasHydrated && isAuthenticated;

  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
    enabled: queriesEnabled,
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-me'],
    queryFn: getMySubscriptionApi,
    enabled: queriesEnabled,
  });

  const profile = meData?.data?.data;
  const subscription = subscriptionData?.data?.data;
  const currentPlan: SubscriptionPlan = subscription?.plan ?? 'free';
  const currentStatus = subscription?.status ?? 'inactive';

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        avatar_url: profile.avatar_url ?? '',
      });
    }
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    const setupPayment = async () => {
      if (!selectedPlan || !cardElementRef.current) return;

      setPaymentReady(false);
      setPaymentError('');
      setPaymentSuccess('');
      clientSecretRef.current = null;

      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }

      try {
        const stripe = await loadStripeJs();
        if (!stripe) throw new Error('Stripe failed to initialize.');

        const intentRes = await createPaymentIntentApi(selectedPlan);
        const clientSecret = intentRes.data?.data?.clientSecret as string | undefined;
        if (!clientSecret) throw new Error('Missing payment client secret.');

        if (cancelled) return;

        stripeRef.current = stripe;
        clientSecretRef.current = clientSecret;
        elementsRef.current = stripe.elements({
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#22c55e',
              colorBackground: '#111827',
              colorText: '#f9fafb',
              colorDanger: '#ef4444',
              borderRadius: '12px',
            },
          },
        });

        const card = elementsRef.current.create('payment');
        card.mount(cardElementRef.current);
        cardRef.current = card;
        setPaymentReady(true);
      } catch (err: any) {
        if (!cancelled) {
          setPaymentError(err.response?.data?.message || err.message || 'Unable to initialize payment.');
        }
      }
    };

    setupPayment();

    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    };
  }, [selectedPlan]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      updateMeApi({
        name: form.name.trim(),
        avatar_url: form.avatar_url.trim() || undefined,
      }),
    onSuccess: (res) => {
      const user = res.data?.data;
      updateUser({ name: user?.name });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelMySubscriptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-me'] });
      setPaymentSuccess('Subscription cancelled.');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan || !stripeRef.current || !elementsRef.current || !clientSecretRef.current) {
        throw new Error('Payment form is not ready yet.');
      }

      const result = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: form.name || profile?.name || '',
              email: profile?.email || '',
            },
          },
        },
      });

      if (result.error) throw new Error(result.error.message);
      if (!result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not completed.');
      }

      await confirmPaymentApi(result.paymentIntent.id, selectedPlan);
      return selectedPlan;
    },
    onSuccess: () => {
      setPaymentSuccess(`Your ${selectedPlan?.toUpperCase()} plan is active.`);
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ['subscription-me'] });
    },
    onError: (err: any) => {
      setPaymentError(err.response?.data?.message || err.message || 'Payment failed.');
    },
  });

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPaymentSuccess('');
    await updateProfileMutation.mutateAsync();
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and subscription.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Account Details</h2>
              <p className="text-sm text-muted-foreground">Update what shows up across the platform.</p>
            </div>
          </div>

          {meLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  value={profile?.email ?? ''}
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground"
                  disabled
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Avatar URL</label>
                <input
                  value={form.avatar_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>

              {updateProfileMutation.isSuccess && (
                <p className="text-sm text-green-500">Profile updated successfully.</p>
              )}
              {updateProfileMutation.isError && (
                <p className="text-sm text-destructive">
                  {(updateProfileMutation.error as any)?.response?.data?.message || 'Failed to update profile.'}
                </p>
              )}
            </form>
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Subscription</h2>
              <p className="text-sm text-muted-foreground">Upgrade your access with Stripe checkout.</p>
            </div>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Current plan</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{currentPlan}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{currentStatus}</p>
                  </div>
                  {currentPlan !== 'free' && currentStatus === 'active' && (
                    <button
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                      className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-accent disabled:opacity-50"
                    >
                      Cancel Plan
                    </button>
                  )}
                </div>
                {subscription?.current_period_end && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Renews until {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {paymentSuccess && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-500">
                    {paymentSuccess}
                  </div>
                )}

                {plans.map((plan) => {
                  const activePlan = currentPlan === plan.id && currentStatus === 'active';
                  const selected = selectedPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        selected ? 'border-primary bg-primary/5' : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{plan.badge}</span>
                          </div>
                          <p className="text-2xl font-black mt-1">{plan.price}</p>
                          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => setSelectedPlan(plan.id)}
                          disabled={activePlan}
                          className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <CreditCard className="w-4 h-4" />
                          {activePlan ? 'Current plan' : `Buy ${plan.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPlan && (
                <div className="rounded-xl border border-border bg-background p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Complete {selectedPlan.toUpperCase()} payment</h3>
                      <p className="text-sm text-muted-foreground">Secure card payment via Stripe.</p>
                    </div>
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="px-3 py-2 rounded-lg text-sm border border-border hover:bg-accent"
                    >
                      Close
                    </button>
                  </div>

                  <div ref={cardElementRef} className="rounded-xl border border-border bg-card p-4 min-h-[72px]" />

                  {paymentError && <p className="text-sm text-destructive">{paymentError}</p>}

                  <button
                    onClick={() => paymentMutation.mutate()}
                    disabled={!paymentReady || paymentMutation.isPending}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Pay with Stripe
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
