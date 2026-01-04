-- Create table for storing cyber arsenal scan results
CREATE TABLE public.cyber_arsenal_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  tool_name TEXT NOT NULL,
  target TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'ip', 'domain', 'hash', 'url'
  scan_result JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER,
  is_malicious BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cyber_arsenal_scans ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_cyber_arsenal_scans_org ON public.cyber_arsenal_scans(organization_id);
CREATE INDEX idx_cyber_arsenal_scans_tool ON public.cyber_arsenal_scans(tool_name);
CREATE INDEX idx_cyber_arsenal_scans_target ON public.cyber_arsenal_scans(target);
CREATE INDEX idx_cyber_arsenal_scans_created ON public.cyber_arsenal_scans(created_at DESC);
CREATE INDEX idx_cyber_arsenal_scans_malicious ON public.cyber_arsenal_scans(is_malicious) WHERE is_malicious = true;

-- RLS Policies
CREATE POLICY "Users can view their organization's scans"
ON public.cyber_arsenal_scans FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert scans for their organization"
ON public.cyber_arsenal_scans FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Update trigger
CREATE TRIGGER update_cyber_arsenal_scans_updated_at
BEFORE UPDATE ON public.cyber_arsenal_scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();