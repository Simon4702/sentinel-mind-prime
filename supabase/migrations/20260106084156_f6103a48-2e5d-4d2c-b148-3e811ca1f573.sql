-- Create IOC watchlist table for automated monitoring
CREATE TABLE public.ioc_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip', 'domain', 'hash', 'url')),
  indicator_value TEXT NOT NULL,
  description TEXT,
  last_scan_at TIMESTAMPTZ,
  last_risk_score INTEGER,
  previous_risk_score INTEGER,
  is_malicious BOOLEAN DEFAULT false,
  was_malicious BOOLEAN DEFAULT false,
  scan_frequency_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  alert_on_change BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, indicator_type, indicator_value)
);

-- Create IOC scan history for tracking changes
CREATE TABLE public.ioc_scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ioc_id UUID NOT NULL REFERENCES public.ioc_watchlist(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  risk_score INTEGER,
  is_malicious BOOLEAN,
  scan_result JSONB DEFAULT '{}',
  reputation_change INTEGER,
  alert_generated BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.ioc_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ioc_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for ioc_watchlist
CREATE POLICY "Users can view IOC watchlist" ON public.ioc_watchlist
  FOR SELECT USING (true);

CREATE POLICY "Users can insert IOC watchlist" ON public.ioc_watchlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update IOC watchlist" ON public.ioc_watchlist
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete IOC watchlist" ON public.ioc_watchlist
  FOR DELETE USING (true);

-- RLS policies for ioc_scan_history
CREATE POLICY "Users can view IOC scan history" ON public.ioc_scan_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert IOC scan history" ON public.ioc_scan_history
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_ioc_watchlist_active ON public.ioc_watchlist(is_active, last_scan_at);
CREATE INDEX idx_ioc_watchlist_indicator ON public.ioc_watchlist(indicator_type, indicator_value);
CREATE INDEX idx_ioc_scan_history_ioc_id ON public.ioc_scan_history(ioc_id, scanned_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_ioc_watchlist_updated_at
  BEFORE UPDATE ON public.ioc_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();