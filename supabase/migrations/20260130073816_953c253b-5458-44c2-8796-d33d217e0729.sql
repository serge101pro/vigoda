-- Create enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('admin');

-- Create admin_users table for regular admins (separate from superadmins)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role admin_role NOT NULL DEFAULT 'admin'::admin_role,
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage admin users
CREATE POLICY "Superadmins can view admin users"
ON public.admin_users
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage admin users"
ON public.admin_users
FOR ALL
USING (is_superadmin(auth.uid()));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND role = 'admin'
  ) OR is_superadmin(_user_id)
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();