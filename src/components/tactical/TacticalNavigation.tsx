import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Shield,
  Brain,
  Eye,
  Target,
  AlertTriangle,
  Activity,
  Settings,
  BarChart3,
  TrendingUp,
  Zap,
  Server,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    name: "COMMAND",
    path: "/",
    icon: Activity,
    code: "CMD-01",
    roles: ["admin", "security_analyst", "employee"],
  },
  {
    name: "BEHAVIORAL",
    path: "/behavior-engine",
    icon: Brain,
    code: "BHV-02",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "SURVEILLANCE",
    path: "/threat-monitoring",
    icon: Eye,
    code: "SRV-03",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "RESPONSE",
    path: "/incident-response",
    icon: AlertTriangle,
    code: "RSP-04",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "THREAT OPS",
    path: "/threat-management",
    icon: Shield,
    code: "TOP-05",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "TRAINING",
    path: "/phishing-training",
    icon: Target,
    code: "TRN-06",
    roles: ["admin", "security_analyst", "employee"],
  },
  {
    name: "INTEL",
    path: "/analytics",
    icon: BarChart3,
    code: "INT-07",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "SITREP",
    path: "/executive",
    icon: TrendingUp,
    code: "SIT-08",
    roles: ["admin"],
  },
  {
    name: "ARSENAL",
    path: "/advanced-security",
    icon: Zap,
    code: "ARS-09",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "SIEM",
    path: "/siem",
    icon: Server,
    code: "SIM-10",
    roles: ["admin", "security_analyst"],
  },
  {
    name: "ADMIN",
    path: "/admin",
    icon: Settings,
    code: "ADM-11",
    roles: ["admin"],
  },
];

export const TacticalNavigation = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    profile?.role ? item.roles.includes(profile.role) : false
  );

  return (
    <nav className="border-b border-accent/20 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-2 px-4 py-3 text-xs font-tactical tracking-wider whitespace-nowrap transition-all relative",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
                
                {/* Nav item code */}
                <span className={cn(
                  "text-[9px] font-mono px-1 rounded-sm border",
                  isActive 
                    ? "border-primary/50 text-primary" 
                    : "border-border text-muted-foreground group-hover:border-accent/50"
                )}>
                  {item.code}
                </span>
                
                <Icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent"
                )} />
                
                <span>{item.name}</span>
                
                {isActive && (
                  <ChevronRight className="h-3 w-3 text-primary ml-1" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
