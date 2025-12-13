-- Enable realtime for security_alerts table
ALTER TABLE public.security_alerts REPLICA IDENTITY FULL;

-- Enable realtime for threat_intelligence table
ALTER TABLE public.threat_intelligence REPLICA IDENTITY FULL;

-- Enable realtime for security_incidents table  
ALTER TABLE public.security_incidents REPLICA IDENTITY FULL;