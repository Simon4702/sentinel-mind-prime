-- Fix IOC Watchlist Data Exposure - Replace overly permissive policies with organization-scoped policies

-- Drop existing permissive policies on ioc_watchlist
DROP POLICY IF EXISTS "Users can view IOC watchlist" ON public.ioc_watchlist;
DROP POLICY IF EXISTS "Users can insert IOC watchlist" ON public.ioc_watchlist;
DROP POLICY IF EXISTS "Users can update IOC watchlist" ON public.ioc_watchlist;
DROP POLICY IF EXISTS "Users can delete IOC watchlist" ON public.ioc_watchlist;

-- Create organization-scoped policies for ioc_watchlist
CREATE POLICY "Users view IOC watchlist in their org" ON public.ioc_watchlist
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Analysts insert IOC watchlist in their org" ON public.ioc_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

CREATE POLICY "Analysts update IOC watchlist in their org" ON public.ioc_watchlist
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

CREATE POLICY "Analysts delete IOC watchlist in their org" ON public.ioc_watchlist
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND public.has_role(auth.uid(), 'security_analyst')
  );

-- Drop existing permissive policies on ioc_scan_history
DROP POLICY IF EXISTS "Users can view IOC scan history" ON public.ioc_scan_history;
DROP POLICY IF EXISTS "Users can insert IOC scan history" ON public.ioc_scan_history;

-- Create organization-scoped policies for ioc_scan_history (scoped via ioc_id foreign key)
CREATE POLICY "Users view IOC scan history in their org" ON public.ioc_scan_history
  FOR SELECT
  TO authenticated
  USING (
    ioc_id IN (
      SELECT id FROM public.ioc_watchlist
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System inserts IOC scan history" ON public.ioc_scan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);