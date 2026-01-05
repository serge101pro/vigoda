-- Таблица рефералов
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_earned NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть свои рефералы (где они referrer)
CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- Пользователи могут видеть кто их пригласил
CREATE POLICY "Users can view who referred them"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_id);

-- Система может создавать рефералы при регистрации
CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Функция для получения топ партнёров (анонимно)
CREATE OR REPLACE FUNCTION public.get_top_referrers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank_position BIGINT,
  referrer_hash TEXT,
  total_referrals BIGINT,
  total_earned NUMERIC,
  is_current_user BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT 
      r.referrer_id,
      COUNT(*) as total_refs,
      COALESCE(SUM(r.bonus_earned), 0) as total_bonus,
      ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(r.bonus_earned), 0) DESC, COUNT(*) DESC) as pos
    FROM referrals r
    WHERE r.status = 'active'
    GROUP BY r.referrer_id
  )
  SELECT 
    ranked.pos,
    CONCAT('Партнёр #', ranked.pos) as hash,
    ranked.total_refs,
    ranked.total_bonus,
    (ranked.referrer_id = auth.uid()) as is_current
  FROM ranked
  ORDER BY ranked.pos
  LIMIT limit_count;
END;
$$;

-- Функция для получения статистики текущего пользователя
CREATE OR REPLACE FUNCTION public.get_user_referral_stats()
RETURNS TABLE (
  total_invited BIGINT,
  active_referrals BIGINT,
  total_earned NUMERIC,
  user_position BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(*) as invited,
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COALESCE(SUM(bonus_earned), 0) as earned
    FROM referrals
    WHERE referrer_id = current_user_id
  ),
  user_rank AS (
    SELECT 
      ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(bonus_earned), 0) DESC) as pos
    FROM referrals
    WHERE status = 'active'
    GROUP BY referrer_id
    HAVING referrer_id = current_user_id
  )
  SELECT 
    COALESCE(user_stats.invited, 0),
    COALESCE(user_stats.active, 0),
    COALESCE(user_stats.earned, 0),
    COALESCE(user_rank.pos, 0)
  FROM user_stats
  LEFT JOIN user_rank ON true;
END;
$$;