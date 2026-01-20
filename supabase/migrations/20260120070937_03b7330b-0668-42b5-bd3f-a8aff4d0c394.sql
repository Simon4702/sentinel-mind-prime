-- Fix Security Issues: Restrict RLS policies for sensitive tables
-- Note: Some policies from first 3 tables were already created, continuing with IOC tables

-- ========================================
-- 4. Fix ioc_watchlist table - organization-scoped access
-- ========================================
DROP POLICY IF EXISTS "Users can view IOC watchlist" ON ioc_watchlist;
DROP POLICY IF EXISTS "Users can insert IOC watchlist" ON ioc_watchlist;
DROP POLICY IF EXISTS "Users can update IOC watchlist" ON ioc_watchlist;
DROP POLICY IF EXISTS "Users can delete IOC watchlist" ON ioc_watchlist;
DROP POLICY IF EXISTS "Users view IOC watchlist in their org" ON ioc_watchlist;
DROP POLICY IF EXISTS "Analysts insert IOC watchlist in their org" ON ioc_watchlist;
DROP POLICY IF EXISTS "Analysts update IOC watchlist in their org" ON ioc_watchlist;
DROP POLICY IF EXISTS "Analysts delete IOC watchlist in their org" ON ioc_watchlist;

-- Users can only view IOC watchlist in their organization
CREATE POLICY "Org users view IOC watchlist" 
ON ioc_watchlist FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Security analysts can insert IOC entries in their organization
CREATE POLICY "Org analysts insert IOC watchlist" 
ON ioc_watchlist FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'security_analyst')
);

-- Security analysts can update IOC entries in their organization
CREATE POLICY "Org analysts update IOC watchlist" 
ON ioc_watchlist FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'security_analyst')
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Security analysts can delete IOC entries in their organization
CREATE POLICY "Org analysts delete IOC watchlist" 
ON ioc_watchlist FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'security_analyst')
);

-- ========================================
-- 5. Fix ioc_scan_history table - organization-scoped via ioc_id
-- ========================================
DROP POLICY IF EXISTS "Users can view IOC scan history" ON ioc_scan_history;
DROP POLICY IF EXISTS "Users can insert IOC scan history" ON ioc_scan_history;
DROP POLICY IF EXISTS "Users view IOC scan history in their org" ON ioc_scan_history;
DROP POLICY IF EXISTS "System inserts IOC scan history" ON ioc_scan_history;

-- Users can only view scan history for IOCs in their organization
CREATE POLICY "Org users view IOC scan history" 
ON ioc_scan_history FOR SELECT
TO authenticated
USING (
  ioc_id IN (
    SELECT id FROM ioc_watchlist 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- System/analysts can insert scan history for IOCs in their organization
CREATE POLICY "Org system inserts IOC scan history" 
ON ioc_scan_history FOR INSERT
TO authenticated
WITH CHECK (
  ioc_id IN (
    SELECT id FROM ioc_watchlist 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);