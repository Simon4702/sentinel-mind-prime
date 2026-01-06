import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type DefconLevel = 1 | 2 | 3 | 4 | 5;

interface DefconStatusProps {
  className?: string;
  compact?: boolean;
}

const defconConfig: Record<DefconLevel, { 
  label: string; 
  description: string; 
  color: string;
  bgClass: string;
}> = {
  1: { 
    label: 'DEFCON 1', 
    description: 'NUCLEAR WAR IMMINENT',
    color: 'text-white',
    bgClass: 'defcon-1'
  },
  2: { 
    label: 'DEFCON 2', 
    description: 'NEXT STEP TO NUCLEAR WAR',
    color: 'text-white',
    bgClass: 'defcon-2'
  },
  3: { 
    label: 'DEFCON 3', 
    description: 'INCREASE FORCE READINESS',
    color: 'text-black',
    bgClass: 'defcon-3'
  },
  4: { 
    label: 'DEFCON 4', 
    description: 'ABOVE NORMAL READINESS',
    color: 'text-white',
    bgClass: 'defcon-4'
  },
  5: { 
    label: 'DEFCON 5', 
    description: 'NORMAL PEACETIME',
    color: 'text-white',
    bgClass: 'defcon-5'
  },
};

export const DefconStatus = ({ className, compact = false }: DefconStatusProps) => {
  const [defconLevel, setDefconLevel] = useState<DefconLevel>(4);
  const [threatCount, setThreatCount] = useState(0);

  useEffect(() => {
    // Simulate threat level calculation based on active threats
    const calculateDefcon = () => {
      // This would normally come from real threat data
      const threats = Math.floor(Math.random() * 10);
      setThreatCount(threats);
      
      if (threats > 8) setDefconLevel(2);
      else if (threats > 5) setDefconLevel(3);
      else if (threats > 2) setDefconLevel(4);
      else setDefconLevel(5);
    };

    calculateDefcon();
    const interval = setInterval(calculateDefcon, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = defconConfig[defconLevel];

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-1 rounded-sm font-tactical text-xs',
        config.bgClass,
        config.color,
        className
      )}>
        <Shield className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn('tactical-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-tactical text-xs text-muted-foreground tracking-widest">
          THREAT CONDITION
        </h3>
        <Activity className="h-4 w-4 text-accent animate-tactical-pulse" />
      </div>
      
      <div className={cn(
        'text-center py-3 px-4 rounded-sm mb-3',
        config.bgClass,
        config.color
      )}>
        <div className="font-tactical text-2xl font-bold tracking-wider">
          {config.label}
        </div>
        <div className="text-xs opacity-80 mt-1 tracking-widest">
          {config.description}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="status-light active" />
          <span className="text-muted-foreground">SYSTEMS ONLINE</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <AlertTriangle className="h-3 w-3 text-warning" />
          <span className="text-warning">{threatCount} ACTIVE THREATS</span>
        </div>
      </div>

      {/* DEFCON Level Indicators */}
      <div className="flex gap-1 mt-3">
        {([5, 4, 3, 2, 1] as DefconLevel[]).map((level) => (
          <div
            key={level}
            className={cn(
              'flex-1 h-2 rounded-sm transition-all duration-300',
              level <= defconLevel ? 'opacity-30' : 'opacity-100',
              defconConfig[level].bgClass
            )}
          />
        ))}
      </div>
    </div>
  );
};
