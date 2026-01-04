import { useState, useRef, useEffect } from "react";
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
  Play,
  Square,
  Loader2,
  Send,
  Trash2,
  Search,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CyberTool {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  category: "offensive" | "defensive" | "recon" | "forensics" | "intel";
  status: "active" | "standby" | "offline";
  description: string;
  version: string;
  lastRun?: string;
  commands: string[];
  requiresTarget?: boolean;
  targetPlaceholder?: string;
  isRealApi?: boolean;
}

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: Date;
}

const cyberTools: CyberTool[] = [
  // Real API integrations
  {
    id: "virustotal",
    name: "VirusTotal",
    shortName: "VT",
    icon: Eye,
    category: "intel",
    status: "active",
    description: "Analyze files, domains, IPs and URLs for malware",
    version: "API v3",
    commands: ["scan ip", "scan domain", "scan hash"],
    requiresTarget: true,
    targetPlaceholder: "Enter IP, domain, or file hash",
    isRealApi: true,
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    shortName: "ABUSE",
    icon: AlertTriangle,
    category: "intel",
    status: "active",
    description: "Check IP reputation and abuse reports",
    version: "API v2",
    commands: ["check ip", "report ip"],
    requiresTarget: true,
    targetPlaceholder: "Enter IP address (e.g., 8.8.8.8)",
    isRealApi: true,
  },
  {
    id: "shodan",
    name: "Shodan",
    shortName: "SHDN",
    icon: Search,
    category: "intel",
    status: "active",
    description: "Search engine for Internet-connected devices",
    version: "API",
    commands: ["host lookup", "search query"],
    requiresTarget: true,
    targetPlaceholder: "Enter IP or search query",
    isRealApi: true,
  },
  // Simulated tools
  {
    id: "kali",
    name: "Kali Linux",
    shortName: "KALI",
    icon: Skull,
    category: "offensive",
    status: "active",
    description: "Penetration testing & ethical hacking distribution",
    version: "2024.1",
    commands: ["aircrack-ng -w wordlist.txt capture.cap", "hydra -l admin -P passwords.txt ssh://target"],
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
    commands: ["use exploit/multi/handler", "search cve:2024"],
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
    commands: ["nmap -sS -sV target", "nmap --script vuln target"],
    requiresTarget: true,
    targetPlaceholder: "Enter target IP or hostname",
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
    commands: ["capture start", "filter: tcp.port == 443"],
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
    commands: ["spider target", "active scan"],
    requiresTarget: true,
    targetPlaceholder: "Enter target URL",
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
    commands: ["hashcat -m 0 hash.txt wordlist.txt"],
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
    commands: ["new case", "run ingest modules"],
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
    commands: ["vol -f dump.raw windows.pslist", "windows.netscan"],
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
    commands: ["snort -A console", "snort -c snort.conf"],
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
    commands: ["SELECT * FROM processes;", "SELECT * FROM listening_ports;"],
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
    commands: ["zeekctl deploy", "zeekctl status"],
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
    commands: ["sync feeds", "export IOCs"],
  },
];

const categoryColors = {
  offensive: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
  defensive: "from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400",
  recon: "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400",
  forensics: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
  intel: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400",
};

const categoryBgColors = {
  offensive: "bg-red-500/10 border-red-500/30",
  defensive: "bg-emerald-500/10 border-emerald-500/30",
  recon: "bg-blue-500/10 border-blue-500/30",
  forensics: "bg-amber-500/10 border-amber-500/30",
  intel: "bg-violet-500/10 border-violet-500/30",
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
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [currentTarget, setCurrentTarget] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [toolStatuses, setToolStatuses] = useState<Record<string, "active" | "standby" | "offline">>({});
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const categories = [
    { id: "intel", label: "THREAT INTEL", icon: Eye },
    { id: "offensive", label: "OFFENSIVE", icon: Skull },
    { id: "defensive", label: "DEFENSIVE", icon: Shield },
    { id: "recon", label: "RECON", icon: Radar },
    { id: "forensics", label: "FORENSICS", icon: FileSearch },
  ] as const;

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const getToolStatus = (toolId: string, defaultStatus: "active" | "standby" | "offline") => {
    return toolStatuses[toolId] || defaultStatus;
  };

  const executeCommand = async (command: string, tool: CyberTool, target?: string) => {
    if (!command.trim() || isExecuting) return;

    if (tool.requiresTarget && !target?.trim()) {
      toast({
        title: "Target Required",
        description: `Please enter a target for ${tool.name}`,
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    
    setTerminalHistory(prev => [...prev, {
      type: "input",
      content: `[${tool.shortName}] $ ${command}${target ? ` → ${target}` : ''}`,
      timestamp: new Date(),
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setTerminalHistory(prev => [...prev, {
          type: "error",
          content: "Error: Authentication required. Please log in.",
          timestamp: new Date(),
        }]);
        setIsExecuting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('cyber-arsenal', {
        body: {
          toolId: tool.id,
          command: command,
          target: target?.trim(),
        },
      });

      if (error) throw error;

      if (data.success) {
        setTerminalHistory(prev => [...prev, {
          type: "output",
          content: data.output,
          timestamp: new Date(),
        }]);
      } else {
        throw new Error(data.error || "Command failed");
      }
    } catch (error: any) {
      console.error('Command execution error:', error);
      setTerminalHistory(prev => [...prev, {
        type: "error",
        content: `Error: ${error.message || "Failed to execute command"}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsExecuting(false);
      setCurrentCommand("");
    }
  };

  const handleToolAction = (action: string, tool: CyberTool) => {
    if (action === "start") {
      setToolStatuses(prev => ({ ...prev, [tool.id]: "active" }));
      setTerminalHistory(prev => [...prev, {
        type: "system",
        content: `[SYSTEM] ${tool.name} is now ONLINE.`,
        timestamp: new Date(),
      }]);
      toast({ title: `${tool.name} Started` });
    } else if (action === "stop") {
      setToolStatuses(prev => ({ ...prev, [tool.id]: "standby" }));
      setTerminalHistory(prev => [...prev, {
        type: "system",
        content: `[SYSTEM] ${tool.name} is now in STANDBY.`,
        timestamp: new Date(),
      }]);
      toast({ title: `${tool.name} Stopped` });
    }
  };

  const clearTerminal = () => setTerminalHistory([]);

  const handleQuickCommand = (cmd: string, tool: CyberTool) => {
    setCurrentCommand(cmd);
    if (!tool.requiresTarget) {
      executeCommand(cmd, tool);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative h-full border-r border-border/50 bg-gradient-to-b from-background via-card to-background transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-14" : "w-56"
        )}
      >
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
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
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
                    .map((tool) => {
                      const currentStatus = getToolStatus(tool.id, tool.status);
                      return (
                        <Tooltip key={tool.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedTool(tool);
                                setCurrentTarget("");
                                setTerminalHistory([{
                                  type: "system",
                                  content: `[SYSTEM] ${tool.name} ${tool.version} terminal initialized${tool.isRealApi ? ' (LIVE API)' : ''}`,
                                  timestamp: new Date(),
                                }]);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group",
                                "bg-gradient-to-r border",
                                categoryColors[tool.category],
                                "hover:scale-[1.01] hover:shadow-md",
                                selectedTool?.id === tool.id && "ring-1 ring-primary/50"
                              )}
                            >
                              <div className="relative flex-shrink-0">
                                <tool.icon className={cn(
                                  "h-3.5 w-3.5 transition-transform group-hover:scale-110",
                                  tool.category === "offensive" && "text-red-400",
                                  tool.category === "defensive" && "text-emerald-400",
                                  tool.category === "recon" && "text-blue-400",
                                  tool.category === "forensics" && "text-amber-400",
                                  tool.category === "intel" && "text-violet-400"
                                )} />
                                <div className={cn(
                                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                                  statusColors[currentStatus]
                                )} />
                              </div>
                              {!isCollapsed && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono font-semibold truncate text-foreground">
                                    {tool.shortName}
                                  </span>
                                  {tool.isRealApi && (
                                    <span className="text-[7px] px-1 py-0.5 bg-violet-500/30 text-violet-300 rounded font-mono">
                                      LIVE
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-mono text-xs">
                            <p className="font-bold">{tool.name}</p>
                            <p className="text-muted-foreground text-[10px]">{tool.description}</p>
                            {tool.isRealApi && <p className="text-violet-400 text-[10px] mt-1">🔴 LIVE API Integration</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {!isCollapsed && (
            <div className="p-2 border-t border-border/50 mt-2">
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-sm font-bold text-emerald-400">
                    {cyberTools.filter((t) => getToolStatus(t.id, t.status) === "active").length}
                  </div>
                  <div className="text-[8px] font-mono text-emerald-400/60">ON</div>
                </div>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-sm font-bold text-amber-400">
                    {cyberTools.filter((t) => getToolStatus(t.id, t.status) === "standby").length}
                  </div>
                  <div className="text-[8px] font-mono text-amber-400/60">SBY</div>
                </div>
                <div className="p-1 rounded bg-violet-500/10 border border-violet-500/20">
                  <div className="text-sm font-bold text-violet-400">
                    {cyberTools.filter((t) => t.isRealApi).length}
                  </div>
                  <div className="text-[8px] font-mono text-violet-400/60">LIVE</div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-3xl h-[650px] border-primary/30 bg-black/95 p-0 flex flex-col">
          {selectedTool && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg border", categoryBgColors[selectedTool.category])}>
                    <selectedTool.icon className={cn(
                      "h-4 w-4",
                      selectedTool.category === "offensive" && "text-red-400",
                      selectedTool.category === "defensive" && "text-emerald-400",
                      selectedTool.category === "recon" && "text-blue-400",
                      selectedTool.category === "forensics" && "text-amber-400",
                      selectedTool.category === "intel" && "text-violet-400"
                    )} />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold text-emerald-400 flex items-center gap-2">
                      {selectedTool.name}
                      {selectedTool.isRealApi && (
                        <Badge variant="outline" className="text-[9px] font-mono h-4 border-violet-500/50 text-violet-400 bg-violet-500/10">
                          🔴 LIVE API
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-mono h-4",
                          getToolStatus(selectedTool.id, selectedTool.status) === "active" && "border-emerald-500/50 text-emerald-400",
                          getToolStatus(selectedTool.id, selectedTool.status) === "standby" && "border-amber-500/50 text-amber-400"
                        )}
                      >
                        {statusLabels[getToolStatus(selectedTool.id, selectedTool.status)]}
                      </Badge>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {selectedTool.version} | {selectedTool.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getToolStatus(selectedTool.id, selectedTool.status) !== "active" ? (
                    <Button 
                      size="sm"
                      className="h-7 text-xs font-mono bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleToolAction("start", selectedTool)}
                    >
                      <Play className="h-3 w-3 mr-1" /> START
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs font-mono"
                      onClick={() => handleToolAction("stop", selectedTool)}
                    >
                      <Square className="h-3 w-3 mr-1" /> STOP
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={clearTerminal}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="terminal" className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-2 bg-black/50 font-mono text-xs">
                  <TabsTrigger value="terminal">Terminal</TabsTrigger>
                  <TabsTrigger value="commands">Quick Commands</TabsTrigger>
                </TabsList>

                <TabsContent value="terminal" className="flex-1 flex flex-col m-0 p-4 pt-2">
                  {selectedTool.requiresTarget && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">TARGET:</span>
                        <Input
                          value={currentTarget}
                          onChange={(e) => setCurrentTarget(e.target.value)}
                          placeholder={selectedTool.targetPlaceholder}
                          className="flex-1 h-8 bg-black/50 border-violet-500/30 font-mono text-xs text-violet-400 placeholder:text-violet-400/30"
                        />
                      </div>
                    </div>
                  )}

                  <div 
                    ref={terminalRef}
                    className="flex-1 bg-black rounded-lg border border-emerald-500/20 p-3 font-mono text-xs overflow-auto"
                    style={{ textShadow: "0 0 5px rgba(34, 197, 94, 0.5)" }}
                  >
                    {terminalHistory.map((line, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "whitespace-pre-wrap mb-1",
                          line.type === "input" && "text-cyan-400",
                          line.type === "output" && "text-emerald-400",
                          line.type === "error" && "text-red-400",
                          line.type === "system" && "text-amber-400 italic"
                        )}
                      >
                        {line.content}
                      </div>
                    ))}
                    {isExecuting && (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="animate-pulse">
                          {selectedTool.isRealApi ? 'Querying live API...' : 'Processing...'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-emerald-400 font-mono text-xs">[{selectedTool.shortName}] $</span>
                    <Input
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isExecuting) {
                          executeCommand(currentCommand, selectedTool, currentTarget);
                        }
                      }}
                      placeholder="Enter command..."
                      className="flex-1 bg-black/50 border-emerald-500/30 font-mono text-xs text-emerald-400 placeholder:text-emerald-400/30"
                      disabled={isExecuting}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => executeCommand(currentCommand, selectedTool, currentTarget)}
                      disabled={isExecuting || !currentCommand.trim()}
                    >
                      {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="commands" className="flex-1 m-0 p-4 pt-2 overflow-auto">
                  <p className="text-[10px] font-mono text-muted-foreground mb-3">
                    QUICK COMMANDS - Click to {selectedTool.requiresTarget ? 'load' : 'execute'}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTool.commands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickCommand(cmd, selectedTool)}
                        disabled={isExecuting}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md font-mono text-xs",
                          "bg-black/50 border border-emerald-500/20",
                          "hover:bg-emerald-500/10 hover:border-emerald-500/40",
                          "transition-all duration-200",
                          "disabled:opacity-50"
                        )}
                      >
                        <code className="text-emerald-400">$ {cmd}</code>
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
