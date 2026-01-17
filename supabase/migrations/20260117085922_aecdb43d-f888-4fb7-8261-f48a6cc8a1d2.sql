-- Create escalation rules table
CREATE TABLE public.alert_escalation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  rule_name TEXT NOT NULL,
  description TEXT,
  severity_trigger TEXT[] NOT NULL DEFAULT ARRAY['critical', 'high'],
  response_time_minutes INTEGER NOT NULL DEFAULT 30,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  escalation_target_type TEXT NOT NULL DEFAULT 'role',
  escalation_target TEXT NOT NULL,
  notification_channels TEXT[] DEFAULT ARRAY['email'],
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escalation history table to track triggered escalations
CREATE TABLE public.alert_escalation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.alert_escalation_rules(id) ON DELETE SET NULL,
  alert_id UUID REFERENCES public.security_alerts(id) ON DELETE CASCADE,
  escalated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  escalation_level INTEGER NOT NULL,
  escalated_to TEXT NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES public.profiles(user_id)
);

-- Enable RLS
ALTER TABLE public.alert_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_escalation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for escalation rules (admin only for write, analysts can read)
CREATE POLICY "Admins can manage escalation rules"
ON public.alert_escalation_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts can view escalation rules"
ON public.alert_escalation_rules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'security_analyst'));

-- RLS policies for escalation history
CREATE POLICY "Authenticated users can view escalation history"
ON public.alert_escalation_history
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert escalation history"
ON public.alert_escalation_history
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Analysts can update escalation history"
ON public.alert_escalation_history
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'security_analyst') OR public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_alert_escalation_rules_updated_at
BEFORE UPDATE ON public.alert_escalation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();