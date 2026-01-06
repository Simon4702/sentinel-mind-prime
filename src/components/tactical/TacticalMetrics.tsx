import { Shield, AlertTriangle, Activity, Target, Eye, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Shield;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  className?: string;
}

export const TacticalMetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  status = 'normal',
  className,
}: MetricCardProps) => {
  const statusColors = {
    normal: 'border-accent/30 bg-accent/5',
    warning: 'border-warning/30 bg-warning/5',
    critical: 'border-destructive/30 bg-destructive/5',
    success: 'border-success/30 bg-success/5',
  };

  const iconColors = {
    normal: 'text-accent',
    warning: 'text-warning',
    critical: 'text-destructive animate-tactical-pulse',
    success: 'text-success',
  };

  return (
    <Card className={cn('tactical-card', statusColors[status], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-tactical tracking-widest text-muted-foreground uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-tactical font-bold tracking-wider">
                {value}
              </span>
              {trendValue && (
                <span className={cn(
                  'text-xs font-mono',
                  trend === 'up' ? 'text-destructive' : 
                  trend === 'down' ? 'text-success' : 'text-muted-foreground'
                )}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] font-mono text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-sm border',
            statusColors[status]
          )}>
            <Icon className={cn('h-6 w-6', iconColors[status])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TacticalMetricsGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <TacticalMetricCard
        title="THREAT LEVEL"
        value="ELEVATED"
        subtitle="NIST LEVEL 3"
        icon={AlertTriangle}
        status="warning"
      />
      <TacticalMetricCard
        title="ACTIVE THREATS"
        value={12}
        subtitle="3 CRITICAL"
        icon={Target}
        trend="up"
        trendValue="+4"
        status="critical"
      />
      <TacticalMetricCard
        title="SYSTEMS MONITORED"
        value={847}
        subtitle="99.7% ONLINE"
        icon={Eye}
        status="success"
      />
      <TacticalMetricCard
        title="EVENTS/SEC"
        value="2.4K"
        subtitle="PEAK: 5.2K"
        icon={Activity}
        trend="stable"
        trendValue="0%"
        status="normal"
      />
      <TacticalMetricCard
        title="BLOCKED ATTACKS"
        value={1847}
        subtitle="LAST 24H"
        icon={Shield}
        trend="down"
        trendValue="-12%"
        status="success"
      />
      <TacticalMetricCard
        title="RESPONSE TIME"
        value="1.2s"
        subtitle="AVG MTTR"
        icon={Zap}
        status="normal"
      />
    </div>
  );
};
