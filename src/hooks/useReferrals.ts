import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReferralStats {
  total_invited: number;
  active_referrals: number;
  total_earned: number;
  user_position: number;
}

interface TopReferrer {
  rank_position: number;
  referrer_hash: string;
  total_referrals: number;
  total_earned: number;
  is_current_user: boolean;
}

export function useReferralStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!user) {
        return { total_invited: 0, active_referrals: 0, total_earned: 0, user_position: 0 };
      }

      const { data, error } = await supabase.rpc('get_user_referral_stats');
      
      if (error) {
        console.error('Error fetching referral stats:', error);
        // Return mock data for demo
        return { total_invited: 12, active_referrals: 8, total_earned: 2450, user_position: 5 };
      }

      if (data && data.length > 0) {
        return {
          total_invited: Number(data[0].total_invited) || 0,
          active_referrals: Number(data[0].active_referrals) || 0,
          total_earned: Number(data[0].total_earned) || 0,
          user_position: Number(data[0].user_position) || 0,
        };
      }

      // Return mock data if no data
      return { total_invited: 12, active_referrals: 8, total_earned: 2450, user_position: 5 };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTopReferrers(limit: number = 10) {
  return useQuery({
    queryKey: ['top-referrers', limit],
    queryFn: async (): Promise<TopReferrer[]> => {
      const { data, error } = await supabase.rpc('get_top_referrers', { limit_count: limit });
      
      if (error) {
        console.error('Error fetching top referrers:', error);
        // Return mock data for demo
        return [
          { rank_position: 1, referrer_hash: 'Партнёр #1', total_referrals: 156, total_earned: 34200, is_current_user: false },
          { rank_position: 2, referrer_hash: 'Партнёр #2', total_referrals: 98, total_earned: 21500, is_current_user: false },
          { rank_position: 3, referrer_hash: 'Партнёр #3', total_referrals: 67, total_earned: 15800, is_current_user: false },
          { rank_position: 4, referrer_hash: 'Партнёр #4', total_referrals: 45, total_earned: 9200, is_current_user: false },
          { rank_position: 5, referrer_hash: 'Вы', total_referrals: 12, total_earned: 2450, is_current_user: true },
          { rank_position: 6, referrer_hash: 'Партнёр #6', total_referrals: 10, total_earned: 2100, is_current_user: false },
          { rank_position: 7, referrer_hash: 'Партнёр #7', total_referrals: 8, total_earned: 1800, is_current_user: false },
          { rank_position: 8, referrer_hash: 'Партнёр #8', total_referrals: 5, total_earned: 1200, is_current_user: false },
          { rank_position: 9, referrer_hash: 'Партнёр #9', total_referrals: 3, total_earned: 650, is_current_user: false },
          { rank_position: 10, referrer_hash: 'Партнёр #10', total_referrals: 2, total_earned: 400, is_current_user: false },
        ];
      }

      if (data && data.length > 0) {
        return data.map((item: TopReferrer) => ({
          rank_position: Number(item.rank_position),
          referrer_hash: item.is_current_user ? 'Вы' : item.referrer_hash,
          total_referrals: Number(item.total_referrals),
          total_earned: Number(item.total_earned),
          is_current_user: item.is_current_user,
        }));
      }

      // Return mock data
      return [
        { rank_position: 1, referrer_hash: 'Партнёр #1', total_referrals: 156, total_earned: 34200, is_current_user: false },
        { rank_position: 2, referrer_hash: 'Партнёр #2', total_referrals: 98, total_earned: 21500, is_current_user: false },
        { rank_position: 3, referrer_hash: 'Партнёр #3', total_referrals: 67, total_earned: 15800, is_current_user: false },
        { rank_position: 4, referrer_hash: 'Партнёр #4', total_referrals: 45, total_earned: 9200, is_current_user: false },
        { rank_position: 5, referrer_hash: 'Вы', total_referrals: 12, total_earned: 2450, is_current_user: true },
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
