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
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: Activity,
    roles: ["admin", "security_analyst", "employee"],
  },
  {
    name: "Behavior Engine",
    path: "/behavior-engine",
    icon: Brain,
    roles: ["admin", "security_analyst"],
  },
  {
    name: "Threat Monitoring",
    path: "/threat-monitoring",
    icon: Eye,
    roles: ["admin", "security_analyst"],
  },
  {
    name: "Incident Response",
    path: "/incident-response",
    icon: AlertTriangle,
    roles: ["admin", "security_analyst"],
  },
  {
    name: "Threat Management",
    path: "/threat-management",
    icon: Shield,
    roles: ["admin", "security_analyst"],
  },
  {
    name: "Phishing Training",
    path: "/phishing-training",
    icon: Target,
    roles: ["admin", "security_analyst", "employee"],
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["admin", "security_analyst"],
  },
  {
    name: "Admin Panel",
    path: "/admin",
    icon: Settings,
    roles: ["admin"],
  },
];

export const Navigation = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    profile?.role ? item.roles.includes(profile.role) : false
  );

  return (
    <nav className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
