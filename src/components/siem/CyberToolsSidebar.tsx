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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Square,
  Settings,
  Activity,
  Clock,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CyberTool {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  category: "offensive" | "defensive" | "recon" | "forensics";
  status: "active" | "standby" | "offline";
  description: string;
  version: string;
  lastRun?: string;
  commands: string[];
}

const cyberTools: CyberTool[] = [
  {
    id: "kali",
    name: "Kali Linux",
    shortName: "KALI",
    icon: Skull,
    category: "offensive",
    status: "active",
    description: "Penetration testing & ethical hacking distribution",
    version: "2024.1",
    lastRun: "2 hours ago",
    commands: ["msfconsole", "aircrack-ng", "john", "hydra"],
  },
  {
    id: "metasploit",
    name: "Metasploit Framework",
    shortName: "MSF",
    icon: Bug,
    category: "offensive",
    status: "active",
    description: "Exploitation framework for penetration testing",
    version: "6.3.44",
    lastRun: "45 min ago",
    commands: ["use exploit/multi/handler", "search cve:2024", "db_nmap -sV target"],
  },
  {
    id: "nmap",
    name: "Nmap Scanner",
    shortName: "NMAP",
    icon: Radar,
    category: "recon",
    status: "active",
    description: "Network discovery & security auditing tool",
    version: "7.94",
    lastRun: "10 min ago",
    commands: ["nmap -sS -sV target", "nmap -A -T4 target", "nmap --script vuln target"],
  },
  {
    id: "wireshark",
    name: "Wireshark",
    shortName: "WSHK",
    icon: Network,
    category: "forensics",
    status: "standby",
    description: "Network protocol analyzer for traffic inspection",
    version: "4.2.2",
    commands: ["capture start", "filter: tcp.port == 443", "follow tcp stream"],
  },
  {
    id: "burp",
    name: "Burp Suite Pro",
    shortName: "BURP",
    icon: Globe,
    category: "offensive",
    status: "active",
    description: "Web application security testing platform",
    version: "2024.1.1",
    lastRun: "1 hour ago",
    commands: ["spider target", "active scan", "intruder attack"],
  },
  {
    id: "hashcat",
    name: "Hashcat",
    shortName: "HASH",
    icon: Lock,
    category: "offensive",
    status: "standby",
    description: "Advanced password recovery utility",
    version: "6.2.6",
    commands: ["hashcat -m 0 hash.txt wordlist.txt", "hashcat --show", "-a 3 ?a?a?a?a"],
  },
  {
    id: "autopsy",
    name: "Autopsy",
    shortName: "AUTO",
    icon: FileSearch,
    category: "forensics",
    status: "active",
    description: "Digital forensics platform for evidence analysis",
    version: "4.21.0",
    lastRun: "3 hours ago",
    commands: ["new case", "add data source", "run ingest modules"],
  },
  {
    id: "volatility",
    name: "Volatility 3",
    shortName: "VOL",
    icon: Binary,
    category: "forensics",
    status: "standby",
    description: "Memory forensics framework for incident response",
    version: "3.0.0",
    commands: ["vol -f dump.raw windows.info", "windows.pslist", "windows.netscan"],
  },
  {
    id: "snort",
    name: "Snort IDS",
    shortName: "SNRT",
    icon: Shield,
    category: "defensive",
    status: "active",
    description: "Network intrusion detection & prevention system",
    version: "3.1.58",
    lastRun: "Running",
    commands: ["snort -A console", "snort -c snort.conf", "snort --rule-info"],
  },
  {
    id: "osquery",
    name: "OSQuery",
    shortName: "OSQ",
    icon: Terminal,
    category: "defensive",
    status: "active",
    description: "SQL-powered endpoint visibility platform",
    version: "5.11.0",
    lastRun: "Running",
    commands: ["SELECT * FROM processes;", "SELECT * FROM listening_ports;", "osqueryi"],
  },
  {
    id: "zeek",
    name: "Zeek (Bro)",
    shortName: "ZEEK",
    icon: Scan,
    category: "defensive",
    status: "active",
    description: "Network security monitor & traffic analyzer",
    version: "6.2.0",
    lastRun: "Running",
    commands: ["zeekctl deploy", "zeekctl status", "zeek -r capture.pcap"],
  },
  {
    id: "misp",
    name: "MISP",
    shortName: "MISP",
    icon: Fingerprint,
    category: "defensive",
    status: "standby",
    description: "Threat intelligence sharing platform",
    version: "2.4.183",
    commands: ["sync feeds", "create event", "export IOCs"],
  },
];

const categoryColors = {
  offensive: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
  defensive: "from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400",
  recon: "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400",
  forensics: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
};

const categoryBgColors = {
  offensive: "bg-red-500/10 border-red-500/30",
  defensive: "bg-emerald-500/10 border-emerald-500/30",
  recon: "bg-blue-500/10 border-blue-500/30",
  forensics: "bg-amber-500/10 border-amber-500/30",
};

const statusColors = {
  active: "bg-emerald-500",
  standby: "bg-amber-500",
  offline: "bg-red-500",
};

const statusLabels = {
  active: "ONLINE",
  standby: "STANDBY",
  offline: "OFFLINE",
};

export const CyberToolsSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<CyberTool | null>(null);
  const { toast } = useToast();

  const categories = [
    { id: "offensive", label: "OFFENSIVE", icon: Skull },
    { id: "defensive", label: "DEFENSIVE", icon: Shield },
    { id: "recon", label: "RECON", icon: Radar },
    { id: "forensics", label: "FORENSICS", icon: FileSearch },
  ] as const;

  const handleToolAction = (action: string, tool: CyberTool) => {
    toast({
      title: `${action} ${tool.name}`,
      description: action === "start" 
        ? `Initializing ${tool.name}...` 
        : action === "stop"
        ? `Stopping ${tool.name}...`
        : `Opening ${tool.name} configuration...`,
    });
  };

  const handleRunCommand = (command: string, tool: CyberTool) => {
    toast({
      title: "Command Executed",
      description: `Running: ${command}`,
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative h-full border-r border-border/50 bg-gradient-to-b from-background via-card to-background transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-14" : "w-56"
        )}
      >
        {/* Military-grade header */}
        <div className="p-2 border-b border-border/50 bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest">
                  ARSENAL
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-44px)]">
          <div className="p-1.5 space-y-3">
            {categories.map((category) => (
              <div key={category.id}>
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 mb-1">
                    <category.icon className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-widest">
                      {category.label}
                    </span>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>
                )}
                <div className="space-y-0.5">
                  {cyberTools
                    .filter((tool) => tool.category === category.id)
                    .map((tool) => (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedTool(tool)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group",
                              "bg-gradient-to-r border",
                              categoryColors[tool.category],
                              "hover:scale-[1.01] hover:shadow-md",
                              selectedTool?.id === tool.id && "ring-1 ring-primary/50"
                            )}
                          >
                            <div className="relative flex-shrink-0">
                              <tool.icon
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform group-hover:scale-110",
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
                              <span className="text-[10px] font-mono font-semibold truncate text-foreground">
                                {tool.shortName}
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-mono text-xs">
                          <p className="font-bold">{tool.name}</p>
                          <p className="text-muted-foreground text-[10px]">
                            {tool.description}
                          </p>
                          <p className="text-primary text-[10px] mt-1">Click to open</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Status footer */}
          {!isCollapsed && (
            <div className="p-2 border-t border-border/50 mt-2">
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-sm font-bold text-emerald-400">
                    {cyberTools.filter((t) => t.status === "active").length}
                  </div>
                  <div className="text-[8px] font-mono text-emerald-400/60">ON</div>
                </div>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-sm font-bold text-amber-400">
                    {cyberTools.filter((t) => t.status === "standby").length}
                  </div>
                  <div className="text-[8px] font-mono text-amber-400/60">SBY</div>
                </div>
                <div className="p-1 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-sm font-bold text-red-400">
                    {cyberTools.filter((t) => t.status === "offline").length}
                  </div>
                  <div className="text-[8px] font-mono text-red-400/60">OFF</div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Tool Detail Modal */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-lg border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl border",
                    categoryBgColors[selectedTool.category]
                  )}>
                    <selectedTool.icon className={cn(
                      "h-6 w-6",
                      selectedTool.category === "offensive" && "text-red-400",
                      selectedTool.category === "defensive" && "text-emerald-400",
                      selectedTool.category === "recon" && "text-blue-400",
                      selectedTool.category === "forensics" && "text-amber-400"
                    )} />
                  </div>
                  <div>
                    <DialogTitle className="font-mono text-lg flex items-center gap-2">
                      {selectedTool.name}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-mono",
                          selectedTool.status === "active" && "border-emerald-500/50 text-emerald-400",
                          selectedTool.status === "standby" && "border-amber-500/50 text-amber-400",
                          selectedTool.status === "offline" && "border-red-500/50 text-red-400"
                        )}
                      >
                        {statusLabels[selectedTool.status]}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs">
                      {selectedTool.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="font-mono text-xs bg-background/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="commands">Commands</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-[10px] font-mono text-muted-foreground">VERSION</p>
                      <p className="font-mono font-bold text-primary">{selectedTool.version}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-[10px] font-mono text-muted-foreground">LAST RUN</p>
                      <p className="font-mono font-bold text-foreground">{selectedTool.lastRun || "Never"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedTool.status !== "active" ? (
                      <Button 
                        className="flex-1 font-mono bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleToolAction("start", selectedTool)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        START
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive"
                        className="flex-1 font-mono"
                        onClick={() => handleToolAction("stop", selectedTool)}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        STOP
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="font-mono border-primary/30"
                      onClick={() => handleToolAction("configure", selectedTool)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="commands" className="mt-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground mb-2">QUICK COMMANDS</p>
                    {selectedTool.commands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => handleRunCommand(cmd, selectedTool)}
                        className="w-full text-left p-2 rounded-md bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono text-primary">{cmd}</code>
                          <Play className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default CyberToolsSidebar;
