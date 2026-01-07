-- Create trigger to automatically create referral record when user registers with referral code
CREATE OR REPLACE FUNCTION public.process_referral_registration()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users table (using event trigger approach via profiles)
-- Note: We cannot directly attach triggers to auth.users, so we use the handle_new_user trigger
-- to also process referrals. Let's update the existing trigger:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_uuid UUID;
BEGIN
  -- Validate required fields
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user data: missing user ID';
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, user_id, display_name, email)
  VALUES (gen_random_uuid(), NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  
  -- Process referral code if present
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Find the referrer by their code
    BEGIN
      referrer_uuid := decode(ref_code, 'base64')::TEXT::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- Invalid referral code format, skip
      RETURN NEW;
    END;
    
    -- Don't allow self-referral
    IF referrer_uuid != NEW.id THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to activate referral (called when referred user makes first order)
CREATE OR REPLACE FUNCTION public.activate_referral(referred_user_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;