import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Activity, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type ThreatIntelligence = Database["public"]["Tables"]["threat_intelligence"]["Row"];

export const ThreatManagement = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch threats
  const { data: threats = [], isLoading } = useQuery({
    queryKey: ["threat_intelligence", filterSeverity, filterActive],
    queryFn: async () => {
      let query = supabase
        .from("threat_intelligence")
        .select("*")
        .order("last_seen", { ascending: false });

      if (filterSeverity !== "all") {
        query = query.eq("severity", filterSeverity as Database["public"]["Enums"]["incident_severity"]);
      }
      if (filterActive !== "all") {
        query = query.eq("is_active", filterActive === "active");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ThreatIntelligence[];
    },
  });

  // Fetch user's organization
  const { data: userProfile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Create threat mutation
  const createThreatMutation = useMutation({
    mutationFn: async (threat: Database["public"]["Tables"]["threat_intelligence"]["Insert"]) => {
      const { error } = await supabase
        .from("threat_intelligence")
        .insert({
          ...threat,
          organization_id: userProfile?.organization_id || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threat_intelligence"] });
      toast.success("Threat created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create threat: ${error.message}`);
    },
  });

  // Update threat mutation
  const updateThreatMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["threat_intelligence"]["Update"];
    }) => {
      const { error } = await supabase
        .from("threat_intelligence")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threat_intelligence"] });
      toast.success("Threat updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update threat: ${error.message}`);
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const stats = {
    total: threats.length,
    active: threats.filter((t) => t.is_active).length,
    critical: threats.filter((t) => t.severity === "critical").length,
    high: threats.filter((t) => t.severity === "high").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Threat Intelligence</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedThreat(null)}>
              Add Threat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedThreat ? "Update Threat" : "Add New Threat"}
              </DialogTitle>
              <DialogDescription>
                {selectedThreat
                  ? "Update the threat intelligence details below"
                  : "Fill in the details to add a new threat"}
              </DialogDescription>
            </DialogHeader>
            <ThreatForm
              threat={selectedThreat}
              onSubmit={(data) => {
                if (selectedThreat) {
                  updateThreatMutation.mutate({
                    id: selectedThreat.id,
                    updates: data,
                  });
                } else {
                  createThreatMutation.mutate(data);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Threats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Intelligence Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading threats...</div>
          ) : threats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No threats found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Threat Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats.map((threat) => (
                  <TableRow key={threat.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {threat.indicator_value.substring(0, 30)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {threat.indicator_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {threat.threat_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={threat.is_active ? "default" : "outline"}>
                        {threat.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(threat.last_seen).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedThreat(threat);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Threat Form Component
const ThreatForm = ({
  threat,
  onSubmit,
}: {
  threat: ThreatIntelligence | null;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    indicator_type: threat?.indicator_type || "ip",
    indicator_value: threat?.indicator_value || "",
    threat_type: threat?.threat_type || "malware",
    severity: threat?.severity || ("medium" as Database["public"]["Enums"]["incident_severity"]),
    confidence_level: threat?.confidence_level || 50,
    source: threat?.source || "",
    description: threat?.description || "",
    is_active: threat?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Indicator Type</label>
          <Select
            value={formData.indicator_type}
            onValueChange={(value) =>
              setFormData({ ...formData, indicator_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ip">IP Address</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="hash">File Hash</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Indicator Value</label>
          <Input
            value={formData.indicator_value}
            onChange={(e) =>
              setFormData({ ...formData, indicator_value: e.target.value })
            }
            placeholder="e.g., 192.168.1.1"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Threat Type</label>
          <Select
            value={formData.threat_type}
            onValueChange={(value) =>
              setFormData({ ...formData, threat_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="malware">Malware</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
              <SelectItem value="ransomware">Ransomware</SelectItem>
              <SelectItem value="botnet">Botnet</SelectItem>
              <SelectItem value="c2">C2 Server</SelectItem>
              <SelectItem value="exploit">Exploit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Severity</label>
          <Select
            value={formData.severity}
            onValueChange={(value) =>
              setFormData({ ...formData, severity: value as Database["public"]["Enums"]["incident_severity"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Source</label>
          <Input
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            placeholder="e.g., OSINT, Internal"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Confidence Level (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.confidence_level || ""}
            onChange={(e) =>
              setFormData({ ...formData, confidence_level: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          placeholder="Additional details about this threat..."
        />
      </div>
      {threat && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="h-4 w-4"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active Threat
          </label>
        </div>
      )}
      <Button type="submit" className="w-full">
        {threat ? "Update Threat" : "Add Threat"}
      </Button>
    </form>
  );
};
