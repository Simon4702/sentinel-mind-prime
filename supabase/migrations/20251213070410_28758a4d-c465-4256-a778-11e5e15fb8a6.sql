-- Create a demo organization for testing
INSERT INTO public.organizations (id, name, domain, subscription_tier, max_users, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo.sentinelmind.io', 'enterprise', 100, true)
ON CONFLICT (id) DO NOTHING;

-- Create a function to auto-assign demo users to the demo organization with admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, organization_id, department, security_clearance_level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Demo User'),
    'admin'::user_role,
    '00000000-0000-0000-0000-000000000001',
    'Security Operations',
    5
  );
  
  -- Also insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin'::user_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();