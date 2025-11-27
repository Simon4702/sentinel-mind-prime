import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/dialog";
import { usePlaybooks, usePlaybookExecution, PlaybookStep } from "@/hooks/usePlaybooks";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Circle, Clock, Play, XCircle } from "lucide-react";

interface PlaybookExecutorProps {
  incidentId: string;
  incidentType: string;
}

export const PlaybookExecutor = ({ incidentId, incidentType }: PlaybookExecutorProps) => {
  const { playbooks } = usePlaybooks(incidentType);
  const { execution, startExecution, updateStepStatus, completeExecution } =
    usePlaybookExecution(incidentId);
  const { user } = useAuth();
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const activePlaybook = execution?.security_playbooks;
  const steps = (activePlaybook?.steps as unknown as PlaybookStep[]) || [];
  const stepStatuses = (execution?.step_statuses as Record<string, string>) || {};
  const currentStepIndex = execution?.current_step || 0;

  const completedSteps = Object.values(stepStatuses).filter(
    (status) => status === "completed"
  ).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const handleStartPlaybook = async () => {
    if (!selectedPlaybookId || !user?.id) return;
    await startExecution.mutateAsync({
      playbookId: selectedPlaybookId,
      incidentId,
      userId: user.id,
    });
  };

  const handleStepAction = async (
    stepIndex: number,
    action: "completed" | "skipped"
  ) => {
    if (!execution?.id) return;
    const newCurrentStep = action === "completed" ? stepIndex + 1 : stepIndex + 1;
    await updateStepStatus.mutateAsync({
      executionId: execution.id,
      stepIndex,
      status: action,
      currentStep: newCurrentStep,
    });
  };

  const handleComplete = async () => {
    if (!execution?.id) return;
    await completeExecution.mutateAsync({
      executionId: execution.id,
      notes: completionNotes,
    });
    setShowCompletionDialog(false);
    setCompletionNotes("");
  };

  const getStepIcon = (index: number) => {
    const status = stepStatuses[index.toString()];
    if (status === "completed") {
      return <CheckCircle className="h-5 w-5 text-primary" />;
    } else if (status === "skipped") {
      return <XCircle className="h-5 w-5 text-muted-foreground" />;
    } else if (index === currentStepIndex) {
      return <Circle className="h-5 w-5 text-primary animate-pulse" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  if (execution?.completed_at) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Playbook Completed
          </CardTitle>
          <CardDescription>
            {activePlaybook?.name} - Completed on{" "}
            {new Date(execution.completed_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        {execution.notes && (
          <CardContent>
            <div className="text-sm">
              <strong>Notes:</strong> {execution.notes}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!execution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start Incident Response Playbook</CardTitle>
          <CardDescription>
            Select a playbook to guide your incident response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {playbooks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No playbooks available for this incident type
            </div>
          ) : (
            <>
              <Select value={selectedPlaybookId} onValueChange={setSelectedPlaybookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a playbook" />
                </SelectTrigger>
                <SelectContent>
                  {playbooks.map((playbook) => (
                    <SelectItem key={playbook.id} value={playbook.id}>
                      {playbook.name} ({playbook.estimated_time_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStartPlaybook}
                disabled={!selectedPlaybookId}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Playbook
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{activePlaybook?.name}</CardTitle>
            <CardDescription>
              {completedSteps} of {steps.length} steps completed
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {activePlaybook?.estimated_time_minutes} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = stepStatuses[index.toString()];
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;

            return (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : isPast
                    ? "opacity-60"
                    : "opacity-40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStepIcon(index)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        Step {index + 1}: {step.title}
                      </h4>
                      {step.estimatedMinutes && (
                        <span className="text-sm text-muted-foreground">
                          ~{step.estimatedMinutes} min
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                    <div className="text-sm bg-accent/20 p-3 rounded">
                      <strong>Action:</strong> {step.action}
                    </div>
                    {isCurrent && !status && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleStepAction(index, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete Step
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStepAction(index, "skipped")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Skip Step
                        </Button>
                      </div>
                    )}
                    {status && (
                      <Badge
                        variant={status === "completed" ? "default" : "outline"}
                      >
                        {status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentStepIndex >= steps.length && (
          <Button
            onClick={() => setShowCompletionDialog(true)}
            className="w-full"
          >
            Complete Playbook
          </Button>
        )}
      </CardContent>

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Playbook Execution</DialogTitle>
            <DialogDescription>
              Add any final notes about the incident response
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Summary of actions taken, outcomes, lessons learned..."
              rows={6}
            />
            <Button onClick={handleComplete} className="w-full">
              Complete Playbook
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
