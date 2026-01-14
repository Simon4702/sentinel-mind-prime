import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Target,
  Users,
  FileText,
  Zap
} from "lucide-react";

interface Gap {
  id: string;
  framework: string;
  control: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  estimatedEffort: string;
  assignee?: string;
  dueDate?: string;
  progress: number;
}

const gaps: Gap[] = [
  {
    id: '1',
    framework: 'SOC 2',
    control: 'CC4.1 - Monitoring Activities',
    description: 'Insufficient monitoring of security controls and automated alerting mechanisms',
    severity: 'critical',
    remediation: 'Implement comprehensive SIEM monitoring with automated alerts for security events',
    estimatedEffort: '2 weeks',
    assignee: 'Security Team',
    dueDate: '2024-02-15',
    progress: 35
  },
  {
    id: '2',
    framework: 'HIPAA',
    control: '§164.312(b) - Audit Controls',
    description: 'Audit logging does not capture all required access events for ePHI',
    severity: 'high',
    remediation: 'Extend audit logging to cover all ePHI access points and implement log retention policy',
    estimatedEffort: '1 week',
    assignee: 'DevOps',
    dueDate: '2024-02-01',
    progress: 60
  },
  {
    id: '3',
    framework: 'GDPR',
    control: 'Article 33 - Breach Notification',
    description: 'Breach notification process not documented and tested',
    severity: 'critical',
    remediation: 'Document incident response playbook and conduct tabletop exercises',
    estimatedEffort: '3 days',
    assignee: 'Compliance',
    dueDate: '2024-01-25',
    progress: 80
  },
  {
    id: '4',
    framework: 'ISO 27001',
    control: 'A.12.1 - Operations Security',
    description: 'Operating procedures not fully documented for all critical systems',
    severity: 'medium',
    remediation: 'Create and maintain runbooks for all production systems',
    estimatedEffort: '2 weeks',
    assignee: 'Operations',
    dueDate: '2024-02-28',
    progress: 20
  },
  {
    id: '5',
    framework: 'SOC 2',
    control: 'CC7.1 - System Operations',
    description: 'Change management process lacks formal approval workflow',
    severity: 'medium',
    remediation: 'Implement change advisory board and approval workflows',
    estimatedEffort: '1 week',
    assignee: 'IT Governance',
    dueDate: '2024-02-10',
    progress: 45
  },
  {
    id: '6',
    framework: 'GDPR',
    control: 'Article 17 - Right to Erasure',
    description: 'Data deletion requests require manual intervention',
    severity: 'medium',
    remediation: 'Automate data subject access request (DSAR) handling',
    estimatedEffort: '3 weeks',
    assignee: 'Engineering',
    dueDate: '2024-03-15',
    progress: 10
  },
];

export const ComplianceGapAnalysis = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const getSeverityColor = (severity: Gap['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
    }
  };

  const filteredGaps = filterSeverity === 'all' 
    ? gaps 
    : gaps.filter(g => g.severity === filterSeverity);

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const highCount = gaps.filter(g => g.severity === 'high').length;
  const avgProgress = Math.round(gaps.reduce((acc, g) => acc + g.progress, 0) / gaps.length);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Gaps</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gaps</p>
                <p className="text-3xl font-bold">{gaps.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-3xl font-bold text-green-600">{avgProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterSeverity === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('all')}
        >
          All ({gaps.length})
        </Button>
        <Button
          variant={filterSeverity === 'critical' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('critical')}
        >
          Critical ({criticalCount})
        </Button>
        <Button
          variant={filterSeverity === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('high')}
          className={filterSeverity === 'high' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          High ({highCount})
        </Button>
        <Button
          variant={filterSeverity === 'medium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('medium')}
          className={filterSeverity === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
          Medium ({gaps.filter(g => g.severity === 'medium').length})
        </Button>
      </div>

      {/* Gap Cards */}
      <div className="space-y-4">
        {filteredGaps.map((gap) => (
          <Card key={gap.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Gap Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{gap.framework}</Badge>
                      <Badge className={getSeverityColor(gap.severity)}>
                        {gap.severity.toUpperCase()}
                      </Badge>
                    </div>
                    {gap.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Due: {gap.dueDate}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{gap.control}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {gap.assignee && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{gap.assignee}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{gap.estimatedEffort}</span>
                    </div>
                  </div>
                </div>

                {/* Remediation & Progress */}
                <div className="lg:w-80 space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Zap className="h-4 w-4 text-primary" />
                      Remediation
                    </div>
                    <p className="text-sm text-muted-foreground">{gap.remediation}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{gap.progress}%</span>
                    </div>
                    <Progress value={gap.progress} className="h-2" />
                  </div>
                  
                  <Button size="sm" className="w-full">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
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
