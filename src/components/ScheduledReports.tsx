import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  lastRun?: string;
  nextRun: string;
  isActive: boolean;
  format: 'pdf' | 'csv' | 'xlsx';
}

const initialReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Weekly Security Summary',
    type: 'Security Overview',
    frequency: 'weekly',
    recipients: ['security@company.com', 'ciso@company.com'],
    lastRun: '2024-01-08T09:00:00',
    nextRun: '2024-01-15T09:00:00',
    isActive: true,
    format: 'pdf'
  },
  {
    id: '2',
    name: 'Monthly Compliance Report',
    type: 'Compliance Status',
    frequency: 'monthly',
    recipients: ['compliance@company.com', 'legal@company.com'],
    lastRun: '2024-01-01T09:00:00',
    nextRun: '2024-02-01T09:00:00',
    isActive: true,
    format: 'pdf'
  },
  {
    id: '3',
    name: 'Daily Incident Report',
    type: 'Incident Summary',
    frequency: 'daily',
    recipients: ['soc@company.com'],
    lastRun: '2024-01-14T06:00:00',
    nextRun: '2024-01-15T06:00:00',
    isActive: true,
    format: 'csv'
  },
  {
    id: '4',
    name: 'Quarterly Risk Assessment',
    type: 'Risk Analysis',
    frequency: 'quarterly',
    recipients: ['board@company.com', 'ceo@company.com'],
    lastRun: '2024-01-01T09:00:00',
    nextRun: '2024-04-01T09:00:00',
    isActive: false,
    format: 'pdf'
  },
];

export const ScheduledReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<ScheduledReport[]>(initialReports);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'Security Overview',
    frequency: 'weekly' as ScheduledReport['frequency'],
    recipients: '',
    format: 'pdf' as ScheduledReport['format'],
  });

  const toggleReport = (id: string) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
    const report = reports.find(r => r.id === id);
    toast({
      title: report?.isActive ? "Report Paused" : "Report Activated",
      description: `${report?.name} has been ${report?.isActive ? 'paused' : 'activated'}`,
    });
  };

  const deleteReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    setReports(reports.filter(r => r.id !== id));
    toast({
      title: "Report Deleted",
      description: `${report?.name} has been removed`,
    });
  };

  const runNow = (report: ScheduledReport) => {
    toast({
      title: "Report Generation Started",
      description: `${report.name} is being generated and will be sent to recipients`,
    });
  };

  const createReport = () => {
    const id = Date.now().toString();
    const newScheduledReport: ScheduledReport = {
      id,
      name: newReport.name,
      type: newReport.type,
      frequency: newReport.frequency,
      recipients: newReport.recipients.split(',').map(e => e.trim()),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      isActive: true,
      format: newReport.format,
    };
    setReports([...reports, newScheduledReport]);
    setIsCreateOpen(false);
    setNewReport({
      name: '',
      type: 'Security Overview',
      frequency: 'weekly',
      recipients: '',
      format: 'pdf',
    });
    toast({
      title: "Report Created",
      description: `${newReport.name} has been scheduled`,
    });
  };

  const getFrequencyBadge = (frequency: ScheduledReport['frequency']) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
      weekly: 'bg-green-500/20 text-green-700 dark:text-green-400',
      monthly: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
      quarterly: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    };
    return <Badge className={colors[frequency]}>{frequency}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Scheduled Reports</h2>
          <p className="text-sm text-muted-foreground">
            Automate report generation and delivery
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Scheduled Report</DialogTitle>
              <DialogDescription>
                Set up automatic report generation and delivery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  placeholder="e.g., Weekly Security Summary"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(v) => setNewReport({ ...newReport, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Security Overview">Security Overview</SelectItem>
                      <SelectItem value="Compliance Status">Compliance Status</SelectItem>
                      <SelectItem value="Incident Summary">Incident Summary</SelectItem>
                      <SelectItem value="Risk Analysis">Risk Analysis</SelectItem>
                      <SelectItem value="Threat Intelligence">Threat Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={newReport.frequency}
                    onValueChange={(v: ScheduledReport['frequency']) => 
                      setNewReport({ ...newReport, frequency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={newReport.format}
                  onValueChange={(v: ScheduledReport['format']) => 
                    setNewReport({ ...newReport, format: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Recipients (comma-separated)</Label>
                <Input
                  placeholder="email1@company.com, email2@company.com"
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={createReport}
                disabled={!newReport.name || !newReport.recipients}
              >
                Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card 
            key={report.id}
            className={`transition-all ${!report.isActive ? 'opacity-60' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                    <FileText className={`h-5 w-5 ${report.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                  </div>
                </div>
                <Switch
                  checked={report.isActive}
                  onCheckedChange={() => toggleReport(report.id)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {getFrequencyBadge(report.frequency)}
                  <Badge variant="outline">.{report.format.toUpperCase()}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Next Run</div>
                      <div className="font-medium">{formatDate(report.nextRun)}</div>
                    </div>
                  </div>
                  {report.lastRun && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-muted-foreground">Last Run</div>
                        <div className="font-medium">{formatDate(report.lastRun)}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {report.recipients.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runNow(report)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
