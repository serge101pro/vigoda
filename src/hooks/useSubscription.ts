import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionPlan = 'free' | 'solo' | 'family' | 'corp';

interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  is_active: boolean;
  started_at: string;
  expires_at: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }
      
      // Map the data to our Subscription type
      if (data) {
        setSubscription({
          id: data.id,
          user_id: data.user_id,
          plan: data.plan as SubscriptionPlan,
          is_active: data.is_active,
          started_at: data.started_at,
          expires_at: data.expires_at
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasPaidPlan = subscription?.is_active && subscription?.plan !== 'free';
  
  const isPremium = subscription?.is_active && 
    (subscription?.plan === 'solo' || subscription?.plan === 'family' || subscription?.plan === 'corp');

  return {
    subscription,
    loading,
    hasPaidPlan,
    isPremium,
    refetch: fetchSubscription
  };
}
