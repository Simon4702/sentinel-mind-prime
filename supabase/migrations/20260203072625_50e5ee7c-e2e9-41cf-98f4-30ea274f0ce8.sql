-- Fix Security Issues: Error-level RLS policy restrictions
-- ========================================

-- 1. Fix red_team_tests - Remove overly permissive public read policy
-- Only security analysts in the organization should view penetration test results
-- ========================================
DROP POLICY IF EXISTS "Authenticated users can view red team tests" ON red_team_tests;

-- The existing policy "Users manage red team tests in their org" already restricts 
-- ALL operations to security_analysts within their organization, so no new SELECT policy needed

-- 2. Fix profiles table - Restrict visibility to own profile, admins, and analysts only
-- ========================================
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Security analysts and admins can view profiles in their organization
CREATE POLICY "Analysts view profiles in their org" 
ON profiles FOR SELECT
TO authenticated
USING (
  organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  AND (public.has_role(auth.uid(), 'security_analyst') OR public.has_role(auth.uid(), 'admin'))
);

-- 3. Fix audit_logs - Only system/triggers should insert, restrict user insert
-- ========================================
DROP POLICY IF EXISTS "Admins and analysts can create audit logs" ON audit_logs;

-- Create a system-only insert policy using a security definer function approach
-- Since we can't easily restrict to "system only", we ensure inserts must have valid organization context
CREATE POLICY "System inserts audit logs" 
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow insert if user is inserting a log for their own organization
  organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'security_analyst'))
);