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
import { AlertTriangle, CheckCircle, Clock, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIncidentAssignment } from "@/hooks/useIncidentAssignment";
import { IncidentAutoAssignment } from "@/components/IncidentAutoAssignment";

type Incident = Database["public"]["Tables"]["security_incidents"]["Row"];

export const IncidentManagement = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { autoAssignIncident } = useIncidentAssignment();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch incidents
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["security_incidents", filterStatus, filterSeverity],
    queryFn: async () => {
      let query = supabase
        .from("security_incidents")
        .select("*")
        .order("detected_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus as Database["public"]["Enums"]["incident_status"]);
      }
      if (filterSeverity !== "all") {
        query = query.eq("severity", filterSeverity as Database["public"]["Enums"]["incident_severity"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Incident[];
    },
  });

  // Update incident mutation
  const updateIncidentMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["security_incidents"]["Update"];
    }) => {
      const { error } = await supabase
        .from("security_incidents")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security_incidents"] });
      toast.success("Incident updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update incident: ${error.message}`);
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

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (incident: Database["public"]["Tables"]["security_incidents"]["Insert"]) => {
      const { data, error } = await supabase
        .from("security_incidents")
        .insert({
          ...incident,
          organization_id: userProfile?.organization_id || "",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Auto-assign if no assignment was made
      if (!data.assigned_to && userProfile?.organization_id) {
        await autoAssignIncident(
          data.id,
          userProfile.organization_id,
          data.department_id
        );
      }
      queryClient.invalidateQueries({ queryKey: ["security_incidents"] });
      toast.success("Incident created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create incident: ${error.message}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "investigating":
        return "secondary";
      case "contained":
        return "secondary";
      case "resolved":
        return "default";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />;
      case "investigating":
        return <Clock className="h-4 w-4" />;
      case "contained":
        return <Shield className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incident Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedIncident(null)}>
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedIncident ? "Update Incident" : "Create New Incident"}
              </DialogTitle>
              <DialogDescription>
                {selectedIncident
                  ? "Update the incident details below"
                  : "Fill in the details to create a new incident"}
              </DialogDescription>
            </DialogHeader>
            <IncidentForm
              incident={selectedIncident}
              onSubmit={(data) => {
                if (selectedIncident) {
                  updateIncidentMutation.mutate({
                    id: selectedIncident.id,
                    updates: data,
                  });
                } else {
                  createIncidentMutation.mutate(data);
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
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.investigating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Assignment Configuration */}
      <IncidentAutoAssignment />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="contained">Contained</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
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
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No incidents found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {incident.incident_type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(incident.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(incident.status)}
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(incident.detected_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setIsDialogOpen(true);
                        }}
                      >
                        Manage
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

// Incident Form Component
const IncidentForm = ({
  incident,
  onSubmit,
}: {
  incident: Incident | null;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    title: incident?.title || "",
    description: incident?.description || "",
    incident_type: incident?.incident_type || ("anomalous_behavior" as Database["public"]["Enums"]["incident_type"]),
    severity: incident?.severity || ("medium" as Database["public"]["Enums"]["incident_severity"]),
    status: incident?.status || ("open" as Database["public"]["Enums"]["incident_status"]),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Incident Type</label>
          <Select
            value={formData.incident_type}
            onValueChange={(value) =>
              setFormData({ ...formData, incident_type: value as Database["public"]["Enums"]["incident_type"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phishing_attempt">Phishing Attempt</SelectItem>
              <SelectItem value="malware_detection">Malware Detection</SelectItem>
              <SelectItem value="unauthorized_access">
                Unauthorized Access
              </SelectItem>
              <SelectItem value="data_exfiltration">Data Exfiltration</SelectItem>
              <SelectItem value="insider_threat">Insider Threat</SelectItem>
              <SelectItem value="privilege_escalation">
                Privilege Escalation
              </SelectItem>
              <SelectItem value="anomalous_behavior">
                Anomalous Behavior
              </SelectItem>
              <SelectItem value="policy_violation">Policy Violation</SelectItem>
              <SelectItem value="compliance_breach">Compliance Breach</SelectItem>
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
      {incident && (
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as Database["public"]["Enums"]["incident_status"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="contained">Contained</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full">
        {incident ? "Update Incident" : "Create Incident"}
      </Button>
    </form>
  );
};
