-- Enable realtime for threat intelligence table
ALTER TABLE public.threat_intelligence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.threat_intelligence;

-- Enable realtime for security alerts
ALTER TABLE public.security_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;

-- Enable realtime for security incidents
ALTER TABLE public.security_incidents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_incidents;