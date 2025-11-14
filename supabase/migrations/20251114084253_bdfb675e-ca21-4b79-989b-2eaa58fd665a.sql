-- SECURITY FIX: Implement proper role storage system
-- This migration addresses critical security vulnerabilities

-- 1. Create user_roles table for secure role storage (using existing user_role enum)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create SECURITY DEFINER function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT user_id, role, created_at
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Update get_user_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_uuid 
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'security_analyst' THEN 2
      WHEN 'employee' THEN 3
    END
  LIMIT 1;
$$;

-- 6. FIX: Restrict audit_logs INSERT to admins and security analysts only
DROP POLICY IF EXISTS "System can create audit logs" ON public.audit_logs;
CREATE POLICY "Admins and analysts can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'security_analyst'));

-- 7. Add audit logging trigger for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    SELECT 
      p.organization_id,
      COALESCE(NEW.assigned_by, NEW.user_id),
      'role_assigned',
      'user_role',
      NEW.id::text,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'assigned_at', NEW.assigned_at
      )
    FROM profiles p
    WHERE p.user_id = COALESCE(NEW.assigned_by, NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    SELECT 
      p.organization_id,
      auth.uid(),
      'role_removed',
      'user_role',
      OLD.id::text,
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role
      )
    FROM profiles p
    WHERE p.user_id = auth.uid();
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();