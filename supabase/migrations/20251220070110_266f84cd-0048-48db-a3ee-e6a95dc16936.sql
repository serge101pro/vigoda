-- Add a function to link new users to the test organization for B2B testing
CREATE OR REPLACE FUNCTION public.link_user_to_test_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_org_id UUID;
BEGIN
  -- Find the test organization
  SELECT id INTO test_org_id FROM public.organizations WHERE name = 'ООО «ТестКомпания»' LIMIT 1;
  
  -- If test org exists, add the new user as an employee
  IF test_org_id IS NOT NULL THEN
    INSERT INTO public.org_members (organization_id, user_id, role, monthly_limit, is_active)
    VALUES (test_org_id, NEW.id, 'employee', 15000, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to link new users to test organization
DROP TRIGGER IF EXISTS on_auth_user_created_link_org ON auth.users;
CREATE TRIGGER on_auth_user_created_link_org
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_user_to_test_org();