-- Multi-tenancy and Organization Structure
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'core' CHECK (subscription_tier IN ('core', 'advanced', 'elite', 'enterprise')),
  max_users INTEGER DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Departments within organizations
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  risk_level INTEGER DEFAULT 1 CHECK (risk_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced user roles and permissions
CREATE TYPE public.permission_type AS ENUM (
  'read_users', 'write_users', 'delete_users',
  'read_threats', 'write_threats', 'manage_threats',
  'read_analytics', 'advanced_analytics', 'executive_dashboard',
  'manage_training', 'conduct_simulations',
  'system_admin', 'compliance_officer', 'security_analyst'
);

CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  permission permission_type NOT NULL,
  UNIQUE(role, permission)
);

-- Behavioral Risk Scoring
CREATE TABLE public.risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  phishing_susceptibility INTEGER DEFAULT 0 CHECK (phishing_susceptibility BETWEEN 0 AND 100),
  insider_threat_risk INTEGER DEFAULT 0 CHECK (insider_threat_risk BETWEEN 0 AND 100),
  behavior_anomaly_score INTEGER DEFAULT 0 CHECK (behavior_anomaly_score BETWEEN 0 AND 100),
  compliance_score INTEGER DEFAULT 100 CHECK (compliance_score BETWEEN 0 AND 100),
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Incidents
CREATE TYPE public.incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.incident_status AS ENUM ('open', 'investigating', 'contained', 'resolved', 'closed');
CREATE TYPE public.incident_type AS ENUM (
  'phishing_attempt', 'malware_detection', 'unauthorized_access', 
  'data_exfiltration', 'insider_threat', 'privilege_escalation',
  'anomalous_behavior', 'policy_violation', 'compliance_breach'
);

CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  incident_type incident_type NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'open',
  affected_user_id UUID REFERENCES public.profiles(user_id),
  department_id UUID REFERENCES public.departments(id),
  detection_method TEXT,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  assigned_to UUID REFERENCES public.profiles(user_id),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Threat Intelligence
CREATE TABLE public.threat_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  threat_type TEXT NOT NULL,
  source TEXT NOT NULL,
  indicator_value TEXT NOT NULL,
  indicator_type TEXT NOT NULL, -- ip, domain, hash, email, etc
  confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
  severity incident_severity NOT NULL DEFAULT 'medium',
  description TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Behavioral Analytics
CREATE TABLE public.user_behaviors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  session_id TEXT,
  activity_type TEXT NOT NULL,
  activity_details JSONB,
  risk_indicators JSONB,
  anomaly_score INTEGER CHECK (anomaly_score BETWEEN 0 AND 100),
  location_data JSONB,
  device_info JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phishing Campaigns and Training
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'completed', 'paused');

CREATE TABLE public.phishing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  status campaign_status NOT NULL DEFAULT 'draft',
  target_departments UUID[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  click_rate DECIMAL(5,2) DEFAULT 0,
  report_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training Results
CREATE TABLE public.training_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.phishing_campaigns(id) ON DELETE CASCADE,
  clicked_link BOOLEAN DEFAULT false,
  entered_credentials BOOLEAN DEFAULT false,
  reported_phishing BOOLEAN DEFAULT false,
  completion_time INTEGER, -- seconds
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  feedback_provided TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance and Audit Logs
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  result TEXT, -- success, failure, unauthorized
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time Monitoring Alerts
CREATE TYPE public.alert_priority AS ENUM ('info', 'low', 'medium', 'high', 'critical');

CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  priority alert_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  affected_user_id UUID REFERENCES public.profiles(user_id),
  source_system TEXT,
  raw_data JSONB,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(user_id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(user_id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to profiles for multi-tenancy
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.profiles ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risk_scores_updated_at BEFORE UPDATE ON public.risk_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_threat_intelligence_updated_at BEFORE UPDATE ON public.threat_intelligence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_phishing_campaigns_updated_at BEFORE UPDATE ON public.phishing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_alerts_updated_at BEFORE UPDATE ON public.security_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default organization and department
INSERT INTO public.organizations (name, domain, subscription_tier) 
VALUES ('SentinelMind Corp', 'sentinelmind.com', 'enterprise');

INSERT INTO public.departments (organization_id, name, description, risk_level)
SELECT id, 'IT Security', 'Information Technology Security Department', 5
FROM public.organizations WHERE name = 'SentinelMind Corp';

-- Insert role permissions
INSERT INTO public.role_permissions (role, permission) VALUES
('admin', 'read_users'), ('admin', 'write_users'), ('admin', 'delete_users'),
('admin', 'read_threats'), ('admin', 'write_threats'), ('admin', 'manage_threats'),
('admin', 'read_analytics'), ('admin', 'advanced_analytics'), ('admin', 'executive_dashboard'),
('admin', 'manage_training'), ('admin', 'conduct_simulations'),
('admin', 'system_admin'), ('admin', 'compliance_officer'),
('security_analyst', 'read_users'), ('security_analyst', 'read_threats'), ('security_analyst', 'write_threats'),
('security_analyst', 'read_analytics'), ('security_analyst', 'advanced_analytics'),
('security_analyst', 'manage_training'), ('security_analyst', 'conduct_simulations'),
('employee', 'read_analytics');

-- Update admin user
UPDATE public.profiles 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'SentinelMind Corp'),
    department_id = (SELECT id FROM public.departments WHERE name = 'IT Security')
WHERE email = 'simonnyangala089@gmail.com';