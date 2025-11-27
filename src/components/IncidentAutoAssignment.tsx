import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useIncidentAssignment } from "@/hooks/useIncidentAssignment";
import { Users, TrendingDown, RefreshCw } from "lucide-react";

export const IncidentAutoAssignment = () => {
  const { rules, setRules } = useIncidentAssignment();

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        enabled: rule.id === ruleId ? !rule.enabled : false, // Only one rule active at a time
      }))
    );
  };

  const getRuleIcon = (method: string) => {
    switch (method) {
      case "least_loaded":
        return <TrendingDown className="h-4 w-4" />;
      case "department_based":
        return <Users className="h-4 w-4" />;
      case "round_robin":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRuleDescription = (method: string) => {
    switch (method) {
      case "least_loaded":
        return "Assigns incidents to analysts with the fewest active incidents";
      case "department_based":
        return "Assigns incidents to analysts in the same department as the incident";
      case "round_robin":
        return "Distributes incidents evenly across all analysts in rotation";
      default:
        return "";
    }
  };

  const getRuleLabel = (method: string) => {
    switch (method) {
      case "least_loaded":
        return "Least Loaded";
      case "department_based":
        return "Department Based";
      case "round_robin":
        return "Round Robin";
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Assignment Rules</CardTitle>
        <CardDescription>
          Configure how incidents are automatically assigned to security analysts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1 text-muted-foreground">
                {getRuleIcon(rule.method)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">
                    {getRuleLabel(rule.method)}
                  </Label>
                  {rule.enabled && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getRuleDescription(rule.method)}
                </p>
              </div>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={() => toggleRule(rule.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
