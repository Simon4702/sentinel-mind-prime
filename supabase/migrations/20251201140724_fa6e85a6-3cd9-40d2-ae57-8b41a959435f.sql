-- Create threat enrichment table to store external intelligence data
CREATE TABLE public.threat_enrichment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threat_id UUID NOT NULL REFERENCES public.threat_intelligence(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- e.g., 'virustotal', 'abuseipdb', 'alienvault'
  enrichment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  reputation_score INTEGER,
  geolocation JSONB,
  threat_actors TEXT[],
  related_campaigns TEXT[],
  enriched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enriched_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster threat lookups
CREATE INDEX idx_threat_enrichment_threat_id ON public.threat_enrichment(threat_id);
CREATE INDEX idx_threat_enrichment_source ON public.threat_enrichment(source);
CREATE INDEX idx_threat_enrichment_enriched_at ON public.threat_enrichment(enriched_at DESC);

-- Enable RLS
ALTER TABLE public.threat_enrichment ENABLE ROW LEVEL SECURITY;

-- Security analysts can view enrichment data for their organization
CREATE POLICY "Security analysts can view enrichment data"
ON public.threat_enrichment
FOR SELECT
USING (
  (get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role]))
  AND EXISTS (
    SELECT 1 FROM threat_intelligence ti
    JOIN profiles p ON p.organization_id = ti.organization_id
    WHERE ti.id = threat_enrichment.threat_id
    AND p.user_id = auth.uid()
  )
);

-- Security analysts can create enrichment data
CREATE POLICY "Security analysts can create enrichment data"
ON public.threat_enrichment
FOR INSERT
WITH CHECK (
  get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role])
);

-- Security analysts can update enrichment data
CREATE POLICY "Security analysts can update enrichment data"
ON public.threat_enrichment
FOR UPDATE
USING (
  get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role])
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_threat_enrichment_updated_at
BEFORE UPDATE ON public.threat_enrichment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();