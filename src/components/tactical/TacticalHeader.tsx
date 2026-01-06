import { Shield, Radio, Wifi, Lock, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { NotificationCenter } from '@/components/NotificationCenter';
import { DefconStatus } from './DefconStatus';
import { SessionTimer } from './SessionTimer';
import { ClassificationBadge, ClassificationLevel } from './ClassificationBanner';
import { cn } from '@/lib/utils';

interface TacticalHeaderProps {
  classification?: ClassificationLevel;
}

export const TacticalHeader = ({ classification = 'UNCLASSIFIED' }: TacticalHeaderProps) => {
  const { profile } = useAuth();

  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';

  return (
    <header className="border-b border-accent/30 bg-gradient-tactical sticky top-0 z-50">
      {/* Top Status Bar */}
      <div className="border-b border-accent/20 bg-black/40 px-4 py-1">
        <div className="container mx-auto flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="status-light active" />
              SECURE CONNECTION
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              TLS 1.3 / AES-256-GCM
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-success" />
              NETWORK: OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{currentTime}</span>
            <ClassificationBadge level={classification} />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-primary rounded-sm flex items-center justify-center bg-black/50">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-tactical-pulse" />
            </div>
            <div>
              <h1 className="font-tactical text-xl tracking-wider text-primary">
                SENTINEL PRIME
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <Radio className="h-3 w-3" />
                <span>TACTICAL DEFENSE OPERATIONS CENTER</span>
                <span className="text-accent">|</span>
                <span className="text-accent">{profile?.department || 'SOC'}</span>
              </div>
            </div>
          </div>

          {/* Center Status */}
          <div className="hidden lg:flex items-center gap-4">
            <DefconStatus compact />
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-mono">
              <Eye className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">OPERATOR:</span>
              <span className="text-accent font-medium uppercase">
                {profile?.full_name || 'UNKNOWN'}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <SessionTimer maxSessionMinutes={30} />
            <NotificationCenter />
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
