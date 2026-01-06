import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ip: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: '1', timestamp: '14:32:15Z', action: 'LOGIN', actor: 'admin@sentinel.mil', resource: 'AUTH_SYSTEM', result: 'SUCCESS', severity: 'INFO', ip: '10.0.1.50' },
  { id: '2', timestamp: '14:31:42Z', action: 'ACCESS_DENIED', actor: 'unknown', resource: 'CLASSIFIED_DATA', result: 'BLOCKED', severity: 'CRITICAL', ip: '192.168.1.105' },
  { id: '3', timestamp: '14:30:18Z', action: 'DATA_EXPORT', actor: 'analyst@sentinel.mil', resource: 'THREAT_INTEL', result: 'SUCCESS', severity: 'WARN', ip: '10.0.1.23' },
  { id: '4', timestamp: '14:29:55Z', action: 'CONFIG_CHANGE', actor: 'admin@sentinel.mil', resource: 'FIREWALL_RULES', result: 'SUCCESS', severity: 'WARN', ip: '10.0.1.50' },
  { id: '5', timestamp: '14:28:30Z', action: 'SCAN_INITIATED', actor: 'system', resource: 'IOC_WATCHLIST', result: 'SUCCESS', severity: 'INFO', ip: 'INTERNAL' },
  { id: '6', timestamp: '14:27:12Z', action: 'THREAT_DETECTED', actor: 'IDS_SYSTEM', resource: 'NETWORK_TRAFFIC', result: 'BLOCKED', severity: 'CRITICAL', ip: '45.33.32.156' },
  { id: '7', timestamp: '14:25:45Z', action: 'MFA_CHALLENGE', actor: 'user@sentinel.mil', resource: 'AUTH_SYSTEM', result: 'SUCCESS', severity: 'INFO', ip: '10.0.2.88' },
];

export const LiveAuditTrail = () => {
  const [entries, setEntries] = useState(mockAuditLog);
  const [newEntry, setNewEntry] = useState(false);

  useEffect(() => {
    // Simulate new entries
    const interval = setInterval(() => {
      setNewEntry(true);
      setTimeout(() => setNewEntry(false), 1000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getResultBadge = (result: AuditEntry['result']) => {
    switch (result) {
      case 'SUCCESS':
        return <Badge className="bg-success/20 text-success border-success/30 text-[9px]">SUCCESS</Badge>;
      case 'FAILURE':
        return <Badge className="bg-warning/20 text-warning border-warning/30 text-[9px]">FAILURE</Badge>;
      case 'BLOCKED':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[9px]">BLOCKED</Badge>;
    }
  };

  const getSeverityColor = (severity: AuditEntry['severity']) => {
    switch (severity) {
      case 'INFO': return 'text-accent';
      case 'WARN': return 'text-warning';
      case 'CRITICAL': return 'text-destructive';
    }
  };

  return (
    <Card className="tactical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-tactical text-sm tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            LIVE AUDIT TRAIL
          </CardTitle>
          <div className="flex items-center gap-2">
            <Activity className={cn(
              "h-4 w-4",
              newEntry ? "text-success animate-tactical-pulse" : "text-muted-foreground"
            )} />
            <span className="text-[10px] font-mono text-muted-foreground">
              {entries.length} EVENTS
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-border/30">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'p-3 hover:bg-muted/30 transition-colors',
                  index === 0 && newEntry && 'bg-primary/5 animate-fade-in'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-mono font-bold', getSeverityColor(entry.severity))}>
                        {entry.action}
                      </span>
                      {getResultBadge(entry.result)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
                      <span>{entry.actor}</span>
                      <span className="text-accent">→</span>
                      <span>{entry.resource}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {entry.timestamp}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                      IP: {entry.ip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
