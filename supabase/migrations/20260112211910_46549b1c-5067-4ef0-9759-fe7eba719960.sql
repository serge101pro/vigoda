-- Create a function to check if user is the test admin
CREATE OR REPLACE FUNCTION public.is_test_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
    AND email = 'serge101.pro@gmail.com'
  );
$$;

-- Create a function to manually set subscription plan (only for test admin)
CREATE OR REPLACE FUNCTION public.set_subscription_plan(_plan subscription_plan)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is the test admin
  IF NOT is_test_admin(auth.uid()) THEN
    RETURN false;
  END IF;

  -- Upsert the subscription
  INSERT INTO user_subscriptions (user_id, plan, is_active, started_at, expires_at)
  VALUES (
    auth.uid(),
    _plan,
    true,
    now(),
    CASE WHEN _plan = 'free' THEN NULL ELSE now() + interval '1 year' END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan = _plan,
    is_active = true,
    updated_at = now(),
    expires_at = CASE WHEN _plan = 'free' THEN NULL ELSE now() + interval '1 year' END;

  RETURN true;
END;
$$;

-- Add unique constraint on user_id for subscriptions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_subscriptions_user_id_key'
  ) THEN
    ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create user_preferences table for dietary preferences and store preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dietary_restrictions text[] DEFAULT '{}',
  favorite_stores text[] DEFAULT '{}',
  monthly_budget numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  telegram_enabled boolean DEFAULT false,
  shopping_reminders boolean DEFAULT true,
  reminder_time time DEFAULT '18:00',
  discount_alerts boolean DEFAULT true,
  price_rise_alerts boolean DEFAULT true,
  family_updates boolean DEFAULT false,
  order_updates boolean DEFAULT true,
  promo_notifications boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
ON public.notification_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON public.notification_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Create permission_settings table
CREATE TABLE IF NOT EXISTS public.permission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  geolocation_enabled boolean DEFAULT true,
  camera_enabled boolean DEFAULT false,
  share_anonymous_stats boolean DEFAULT true,
  personal_recommendations boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.permission_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permission settings"
ON public.permission_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own permission settings"
ON public.permission_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own permission settings"
ON public.permission_settings FOR UPDATE
USING (auth.uid() = user_id);