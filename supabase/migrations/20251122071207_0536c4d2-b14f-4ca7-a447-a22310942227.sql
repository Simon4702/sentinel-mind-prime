-- Insert sample threat intelligence data
INSERT INTO public.threat_intelligence (
  indicator_type,
  indicator_value,
  threat_type,
  severity,
  confidence_level,
  source,
  description,
  first_seen,
  last_seen,
  is_active
) VALUES
  -- Critical threats
  ('ip_address', '192.168.1.100', 'Ransomware', 'critical', 95, 'Internal IDS', 'Suspected WannaCry ransomware activity detected', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 minutes', true),
  ('domain', 'malicious-phish.example.com', 'Phishing', 'critical', 92, 'Email Gateway', 'Active phishing campaign targeting finance department', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 minutes', true),
  ('ip_address', '203.0.113.45', 'APT', 'critical', 88, 'Threat Intelligence Feed', 'Advanced Persistent Threat actor identified - APT29', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '10 minutes', true),
  
  -- High severity threats
  ('ip_address', '198.51.100.78', 'DDoS Attack', 'high', 90, 'Network Monitor', 'Distributed denial of service attack in progress', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 minutes', true),
  ('hash', 'a3f5d8e9c1b2e4f6', 'Malware', 'high', 85, 'Endpoint Protection', 'Trojan.GenericKD detected on endpoint', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '8 minutes', true),
  ('domain', 'cmd-control.darknet.io', 'C2 Server', 'high', 87, 'DNS Monitor', 'Command and control server communication detected', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 minutes', true),
  ('ip_address', '192.0.2.55', 'Data Exfiltration', 'high', 83, 'Data Loss Prevention', 'Unusual outbound data transfer detected', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '20 minutes', true),
  
  -- Medium severity threats
  ('ip_address', '172.16.0.99', 'Brute Force', 'medium', 78, 'Auth System', 'Multiple failed login attempts from single IP', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes', true),
  ('url', 'http://suspicious-download.com/payload.exe', 'Malware Distribution', 'medium', 75, 'Web Filter', 'Malware distribution site accessed', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour', true),
  ('domain', 'crypto-miner.pool.net', 'Cryptojacking', 'medium', 72, 'Network Analysis', 'Cryptocurrency mining activity detected', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '45 minutes', true),
  ('ip_address', '10.0.0.157', 'Port Scan', 'medium', 70, 'Firewall', 'Internal port scanning activity detected', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '25 minutes', true),
  
  -- Low severity threats
  ('email', 'suspicious@spam-domain.com', 'Spam', 'low', 65, 'Email Gateway', 'Spam email detected and quarantined', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '2 hours', true),
  ('ip_address', '203.0.113.200', 'Reconnaissance', 'low', 60, 'IDS', 'Reconnaissance activity observed', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '3 hours', true),
  ('domain', 'adware-tracker.ads.com', 'Adware', 'low', 58, 'Web Filter', 'Adware tracking domain accessed', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '4 hours', true);

-- Insert sample security alerts
INSERT INTO public.security_alerts (
  organization_id,
  title,
  description,
  alert_type,
  priority,
  is_acknowledged,
  is_resolved,
  source_system,
  created_at
)
SELECT 
  o.id,
  a.title,
  a.description,
  a.alert_type,
  a.priority::alert_priority,
  false,
  false,
  a.source_system,
  a.alert_created_at
FROM public.organizations o
CROSS JOIN (
  VALUES
    ('Critical Ransomware Detected', 'WannaCry ransomware variant detected on endpoint DESK-1234', 'malware_detection', 'critical', 'Endpoint Protection', NOW() - INTERVAL '5 minutes'),
    ('Phishing Attack in Progress', 'Active phishing campaign targeting finance department users', 'phishing_attempt', 'critical', 'Email Gateway', NOW() - INTERVAL '10 minutes'),
    ('Unusual Data Transfer', 'Large data transfer to external IP detected', 'data_exfiltration', 'high', 'DLP System', NOW() - INTERVAL '20 minutes'),
    ('Multiple Login Failures', 'Brute force attack detected on admin account', 'unauthorized_access', 'high', 'Authentication System', NOW() - INTERVAL '30 minutes'),
    ('Suspicious Network Activity', 'Internal port scanning activity from 10.0.0.157', 'anomalous_behavior', 'medium', 'Network Monitor', NOW() - INTERVAL '45 minutes')
) AS a(title, description, alert_type, priority, source_system, alert_created_at)
LIMIT 5;