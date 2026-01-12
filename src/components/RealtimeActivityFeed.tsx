import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  FileWarning, 
  Wifi, 
  WifiOff,
  Trash2,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  info: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const typeIcons: Record<string, React.ElementType> = {
  alert: AlertTriangle,
  event: Activity,
  incident: FileWarning,
};

export const RealtimeActivityFeed = () => {
  const { realtimeEvents, isConnected, connectionStatus, clearEvents } = useRealtimeAlerts();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Live Activity Feed</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">Live</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400">
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </>
              )}
            </div>
            {realtimeEvents.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearEvents}
                className="h-7 px-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {realtimeEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <Shield className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs opacity-70">Events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeEvents.map((event, index) => {
                const Icon = typeIcons[event.type] || Activity;
                const isNew = index === 0;
                
                return (
                  <div 
                    key={`${event.id}-${event.timestamp}`}
                    className={`
                      relative p-3 rounded-lg border transition-all duration-300
                      ${isNew ? 'animate-pulse bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${event.severity === 'critical' ? 'bg-red-500/20' : 
                          event.severity === 'high' ? 'bg-orange-500/20' : 
                          'bg-muted'}
                      `}>
                        <Icon className={`h-4 w-4 ${
                          event.severity === 'critical' ? 'text-red-400' : 
                          event.severity === 'high' ? 'text-orange-400' : 
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${severityColors[event.severity.toLowerCase()] || severityColors.info}`}
                          >
                            {event.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
