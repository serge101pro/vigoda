-- Add trigger to activate referral on first order
CREATE OR REPLACE FUNCTION public.activate_referral_on_first_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_count INTEGER;
  referral_record RECORD;
  bonus_amount NUMERIC := 200;
BEGIN
  -- Count user's orders (excluding the new one)
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE user_id = NEW.user_id AND id != NEW.id;
  
  -- If this is the first order (count was 0 before this insert)
  IF order_count = 0 THEN
    -- Find pending referral for this user
    SELECT * INTO referral_record
    FROM referrals
    WHERE referred_id = NEW.user_id AND status = 'pending'
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Update referral to active
      UPDATE referrals
      SET 
        status = 'active',
        activated_at = NOW(),
        bonus_earned = bonus_amount
      WHERE id = referral_record.id;
      
      -- Add bonus to referrer's profile
      UPDATE profiles
      SET bonus_points = COALESCE(bonus_points, 0) + bonus_amount
      WHERE user_id = referral_record.referrer_id;
      
      -- Add bonus to referred user's profile
      UPDATE profiles
      SET bonus_points = COALESCE(bonus_points, 0) + bonus_amount
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS on_first_order_activate_referral ON orders;
CREATE TRIGGER on_first_order_activate_referral
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION activate_referral_on_first_order();

-- Create partner_wallet_transactions table for wallet history
CREATE TABLE IF NOT EXISTS public.partner_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'withdrawal', 'bonus')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  description TEXT,
  referral_id UUID REFERENCES referrals(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet transactions"
  ON public.partner_wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallet transactions"
  ON public.partner_wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON partner_wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON partner_wallet_transactions(created_at DESC);