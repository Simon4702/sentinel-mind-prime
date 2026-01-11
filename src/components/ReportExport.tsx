import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Loader2,
  CheckCircle
} from "lucide-react";

interface ReportSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const reportSections: ReportSection[] = [
  { id: 'incidents', label: 'Security Incidents', icon: <AlertTriangle className="h-4 w-4" />, description: 'All security incidents and their status' },
  { id: 'threats', label: 'Threat Intelligence', icon: <Shield className="h-4 w-4" />, description: 'Active and historical threat data' },
  { id: 'alerts', label: 'Security Alerts', icon: <Activity className="h-4 w-4" />, description: 'Alert history and resolutions' },
  { id: 'users', label: 'User Risk Scores', icon: <Users className="h-4 w-4" />, description: 'User behavior and risk assessments' },
];

export const ReportExport = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [timeRange, setTimeRange] = useState('30');
  const [selectedSections, setSelectedSections] = useState<string[]>(['incidents', 'threats']);
  const [generatedReports, setGeneratedReports] = useState<{ name: string; data: string; format: string }[]>([]);

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const generateReport = async () => {
    if (!profile?.organization_id) {
      toast({ title: "Error", description: "No organization found", variant: "destructive" });
      return;
    }

    if (selectedSections.length === 0) {
      toast({ title: "Error", description: "Please select at least one section", variant: "destructive" });
      return;
    }

    setLoading(true);
    const reports: { name: string; data: string; format: string }[] = [];
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    try {
      for (const section of selectedSections) {
        let data: any[] = [];
        let name = '';

        switch (section) {
          case 'incidents':
            name = 'security_incidents';
            const { data: incidents } = await supabase
              .from('security_incidents')
              .select('id, title, description, incident_type, severity, status, detected_at, resolved_at, risk_score')
              .eq('organization_id', profile.organization_id)
              .gte('created_at', daysAgo.toISOString())
              .order('created_at', { ascending: false });
            data = incidents || [];
            break;

          case 'threats':
            name = 'threat_intelligence';
            const { data: threats } = await supabase
              .from('threat_intelligence')
              .select('id, threat_type, indicator_type, indicator_value, severity, confidence_level, source, first_seen, last_seen, is_active')
              .or(`organization_id.eq.${profile.organization_id},organization_id.is.null`)
              .gte('created_at', daysAgo.toISOString())
              .order('created_at', { ascending: false });
            data = threats || [];
            break;

          case 'alerts':
            name = 'security_alerts';
            const { data: alerts } = await supabase
              .from('security_alerts')
              .select('id, title, description, alert_type, priority, is_resolved, is_acknowledged, source_system, created_at, resolved_at')
              .eq('organization_id', profile.organization_id)
              .gte('created_at', daysAgo.toISOString())
              .order('created_at', { ascending: false });
            data = alerts || [];
            break;

          case 'users':
            name = 'user_risk_scores';
            const { data: riskScores } = await supabase
              .from('risk_scores')
              .select('id, user_id, overall_score, phishing_susceptibility, behavior_anomaly_score, insider_threat_risk, compliance_score, last_calculated')
              .gte('created_at', daysAgo.toISOString())
              .order('overall_score', { ascending: false });
            data = riskScores || [];
            break;
        }

        if (data.length > 0) {
          const formattedData = format === 'csv' 
            ? convertToCSV(data)
            : JSON.stringify(data, null, 2);
          
          reports.push({ name, data: formattedData, format });
        }
      }

      setGeneratedReports(reports);
      
      toast({
        title: "Reports Generated",
        description: `Successfully generated ${reports.length} report(s)`,
      });
    } catch (error) {
      console.error('Error generating reports:', error);
      toast({
        title: "Error",
        description: "Failed to generate reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadReport = (report: { name: string; data: string; format: string }) => {
    const blob = new Blob([report.data], { 
      type: report.format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `${report.name}_${timestamp}.${report.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `${report.name}.${report.format} is downloading`,
    });
  };

  const downloadAll = () => {
    generatedReports.forEach(report => downloadReport(report));
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-cyber">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Security Report
          </CardTitle>
          <CardDescription>
            Export security data for compliance, auditing, or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format and Time Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={(v: 'csv' | 'json') => setFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Excel Compatible)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      JSON (Developer Format)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last 7 Days
                    </div>
                  </SelectItem>
                  <SelectItem value="30">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last 30 Days
                    </div>
                  </SelectItem>
                  <SelectItem value="90">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last 90 Days
                    </div>
                  </SelectItem>
                  <SelectItem value="365">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last Year
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Report Sections */}
          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportSections.map((section) => (
                <div 
                  key={section.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedSections.includes(section.id) 
                      ? 'border-primary/50 bg-primary/10' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Checkbox 
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <Label htmlFor={section.id} className="font-medium cursor-pointer">
                        {section.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading || selectedSections.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Reports...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <CardTitle>Generated Reports</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
            <CardDescription>
              Click on a report to download it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedReports.map((report, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => downloadReport(report)}
                >
                  <div className="flex items-center gap-3">
                    {report.format === 'csv' ? (
                      <FileSpreadsheet className="h-5 w-5 text-success" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.data.split('\n').length} records
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">.{report.format}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
