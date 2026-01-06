import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldOff, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED' | 'LOW';

interface ThreatLevelIndicatorProps {
  level: ThreatLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const threatConfig: Record<ThreatLevel, {
  label: string;
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  CRITICAL: {
    label: 'CRITICAL',
    icon: ShieldOff,
    color: 'text-white',
    bgColor: 'bg-destructive',
    borderColor: 'border-destructive',
    description: 'Severe risk of attack',
  },
  HIGH: {
    label: 'HIGH',
    icon: ShieldAlert,
    color: 'text-white',
    bgColor: 'bg-orange-600',
    borderColor: 'border-orange-600',
    description: 'High risk of attack',
  },
  ELEVATED: {
    label: 'ELEVATED',
    icon: AlertTriangle,
    color: 'text-black',
    bgColor: 'bg-warning',
    borderColor: 'border-warning',
    description: 'Significant risk of attack',
  },
  GUARDED: {
    label: 'GUARDED',
    icon: ShieldCheck,
    color: 'text-white',
    bgColor: 'bg-accent',
    borderColor: 'border-accent',
    description: 'General risk of attack',
  },
  LOW: {
    label: 'LOW',
    icon: Info,
    color: 'text-white',
    bgColor: 'bg-success',
    borderColor: 'border-success',
    description: 'Low risk of attack',
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-3 py-1 gap-1.5',
  lg: 'text-sm px-4 py-2 gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const ThreatLevelIndicator = ({
  level,
  showLabel = true,
  size = 'md',
  animated = false,
  className,
}: ThreatLevelIndicatorProps) => {
  const config = threatConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center font-tactical tracking-wider rounded-sm border',
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        animated && level === 'CRITICAL' && 'animate-threat-pulse',
        className
      )}
      title={config.description}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export const ThreatLevelBar = ({ className }: { className?: string }) => {
  const levels: ThreatLevel[] = ['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'CRITICAL'];
  const currentLevel: ThreatLevel = 'ELEVATED'; // This would come from real data

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {levels.map((level) => (
        <div
          key={level}
          className={cn(
            'h-3 flex-1 transition-all duration-300',
            levels.indexOf(level) <= levels.indexOf(currentLevel)
              ? threatConfig[level].bgColor
              : 'bg-muted opacity-30',
            level === 'LOW' && 'rounded-l-sm',
            level === 'CRITICAL' && 'rounded-r-sm'
          )}
          title={threatConfig[level].label}
        />
      ))}
    </div>
  );
};
