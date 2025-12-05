-- Insert demo organization
INSERT INTO public.organizations (id, name, domain, subscription_tier, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sentinel Security Corp', 'sentinel-sec.com', 'enterprise', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo threat intelligence
INSERT INTO public.threat_intelligence (organization_id, threat_type, indicator_type, indicator_value, source, severity, confidence_level, description, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'malware', 'ip', '192.168.1.100', 'Internal Detection', 'high', 85, 'Suspicious outbound traffic to known C2 server', true),
  ('00000000-0000-0000-0000-000000000001', 'phishing', 'domain', 'fake-login.example.com', 'Email Gateway', 'critical', 95, 'Credential harvesting attempt targeting employees', true),
  ('00000000-0000-0000-0000-000000000001', 'ransomware', 'hash', 'a1b2c3d4e5f6789012345678', 'Endpoint Protection', 'critical', 90, 'Known ransomware variant detected', true),
  ('00000000-0000-0000-0000-000000000001', 'data_exfiltration', 'ip', '10.0.0.55', 'DLP System', 'medium', 70, 'Unusual data transfer patterns', true),
  (NULL, 'apt', 'domain', 'apt-group-c2.net', 'Threat Feed', 'high', 80, 'APT group infrastructure', true);

-- Insert demo security alerts
INSERT INTO public.security_alerts (organization_id, title, description, alert_type, priority, source_system, is_acknowledged, is_resolved)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Multiple Failed Login Attempts', 'User account experienced 15 failed login attempts in 5 minutes', 'brute_force', 'high', 'IAM System', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Suspicious Email Attachment', 'Macro-enabled document detected from unknown sender', 'phishing', 'critical', 'Email Gateway', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Unusual Network Traffic', 'Spike in outbound traffic to foreign IP addresses', 'network_anomaly', 'medium', 'Network Monitor', true, false),
  ('00000000-0000-0000-0000-000000000001', 'Endpoint Protection Disabled', 'Antivirus service stopped on workstation WS-042', 'endpoint', 'high', 'Endpoint Agent', false, false);

-- Insert demo honeypots
INSERT INTO public.honeypots (organization_id, name, type, target_ip, is_active, interactions_count)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'SSH Honeypot Alpha', 'ssh', '10.100.1.10', true, 47),
  ('00000000-0000-0000-0000-000000000001', 'Web Server Decoy', 'http', '10.100.1.20', true, 123),
  ('00000000-0000-0000-0000-000000000001', 'Database Trap', 'database', '10.100.1.30', true, 12);

-- Insert demo supply chain vendors
INSERT INTO public.supply_chain_vendors (organization_id, vendor_name, vendor_type, risk_score, integration_status, auto_isolate_on_breach)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'CloudHost Pro', 'infrastructure', 25, 'active', true),
  ('00000000-0000-0000-0000-000000000001', 'PaymentGate Inc', 'payment_processor', 45, 'active', true),
  ('00000000-0000-0000-0000-000000000001', 'DevTools Corp', 'software', 60, 'monitoring', false),
  ('00000000-0000-0000-0000-000000000001', 'DataSync Ltd', 'data_integration', 35, 'active', true);

-- Insert demo dark web alerts
INSERT INTO public.dark_web_alerts (organization_id, alert_type, severity, source, details, is_resolved)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'credential_leak', 'critical', 'Dark Web Forum', '{"emails_found": 12, "forum_name": "BreachForums"}', false),
  ('00000000-0000-0000-0000-000000000001', 'domain_mention', 'medium', 'Paste Site', '{"context": "domain listed in target list", "paste_id": "abc123"}', false);

-- Insert demo red team tests
INSERT INTO public.red_team_tests (organization_id, test_type, status, posture_score, vulnerabilities_found, target_scope, results)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'penetration_test', 'completed', 78, 5, '{"networks": ["10.0.0.0/24"], "applications": ["portal.sentinel-sec.com"]}', '{"critical": 1, "high": 2, "medium": 2}'),
  ('00000000-0000-0000-0000-000000000001', 'social_engineering', 'in_progress', null, 2, '{"departments": ["Finance", "HR"]}', null);