-- Create table for SIEM agents deployed across the organization
CREATE TABLE public.siem_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  agent_name TEXT NOT NULL,
  hostname TEXT NOT NULL,
  ip_address TEXT,
  agent_type TEXT NOT NULL DEFAULT 'endpoint',
  os_type TEXT,
  os_version TEXT,
  agent_version TEXT DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'offline',
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  last_event_at TIMESTAMP WITH TIME ZONE,
  events_collected INTEGER DEFAULT 0,
  alerts_generated INTEGER DEFAULT 0,
  cpu_usage NUMERIC DEFAULT 0,
  memory_usage NUMERIC DEFAULT 0,
  disk_usage NUMERIC DEFAULT 0,
  network_bytes_in BIGINT DEFAULT 0,
  network_bytes_out BIGINT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}'::jsonb,
  location JSONB DEFAULT '{}'::jsonb,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for SIEM events collected by agents
CREATE TABLE public.siem_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.siem_agents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  source TEXT NOT NULL,
  category TEXT,
  message TEXT NOT NULL,
  raw_log TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  source_ip TEXT,
  destination_ip TEXT,
  source_port INTEGER,
  destination_port INTEGER,
  protocol TEXT,
  user_name TEXT,
  process_name TEXT,
  file_path TEXT,
  hash TEXT,
  is_alert BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  correlation_id TEXT,
  mitre_tactic TEXT,
  mitre_technique TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for SIEM agent groups
CREATE TABLE public.siem_agent_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  group_name TEXT NOT NULL,
  description TEXT,
  agent_count INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'server',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for correlation rules
CREATE TABLE public.siem_correlation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  rule_name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  severity TEXT DEFAULT 'medium',
  is_enabled BOOLEAN DEFAULT true,
  times_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_siem_events_agent ON public.siem_events(agent_id);
CREATE INDEX idx_siem_events_timestamp ON public.siem_events(timestamp DESC);
CREATE INDEX idx_siem_events_severity ON public.siem_events(severity);
CREATE INDEX idx_siem_events_org ON public.siem_events(organization_id);
CREATE INDEX idx_siem_agents_org ON public.siem_agents(organization_id);
CREATE INDEX idx_siem_agents_status ON public.siem_agents(status);

-- Enable RLS
ALTER TABLE public.siem_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siem_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siem_agent_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siem_correlation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view agents in their organization"
  ON public.siem_agents FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Security analysts can manage agents"
  ON public.siem_agents FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role]));

CREATE POLICY "Users can view events in their organization"
  ON public.siem_events FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Security analysts can manage events"
  ON public.siem_events FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role]));

CREATE POLICY "Users can view agent groups"
  ON public.siem_agent_groups FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Security analysts can manage agent groups"
  ON public.siem_agent_groups FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role]));

CREATE POLICY "Users can view correlation rules"
  ON public.siem_correlation_rules FOR SELECT
  USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Security analysts can manage correlation rules"
  ON public.siem_correlation_rules FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'security_analyst'::user_role]));

-- Enable realtime for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.siem_agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.siem_events;

-- Triggers for updated_at
CREATE TRIGGER update_siem_agents_updated_at
  BEFORE UPDATE ON public.siem_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_siem_agent_groups_updated_at
  BEFORE UPDATE ON public.siem_agent_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_siem_correlation_rules_updated_at
  BEFORE UPDATE ON public.siem_correlation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();