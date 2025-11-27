-- Create security_playbooks table
CREATE TABLE public.security_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  incident_type incident_type NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_time_minutes INTEGER,
  severity incident_severity,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_playbooks ENABLE ROW LEVEL SECURITY;

-- Policies for security_playbooks
CREATE POLICY "Users can view playbooks in their organization"
  ON public.security_playbooks
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Security analysts can manage playbooks"
  ON public.security_playbooks
  FOR ALL
  USING (
    (get_user_role() = ANY(ARRAY['admin'::user_role, 'security_analyst'::user_role]))
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    (get_user_role() = ANY(ARRAY['admin'::user_role, 'security_analyst'::user_role]))
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create playbook_executions table to track when playbooks are used
CREATE TABLE public.playbook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.security_playbooks(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL,
  executed_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER NOT NULL DEFAULT 0,
  step_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on playbook_executions
ALTER TABLE public.playbook_executions ENABLE ROW LEVEL SECURITY;

-- Policies for playbook_executions
CREATE POLICY "Users can view executions for their organization's incidents"
  ON public.playbook_executions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM security_incidents si
      JOIN profiles p ON p.organization_id = si.organization_id
      WHERE si.id = playbook_executions.incident_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Security analysts can manage playbook executions"
  ON public.playbook_executions
  FOR ALL
  USING (
    get_user_role() = ANY(ARRAY['admin'::user_role, 'security_analyst'::user_role])
  )
  WITH CHECK (
    get_user_role() = ANY(ARRAY['admin'::user_role, 'security_analyst'::user_role])
  );

-- Create updated_at trigger for security_playbooks
CREATE TRIGGER update_security_playbooks_updated_at
  BEFORE UPDATE ON public.security_playbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for playbook_executions
CREATE TRIGGER update_playbook_executions_updated_at
  BEFORE UPDATE ON public.playbook_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();