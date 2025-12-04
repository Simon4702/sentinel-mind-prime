-- Honeypots for Behavioral Deception Grid
CREATE TABLE public.honeypots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'file_share', 'database', 'web_app', 'api_endpoint'
  target_ip TEXT,
  decoy_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  interactions_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deception telemetry for tracking attacker behavior
CREATE TABLE public.deception_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  honeypot_id UUID REFERENCES public.honeypots(id),
  attacker_ip TEXT,
  attacker_fingerprint JSONB,
  technique_used TEXT,
  intent_analysis TEXT,
  timeline JSONB,
  redirected_to_sandbox BOOLEAN DEFAULT false,
  sandbox_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Predictive risk scores for users/departments
CREATE TABLE public.predictive_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id),
  department_id UUID REFERENCES public.departments(id),
  insider_threat_probability NUMERIC(5,2),
  phishing_susceptibility NUMERIC(5,2),
  breach_probability NUMERIC(5,2),
  stress_indicators JSONB,
  behavior_drift_score NUMERIC(5,2),
  prediction_factors JSONB,
  predicted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cognitive profiles for users
CREATE TABLE public.cognitive_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) UNIQUE,
  profile_type TEXT NOT NULL, -- 'night_owl', 'wanderer', 'risk_taker', 'shadow', 'rookie'
  characteristics JSONB,
  detection_sensitivity NUMERIC(5,2) DEFAULT 50,
  activity_patterns JSONB,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Defense actions for Adaptive Defense Orchestration
CREATE TABLE public.defense_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  action_type TEXT NOT NULL, -- 'isolate_user', 'isolate_endpoint', 'enforce_mfa', 'reset_password', 'vpn_only', 'suspend_account'
  target_type TEXT NOT NULL, -- 'user', 'endpoint', 'department'
  target_id TEXT,
  trigger_reason TEXT,
  trigger_alert_id UUID REFERENCES public.security_alerts(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'rolled_back', 'failed'
  executed_at TIMESTAMP WITH TIME ZONE,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  auto_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Digital twin simulations
CREATE TABLE public.digital_twin_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  simulation_type TEXT NOT NULL, -- 'malware', 'insider_abuse', 'phishing', 'ransomware'
  network_architecture JSONB,
  attack_scenario JSONB,
  blast_radius JSONB,
  financial_impact_estimate NUMERIC(15,2),
  recommendations JSONB,
  status TEXT DEFAULT 'draft', -- 'draft', 'running', 'completed'
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supply chain vendors
CREATE TABLE public.supply_chain_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vendor_name TEXT NOT NULL,
  vendor_type TEXT, -- 'software', 'hardware', 'service', 'cloud'
  risk_score NUMERIC(5,2),
  last_breach_date TIMESTAMP WITH TIME ZONE,
  vulnerabilities JSONB,
  integration_status TEXT DEFAULT 'active',
  auto_isolate_on_breach BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dark web monitoring alerts
CREATE TABLE public.dark_web_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  alert_type TEXT NOT NULL, -- 'credential_leak', 'data_dump', 'impersonation', 'typosquat', 'brand_abuse'
  source TEXT,
  severity TEXT DEFAULT 'medium',
  details JSONB,
  affected_assets JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Zero trust access graph
CREATE TABLE public.zero_trust_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id),
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  access_level TEXT NOT NULL,
  actual_usage_frequency INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_least_privilege BOOLEAN DEFAULT true,
  risk_score NUMERIC(5,2),
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Red team automation results
CREATE TABLE public.red_team_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  test_type TEXT NOT NULL, -- 'phishing', 'password_spray', 'lateral_movement', 'privilege_escalation'
  target_scope JSONB,
  attack_chain JSONB,
  results JSONB,
  posture_score NUMERIC(5,2),
  vulnerabilities_found INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.honeypots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deception_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defense_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dark_web_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zero_trust_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_team_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can view honeypots" ON public.honeypots FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage honeypots" ON public.honeypots FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view deception telemetry" ON public.deception_telemetry FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert deception telemetry" ON public.deception_telemetry FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view predictive scores" ON public.predictive_risk_scores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage predictive scores" ON public.predictive_risk_scores FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view cognitive profiles" ON public.cognitive_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage cognitive profiles" ON public.cognitive_profiles FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view defense actions" ON public.defense_actions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage defense actions" ON public.defense_actions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view simulations" ON public.digital_twin_simulations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage simulations" ON public.digital_twin_simulations FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vendors" ON public.supply_chain_vendors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage vendors" ON public.supply_chain_vendors FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view dark web alerts" ON public.dark_web_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage dark web alerts" ON public.dark_web_alerts FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view zero trust access" ON public.zero_trust_access FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage zero trust access" ON public.zero_trust_access FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view red team tests" ON public.red_team_tests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage red team tests" ON public.red_team_tests FOR ALL USING (auth.uid() IS NOT NULL);