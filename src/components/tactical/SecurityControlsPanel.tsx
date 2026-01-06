import { useState, useEffect } from 'react';
import { 
  Shield, Lock, Eye, AlertTriangle, CheckCircle, XCircle,
  Fingerprint, Key, Server, Database, Globe, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SecurityControl {
  id: string;
  name: string;
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'DISABLED';
  icon: typeof Shield;
  lastChecked: string;
  details?: string;
}

const securityControls: SecurityControl[] = [
  { id: 'mfa', name: 'Multi-Factor Auth', status: 'ACTIVE', icon: Fingerprint, lastChecked: '2s ago' },
  { id: 'encryption', name: 'Data Encryption', status: 'ACTIVE', icon: Lock, lastChecked: '5s ago' },
  { id: 'rls', name: 'Row Level Security', status: 'ACTIVE', icon: Database, lastChecked: '3s ago' },
  { id: 'audit', name: 'Audit Logging', status: 'ACTIVE', icon: Eye, lastChecked: '1s ago' },
  { id: 'network', name: 'Network Firewall', status: 'ACTIVE', icon: Globe, lastChecked: '4s ago' },
  { id: 'ids', name: 'Intrusion Detection', status: 'WARNING', icon: AlertTriangle, lastChecked: '8s ago', details: 'Elevated traffic detected' },
  { id: 'backup', name: 'Backup Systems', status: 'ACTIVE', icon: Server, lastChecked: '10s ago' },
  { id: 'keys', name: 'Key Management', status: 'ACTIVE', icon: Key, lastChecked: '6s ago' },
];

export const SecurityControlsPanel = () => {
  const [controls, setControls] = useState(securityControls);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = controls.filter(c => c.status === 'ACTIVE').length;
  const warningCount = controls.filter(c => c.status === 'WARNING').length;
  const criticalCount = controls.filter(c => c.status === 'CRITICAL').length;

  const getStatusConfig = (status: SecurityControl['status']) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: CheckCircle };
      case 'WARNING':
        return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: AlertTriangle };
      case 'CRITICAL':
        return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: XCircle };
      case 'DISABLED':
        return { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/30', icon: XCircle };
    }
  };

  return (
    <Card className="tactical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-tactical text-sm tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            SECURITY CONTROLS
          </CardTitle>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-success">{activeCount} ACTIVE</span>
            {warningCount > 0 && <span className="text-warning">{warningCount} WARN</span>}
            {criticalCount > 0 && <span className="text-destructive animate-tactical-pulse">{criticalCount} CRIT</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {controls.map((control) => {
          const statusConfig = getStatusConfig(control.status);
          const StatusIcon = statusConfig.icon;
          const ControlIcon = control.icon;

          return (
            <div
              key={control.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-sm border',
                statusConfig.bg,
                statusConfig.border
              )}
            >
              <div className="flex items-center gap-3">
                <ControlIcon className={cn('h-4 w-4', statusConfig.color)} />
                <div>
                  <p className="text-xs font-mono uppercase">{control.name}</p>
                  {control.details && (
                    <p className="text-[10px] text-muted-foreground">{control.details}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {control.lastChecked}
                </span>
                <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t border-border mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>LAST SECURITY SCAN</span>
            <span className="text-accent">{lastUpdate.toISOString().replace('T', ' ').substring(0, 19)}Z</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
