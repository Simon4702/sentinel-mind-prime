import { useState, useEffect } from 'react';
import { Clock, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  maxSessionMinutes?: number;
  warningMinutes?: number;
  onSessionExpire?: () => void;
  className?: string;
}

export const SessionTimer = ({
  maxSessionMinutes = 30,
  warningMinutes = 5,
  onSessionExpire,
  className,
}: SessionTimerProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(maxSessionMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSessionExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSessionExpire]);

  useEffect(() => {
    const warningThreshold = warningMinutes * 60;
    const criticalThreshold = 60; // 1 minute

    setIsWarning(remainingSeconds <= warningThreshold);
    setIsCritical(remainingSeconds <= criticalThreshold);
  }, [remainingSeconds, warningMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setRemainingSeconds(maxSessionMinutes * 60);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all cursor-pointer',
        isCritical 
          ? 'border-destructive bg-destructive/10 animate-threat-pulse' 
          : isWarning 
            ? 'border-warning bg-warning/10' 
            : 'border-border bg-card',
        className
      )}
      onClick={resetSession}
      title="Click to extend session"
    >
      {isCritical ? (
        <AlertTriangle className="h-3 w-3 text-destructive" />
      ) : isWarning ? (
        <Clock className="h-3 w-3 text-warning" />
      ) : (
        <Lock className="h-3 w-3 text-accent" />
      )}
      
      <div className="flex flex-col">
        <span className={cn(
          'session-timer',
          isCritical ? 'text-destructive' : isWarning ? 'text-warning' : ''
        )}>
          SESSION: {formatTime(remainingSeconds)}
        </span>
      </div>
    </div>
  );
};
