import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Mail, 
  Bell,
  ArrowUpCircle,
  Shield
} from 'lucide-react';
import { useEscalationRules, useEscalationHistory, EscalationRule } from '@/hooks/useEscalationRules';
import { format } from 'date-fns';

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];
const TARGET_TYPES = ['role', 'user', 'team', 'email'];
const NOTIFICATION_CHANNELS = ['email', 'sms', 'slack', 'webhook'];

interface RuleFormData {
  rule_name: string;
  description: string;
  severity_trigger: string[];
  response_time_minutes: number;
  escalation_level: number;
  escalation_target_type: string;
  escalation_target: string;
  notification_channels: string[];
  is_enabled: boolean;
}

const defaultFormData: RuleFormData = {
  rule_name: '',
  description: '',
  severity_trigger: ['critical', 'high'],
  response_time_minutes: 30,
  escalation_level: 1,
  escalation_target_type: 'role',
  escalation_target: '',
  notification_channels: ['email'],
  is_enabled: true,
};

export const AlertEscalationManager = () => {
  const { rules, isLoading, createRule, updateRule, deleteRule, toggleRule } = useEscalationRules();
  const { data: history = [] } = useEscalationHistory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(defaultFormData);

  const handleOpenDialog = (rule?: EscalationRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_name: rule.rule_name,
        description: rule.description || '',
        severity_trigger: rule.severity_trigger,
        response_time_minutes: rule.response_time_minutes,
        escalation_level: rule.escalation_level,
        escalation_target_type: rule.escalation_target_type,
        escalation_target: rule.escalation_target,
        notification_channels: rule.notification_channels,
        is_enabled: rule.is_enabled,
      });
    } else {
      setEditingRule(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingRule) {
      await updateRule.mutateAsync({ id: editingRule.id, ...formData });
    } else {
      await createRule.mutateAsync({ ...formData, organization_id: null });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this escalation rule?')) {
      await deleteRule.mutateAsync(id);
    }
  };

  const toggleSeverity = (severity: string) => {
    setFormData(prev => ({
      ...prev,
      severity_trigger: prev.severity_trigger.includes(severity)
        ? prev.severity_trigger.filter(s => s !== severity)
        : [...prev.severity_trigger, severity],
    }));
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      notification_channels: prev.notification_channels.includes(channel)
        ? prev.notification_channels.filter(c => c !== channel)
        : [...prev.notification_channels, channel],
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-primary" />
            Alert Escalation Rules
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure automatic escalation paths based on severity and response time
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}</DialogTitle>
              <DialogDescription>
                Define when and how alerts should be escalated
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                    placeholder="e.g., Critical Alert Escalation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation_level">Escalation Level</Label>
                  <Select
                    value={formData.escalation_level.toString()}
                    onValueChange={(v) => setFormData({ ...formData, escalation_level: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Trigger on Severity</Label>
                <div className="flex flex-wrap gap-2">
                  {SEVERITY_OPTIONS.map(severity => (
                    <Badge
                      key={severity}
                      variant="outline"
                      className={`cursor-pointer transition-all ${
                        formData.severity_trigger.includes(severity)
                          ? getSeverityColor(severity)
                          : 'opacity-50'
                      }`}
                      onClick={() => toggleSeverity(severity)}
                    >
                      {severity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_time">Response Time Threshold (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="response_time"
                    type="number"
                    min="1"
                    value={formData.response_time_minutes}
                    onChange={(e) => setFormData({ ...formData, response_time_minutes: parseInt(e.target.value) || 30 })}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    Escalate if unacknowledged after this time
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Escalate To (Type)</Label>
                  <Select
                    value={formData.escalation_target_type}
                    onValueChange={(v) => setFormData({ ...formData, escalation_target_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    value={formData.escalation_target}
                    onChange={(e) => setFormData({ ...formData, escalation_target: e.target.value })}
                    placeholder={
                      formData.escalation_target_type === 'email' 
                        ? 'email@example.com' 
                        : formData.escalation_target_type === 'role'
                        ? 'admin, security_analyst'
                        : 'Target identifier'
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Notification Channels</Label>
                <div className="flex flex-wrap gap-4">
                  {NOTIFICATION_CHANNELS.map(channel => (
                    <div key={channel} className="flex items-center gap-2">
                      <Checkbox
                        id={channel}
                        checked={formData.notification_channels.includes(channel)}
                        onCheckedChange={() => toggleChannel(channel)}
                      />
                      <Label htmlFor={channel} className="text-sm cursor-pointer">
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                />
                <Label htmlFor="enabled">Rule Enabled</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.rule_name || !formData.escalation_target}>
                {editingRule ? 'Save Changes' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading rules...</div>
            </CardContent>
          </Card>
        ) : rules.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No Escalation Rules</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Create your first escalation rule to automatically route critical alerts to the right people.
              </p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          rules.map(rule => (
            <Card key={rule.id} className={`transition-all ${!rule.is_enabled ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        L{rule.escalation_level}
                      </Badge>
                      {rule.rule_name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {rule.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={rule.is_enabled}
                    onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, is_enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {rule.severity_trigger.map(sev => (
                    <Badge key={sev} variant="outline" className={`text-xs ${getSeverityColor(sev)}`}>
                      {sev}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>After {rule.response_time_minutes} min</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="capitalize">{rule.escalation_target_type}:</span>
                  <span className="text-foreground">{rule.escalation_target}</span>
                </div>

                <div className="flex items-center gap-1">
                  {rule.notification_channels.map(ch => (
                    <Badge key={ch} variant="secondary" className="text-xs">
                      {ch === 'email' && <Mail className="h-3 w-3 mr-1" />}
                      {ch === 'slack' && <Bell className="h-3 w-3 mr-1" />}
                      {ch}
                    </Badge>
                  ))}
                </div>

                <Separator />
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(rule)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Escalation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Recent Escalations
          </CardTitle>
          <CardDescription>History of triggered escalations</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No escalations triggered yet
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium text-sm">
                        {item.alert_escalation_rules?.rule_name || 'Deleted Rule'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Escalated to: {item.escalated_to}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.acknowledged_at ? 'secondary' : 'outline'}>
                        {item.acknowledged_at ? 'Acknowledged' : 'Pending'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(item.escalated_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
