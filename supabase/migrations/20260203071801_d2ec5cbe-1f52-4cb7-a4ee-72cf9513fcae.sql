-- Fix Security Issue: honeypots_overly_permissive
-- Remove overly permissive honeypot SELECT policy that allows any authenticated user to view
-- Honeypot configurations should only be visible to security analysts to prevent attackers from discovering them
-- ========================================

-- Drop the overly permissive policy that allows any authenticated user to view honeypots
DROP POLICY IF EXISTS "Authenticated users can view honeypots" ON honeypots;

-- The existing policy "Users manage honeypots in their org" already properly restricts
-- ALL operations (including SELECT) to security_analysts within their organization
-- No new policy needed - the restrictive policy already exists