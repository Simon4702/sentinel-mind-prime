import { useState } from "react";
import {
  Terminal,
  Shield,
  Bug,
  Radar,
  Fingerprint,
  Network,
  Lock,
  Skull,
  Scan,
  Binary,
  FileSearch,
  Globe,
  Server,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CyberTool {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  category: "offensive" | "defensive" | "recon" | "forensics";
  status: "active" | "standby" | "offline";
  description: string;
}

const cyberTools: CyberTool[] = [
  {
    id: "kali",
    name: "Kali Linux",
    shortName: "KALI",
    icon: Skull,
    category: "offensive",
    status: "active",
    description: "Penetration testing & ethical hacking",
  },
  {
    id: "metasploit",
    name: "Metasploit",
    shortName: "MSF",
    icon: Bug,
    category: "offensive",
    status: "active",
    description: "Exploitation framework",
  },
  {
    id: "nmap",
    name: "Nmap Scanner",
    shortName: "NMAP",
    icon: Radar,
    category: "recon",
    status: "active",
    description: "Network discovery & security auditing",
  },
  {
    id: "wireshark",
    name: "Wireshark",
    shortName: "WSHK",
    icon: Network,
    category: "forensics",
    status: "standby",
    description: "Network protocol analyzer",
  },
  {
    id: "burp",
    name: "Burp Suite",
    shortName: "BURP",
    icon: Globe,
    category: "offensive",
    status: "active",
    description: "Web vulnerability scanner",
  },
  {
    id: "hashcat",
    name: "Hashcat",
    shortName: "HASH",
    icon: Lock,
    category: "offensive",
    status: "standby",
    description: "Password recovery tool",
  },
  {
    id: "autopsy",
    name: "Autopsy",
    shortName: "AUTO",
    icon: FileSearch,
    category: "forensics",
    status: "active",
    description: "Digital forensics platform",
  },
  {
    id: "volatility",
    name: "Volatility",
    shortName: "VOL",
    icon: Binary,
    category: "forensics",
    status: "standby",
    description: "Memory forensics framework",
  },
  {
    id: "snort",
    name: "Snort IDS",
    shortName: "SNRT",
    icon: Shield,
    category: "defensive",
    status: "active",
    description: "Intrusion detection system",
  },
  {
    id: "osquery",
    name: "OSQuery",
    shortName: "OSQ",
    icon: Terminal,
    category: "defensive",
    status: "active",
    description: "Endpoint visibility",
  },
  {
    id: "zeek",
    name: "Zeek (Bro)",
    shortName: "ZEEK",
    icon: Scan,
    category: "defensive",
    status: "active",
    description: "Network security monitor",
  },
  {
    id: "misp",
    name: "MISP",
    shortName: "MISP",
    icon: Fingerprint,
    category: "defensive",
    status: "standby",
    description: "Threat intelligence platform",
  },
];

const categoryColors = {
  offensive: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
  defensive: "from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400",
  recon: "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400",
  forensics: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
};

const statusColors = {
  active: "bg-emerald-500",
  standby: "bg-amber-500",
  offline: "bg-red-500",
};

export const CyberToolsSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const categories = [
    { id: "offensive", label: "OFFENSIVE", icon: Skull },
    { id: "defensive", label: "DEFENSIVE", icon: Shield },
    { id: "recon", label: "RECON", icon: Radar },
    { id: "forensics", label: "FORENSICS", icon: FileSearch },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative h-full border-r border-border/50 bg-gradient-to-b from-background via-card to-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Military-grade header */}
        <div className="p-3 border-b border-border/50 bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-red-400 tracking-widest">
                  CYBER ARSENAL
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-56px)]">
          <div className="p-2 space-y-4">
            {categories.map((category) => (
              <div key={category.id}>
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <category.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-widest">
                      {category.label}
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                )}
                <div className="space-y-1">
                  {cyberTools
                    .filter((tool) => tool.category === category.id)
                    .map((tool) => (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedTool(tool.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                              "bg-gradient-to-r border",
                              categoryColors[tool.category],
                              "hover:scale-[1.02] hover:shadow-lg",
                              selectedTool === tool.id && "ring-1 ring-primary/50"
                            )}
                          >
                            <div className="relative">
                              <tool.icon
                                className={cn(
                                  "h-4 w-4 transition-transform group-hover:scale-110",
                                  tool.category === "offensive" && "text-red-400",
                                  tool.category === "defensive" && "text-emerald-400",
                                  tool.category === "recon" && "text-blue-400",
                                  tool.category === "forensics" && "text-amber-400"
                                )}
                              />
                              <div
                                className={cn(
                                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                                  statusColors[tool.status]
                                )}
                              />
                            </div>
                            {!isCollapsed && (
                              <>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-xs font-semibold truncate text-foreground">
                                    {tool.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {tool.description}
                                  </p>
                                </div>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                              </>
                            )}
                          </button>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="font-mono">
                            <p className="font-bold">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Status footer */}
          {!isCollapsed && (
            <div className="p-3 border-t border-border/50 mt-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-400">
                    {cyberTools.filter((t) => t.status === "active").length}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400/60">ACTIVE</div>
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-lg font-bold text-amber-400">
                    {cyberTools.filter((t) => t.status === "standby").length}
                  </div>
                  <div className="text-[9px] font-mono text-amber-400/60">STANDBY</div>
                </div>
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-lg font-bold text-red-400">
                    {cyberTools.filter((t) => t.status === "offline").length}
                  </div>
                  <div className="text-[9px] font-mono text-red-400/60">OFFLINE</div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default CyberToolsSidebar;
