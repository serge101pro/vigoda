-- Create function to process referral on registration
CREATE OR REPLACE FUNCTION public.process_referral_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  referrer_uuid UUID;
BEGIN
  -- Get referral code from user metadata
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Find the referrer by their code (code is stored as base64 of user_id)
    BEGIN
      referrer_uuid := decode(ref_code, 'base64')::TEXT::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- Invalid referral code format, skip
      RETURN NEW;
    END;
    
    -- Don't allow self-referral
    IF referrer_uuid = NEW.id THEN
      RETURN NEW;
    END IF;
    
    -- Check if referrer exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = referrer_uuid) THEN
      -- Create referral record
      INSERT INTO public.referrals (
        referrer_id,
        referred_id,
        referral_code,
        status,
        bonus_earned
      ) VALUES (
        referrer_uuid,
        NEW.id,
        ref_code,
        'pending',
        0
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for processing referral on user creation
DROP TRIGGER IF EXISTS on_referral_registration ON auth.users;
CREATE TRIGGER on_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_registration();

-- Function to activate referral and award bonus (call after first purchase)
CREATE OR REPLACE FUNCTION public.activate_referral(referred_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_record RECORD;
  bonus_amount NUMERIC := 200; -- 200 rubles bonus
BEGIN
  -- Find pending referral for this user
  SELECT * INTO ref_record
  FROM public.referrals
  WHERE referred_id = referred_user_id
    AND status = 'pending'
  LIMIT 1;
  
  IF ref_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update referral to active
  UPDATE public.referrals
  SET 
    status = 'active',
    activated_at = NOW(),
    bonus_earned = bonus_amount
  WHERE id = ref_record.id;
  
  -- Add bonus to referrer's profile
  UPDATE public.profiles
  SET bonus_points = COALESCE(bonus_points, 0) + bonus_amount
  WHERE user_id = ref_record.referrer_id;
  
  -- Add bonus to referred user's profile (if applicable)
  UPDATE public.profiles
  SET bonus_points = COALESCE(bonus_points, 0) + bonus_amount
  WHERE user_id = referred_user_id;
  
  RETURN TRUE;
END;
$$;