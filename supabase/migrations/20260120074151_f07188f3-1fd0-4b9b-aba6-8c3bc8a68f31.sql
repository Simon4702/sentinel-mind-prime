-- Fix Security Issues: Warn-level RLS policy restrictions
-- ========================================

-- 1. Fix role_permissions table - Restrict to admin-only access
-- ========================================
DROP POLICY IF EXISTS "Users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admins view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admin view role permissions" ON role_permissions;

-- Only admins can view role permissions to prevent authorization model exposure
CREATE POLICY "Admins view role permissions" 
ON role_permissions FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

-- ========================================
-- 2. Fix deception_telemetry table - Restrict INSERT to analysts/admins
-- ========================================
DROP POLICY IF EXISTS "Authenticated users can insert deception telemetry" ON deception_telemetry;
DROP POLICY IF EXISTS "Users can insert deception telemetry" ON deception_telemetry;
DROP POLICY IF EXISTS "Analysts insert deception telemetry" ON deception_telemetry;

-- Only security analysts and admins can insert telemetry to prevent data poisoning
CREATE POLICY "Analysts insert deception telemetry" 
ON deception_telemetry FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'security_analyst') OR 
  public.has_role(auth.uid(), 'admin')
);