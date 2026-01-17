-- Fix alert_escalation_history RLS policies
-- Issue 1: SELECT policy uses USING(true) - exposes all records across organizations
-- Issue 2: INSERT policy uses WITH CHECK(true) - allows record forgery

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view escalation history" ON alert_escalation_history;
DROP POLICY IF EXISTS "Authenticated users can create escalation history" ON alert_escalation_history;

-- Create organization-scoped SELECT policy
-- Users can only view escalation history for alerts in their organization
CREATE POLICY "Users view escalation history in their org" 
ON alert_escalation_history
FOR SELECT
TO authenticated
USING (
  alert_id IN (
    SELECT id FROM security_alerts 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create organization-scoped INSERT policy
-- Only security analysts can create escalation records, and only for alerts in their organization
CREATE POLICY "Security analysts insert escalation history in their org" 
ON alert_escalation_history
FOR INSERT
TO authenticated
WITH CHECK (
  alert_id IN (
    SELECT id FROM security_alerts 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND public.has_role(auth.uid(), 'security_analyst')
);

-- Create UPDATE policy for acknowledging escalations
-- Security analysts and admins can update escalation records in their org
CREATE POLICY "Security analysts update escalation history in their org" 
ON alert_escalation_history
FOR UPDATE
TO authenticated
USING (
  alert_id IN (
    SELECT id FROM security_alerts 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND public.has_role(auth.uid(), 'security_analyst')
)
WITH CHECK (
  alert_id IN (
    SELECT id FROM security_alerts 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND public.has_role(auth.uid(), 'security_analyst')
);

-- Create DELETE policy (restrictive - only admins)
CREATE POLICY "Admins delete escalation history in their org" 
ON alert_escalation_history
FOR DELETE
TO authenticated
USING (
  alert_id IN (
    SELECT id FROM security_alerts 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND public.has_role(auth.uid(), 'admin')
);