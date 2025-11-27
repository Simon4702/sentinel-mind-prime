import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { usePlaybooks, PlaybookStep } from "@/hooks/usePlaybooks";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, BookOpen, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export const PlaybookManager = () => {
  const { playbooks, isLoading, createPlaybook, deletePlaybook } = usePlaybooks();
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    incident_type: "anomalous_behavior" as Database["public"]["Enums"]["incident_type"],
    severity: "medium" as Database["public"]["Enums"]["incident_severity"],
    estimated_time_minutes: 30,
    steps: [] as PlaybookStep[],
  });
  const [currentStep, setCurrentStep] = useState({
    title: "",
    description: "",
    action: "",
    estimatedMinutes: 5,
  });

  const addStep = () => {
    if (!currentStep.title || !currentStep.action) return;
    setFormData({
      ...formData,
      steps: [...formData.steps, currentStep],
    });
    setCurrentStep({
      title: "",
      description: "",
      action: "",
      estimatedMinutes: 5,
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.steps.length === 0) return;

    await createPlaybook.mutateAsync({
      name: formData.name,
      description: formData.description,
      incident_type: formData.incident_type,
      severity: formData.severity,
      estimated_time_minutes: formData.estimated_time_minutes,
      steps: formData.steps as any,
      organization_id: profile?.organization_id || "",
      created_by: profile?.user_id,
    });

    setIsDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      incident_type: "anomalous_behavior",
      severity: "medium",
      estimated_time_minutes: 30,
      steps: [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Playbooks</CardTitle>
            <CardDescription>
              Standardized response procedures for security incidents
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Playbook</DialogTitle>
                <DialogDescription>
                  Define step-by-step procedures for responding to security incidents
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Playbook Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Phishing Response Playbook"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of when to use this playbook"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Incident Type</Label>
                    <Select
                      value={formData.incident_type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          incident_type: value as Database["public"]["Enums"]["incident_type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phishing_attempt">Phishing Attempt</SelectItem>
                        <SelectItem value="malware_detection">Malware Detection</SelectItem>
                        <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                        <SelectItem value="data_exfiltration">Data Exfiltration</SelectItem>
                        <SelectItem value="insider_threat">Insider Threat</SelectItem>
                        <SelectItem value="privilege_escalation">Privilege Escalation</SelectItem>
                        <SelectItem value="anomalous_behavior">Anomalous Behavior</SelectItem>
                        <SelectItem value="policy_violation">Policy Violation</SelectItem>
                        <SelectItem value="compliance_breach">Compliance Breach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          severity: value as Database["public"]["Enums"]["incident_severity"],
                        })
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
                  <div>
                    <Label>Est. Time (min)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_time_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimated_time_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Playbook Steps</h3>
                  {formData.steps.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 bg-accent/5 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {index + 1}. {step.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {step.action}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Step Title</Label>
                        <Input
                          value={currentStep.title}
                          onChange={(e) =>
                            setCurrentStep({ ...currentStep, title: e.target.value })
                          }
                          placeholder="e.g., Isolate affected system"
                        />
                      </div>
                      <div>
                        <Label>Est. Minutes</Label>
                        <Input
                          type="number"
                          value={currentStep.estimatedMinutes}
                          onChange={(e) =>
                            setCurrentStep({
                              ...currentStep,
                              estimatedMinutes: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={currentStep.description}
                        onChange={(e) =>
                          setCurrentStep({
                            ...currentStep,
                            description: e.target.value,
                          })
                        }
                        placeholder="Additional context"
                      />
                    </div>
                    <div>
                      <Label>Action Required</Label>
                      <Textarea
                        value={currentStep.action}
                        onChange={(e) =>
                          setCurrentStep({ ...currentStep, action: e.target.value })
                        }
                        placeholder="Detailed instructions for this step"
                      />
                    </div>
                    <Button type="button" onClick={addStep} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={formData.steps.length === 0}>
                  Create Playbook
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading playbooks...</div>
        ) : playbooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No playbooks created yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Incident Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Est. Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playbooks.map((playbook) => {
                const steps = (playbook.steps as unknown as PlaybookStep[]) || [];
                return (
                  <TableRow key={playbook.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {playbook.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {playbook.incident_type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          playbook.severity === "critical"
                            ? "destructive"
                            : playbook.severity === "high"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {playbook.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{steps.length} steps</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {playbook.estimated_time_minutes} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlaybook.mutate(playbook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
