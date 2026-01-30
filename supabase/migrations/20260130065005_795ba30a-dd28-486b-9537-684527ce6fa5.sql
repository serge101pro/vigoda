-- Create superadmin role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.superadmin_role AS ENUM ('superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create superadmin_users table for superadmin roles
CREATE TABLE IF NOT EXISTS public.superadmin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    role superadmin_role NOT NULL DEFAULT 'superadmin',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.superadmin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.superadmin_users
    WHERE user_id = _user_id
      AND role = 'superadmin'
  )
$$;

-- RLS policies for superadmin_users
CREATE POLICY "Only superadmins can view superadmin users"
ON public.superadmin_users
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can manage superadmin users"
ON public.superadmin_users
FOR ALL
USING (is_superadmin(auth.uid()));

-- Insert serge101.pro@gmail.com as superadmin
INSERT INTO public.superadmin_users (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = 'serge101.pro@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_superadmin_users_updated_at
BEFORE UPDATE ON public.superadmin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();