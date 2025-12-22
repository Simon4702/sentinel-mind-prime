import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Laptop,
  Database,
  Cloud,
  Copy,
  CheckCircle,
  Download,
  Terminal,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgentDeployModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentDeployModal = ({ open, onClose, onSuccess }: AgentDeployModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [agentName, setAgentName] = useState("");
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [agentType, setAgentType] = useState("endpoint");
  const [osType, setOsType] = useState("linux");
  const [isDeploying, setIsDeploying] = useState(false);
  const [copied, setCopied] = useState(false);

  const agentToken = `SENTINEL_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

  const deploymentScript = {
    linux: `curl -fsSL https://sentinelmind.io/install.sh | sudo bash -s -- \\
  --token "${agentToken}" \\
  --name "${agentName || 'agent-001'}" \\
  --type "${agentType}"`,
    windows: `Invoke-WebRequest -Uri https://sentinelmind.io/install.ps1 -OutFile install.ps1
.\\install.ps1 -Token "${agentToken}" -Name "${agentName || 'agent-001'}" -Type "${agentType}"`,
    macos: `curl -fsSL https://sentinelmind.io/install.sh | sudo bash -s -- \\
  --token "${agentToken}" \\
  --name "${agentName || 'agent-001'}" \\
  --type "${agentType}"`,
  };

  const handleDeploy = async () => {
    if (!profile?.organization_id || !agentName || !hostname) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      const { error } = await supabase.from("siem_agents").insert({
        organization_id: profile.organization_id,
        agent_name: agentName,
        hostname,
        ip_address: ipAddress || null,
        agent_type: agentType,
        os_type: osType,
        status: "offline",
        config: { token: agentToken },
      });

      if (error) throw error;

      toast({
        title: "Agent Registered",
        description: "Deploy the agent using the installation script below",
      });

      onSuccess();
    } catch (error) {
      console.error("Error deploying agent:", error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Failed to register agent",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(deploymentScript[osType as keyof typeof deploymentScript]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Installation script copied to clipboard",
    });
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "endpoint": return Laptop;
      case "server": return Server;
      case "database": return Database;
      case "cloud": return Cloud;
      default: return Server;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Deploy SIEM Agent
          </DialogTitle>
          <DialogDescription>
            Register and deploy a new security monitoring agent to your infrastructure
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="configure" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">1. Configure</TabsTrigger>
            <TabsTrigger value="install">2. Install</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name *</Label>
                <Input
                  id="agentName"
                  placeholder="e.g., prod-web-01"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname *</Label>
                <Input
                  id="hostname"
                  placeholder="e.g., web-server-01.example.com"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  placeholder="e.g., 192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentType">Agent Type</Label>
                <Select value={agentType} onValueChange={setAgentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endpoint">
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        Endpoint
                      </div>
                    </SelectItem>
                    <SelectItem value="server">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Server
                      </div>
                    </SelectItem>
                    <SelectItem value="database">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database
                      </div>
                    </SelectItem>
                    <SelectItem value="cloud">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Cloud Instance
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Operating System</Label>
              <div className="flex gap-2">
                {["linux", "windows", "macos"].map((os) => (
                  <Button
                    key={os}
                    variant={osType === os ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setOsType(os)}
                  >
                    {os === "linux" && "🐧 Linux"}
                    {os === "windows" && "🪟 Windows"}
                    {os === "macos" && "🍎 macOS"}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleDeploy}
              disabled={isDeploying || !agentName || !hostname}
            >
              {isDeploying ? "Registering..." : "Register Agent"}
            </Button>
          </TabsContent>

          <TabsContent value="install" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-medium">Installation Script</span>
                  <Badge variant="outline" className="capitalize">
                    {osType}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={copyScript}>
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="text-sm bg-background p-3 rounded-lg overflow-x-auto">
                <code>{deploymentScript[osType as keyof typeof deploymentScript]}</code>
              </pre>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Secure Deployment</p>
                <p className="text-sm text-muted-foreground">
                  The agent uses TLS encryption and certificate pinning to ensure secure
                  communication with the SIEM console.
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Agent Package
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDeployModal;
