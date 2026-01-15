import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Server,
  MapPin,
  Bug,
  Eye,
  Skull,
  Info,
} from "lucide-react";

interface EnrichmentResult {
  source: string;
  data: any;
  risk_score?: number;
  is_malicious?: boolean;
  geolocation?: any;
}

interface EnrichmentResponse {
  success: boolean;
  enrichments: EnrichmentResult[];
  aggregate_risk_score: number | null;
  is_malicious: boolean;
  geolocation: any;
  threat_actors: string[];
  related_campaigns: string[];
  sources_queried: string[];
}

export const ThreatIntelEnricher = () => {
  const [indicator, setIndicator] = useState("");
  const [indicatorType, setIndicatorType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectIndicatorType = (value: string): string => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const md5Regex = /^[a-fA-F0-9]{32}$/;
    const sha1Regex = /^[a-fA-F0-9]{40}$/;
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    const urlRegex = /^https?:\/\/.+/;

    if (ipv4Regex.test(value) || ipv6Regex.test(value)) return "ip";
    if (domainRegex.test(value)) return "domain";
    if (md5Regex.test(value) || sha1Regex.test(value) || sha256Regex.test(value)) return "hash";
    if (urlRegex.test(value)) return "url";
    return "";
  };

  const handleIndicatorChange = (value: string) => {
    setIndicator(value);
    const detected = detectIndicatorType(value.trim());
    if (detected && !indicatorType) {
      setIndicatorType(detected);
    }
  };

  const handleEnrich = async () => {
    if (!indicator.trim()) {
      toast.error("Please enter an indicator to enrich");
      return;
    }

    if (!indicatorType) {
      toast.error("Please select an indicator type");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("threat-enrichment", {
        body: {
          indicator_value: indicator.trim(),
          indicator_type: indicatorType,
        },
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setResult(data);
        toast.success(`Enrichment complete from ${data.sources_queried?.length || 0} sources`);
      } else {
        throw new Error(data?.error || "Enrichment failed");
      }
    } catch (err) {
      console.error("Enrichment error:", err);
      setError(err instanceof Error ? err.message : "Failed to enrich indicator");
      toast.error("Failed to enrich indicator");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-muted-foreground";
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const getRiskBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "secondary";
    if (score >= 70) return "destructive";
    if (score >= 40) return "default";
    return "secondary";
  };

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("virustotal")) return <Bug className="h-4 w-4" />;
    if (s.includes("abuseipdb")) return <Shield className="h-4 w-4" />;
    if (s.includes("shodan")) return <Eye className="h-4 w-4" />;
    return <Server className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Threat Intelligence Enrichment
          </CardTitle>
          <CardDescription>
            Query VirusTotal, AbuseIPDB, and Shodan for live threat intelligence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr,200px,auto]">
            <div className="space-y-2">
              <Label htmlFor="indicator">Indicator (IOC)</Label>
              <Input
                id="indicator"
                placeholder="Enter IP, domain, hash, or URL..."
                value={indicator}
                onChange={(e) => handleIndicatorChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={indicatorType} onValueChange={setIndicatorType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="hash">File Hash</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleEnrich} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enriching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Enrich
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Try:</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => {
                setIndicator("8.8.8.8");
                setIndicatorType("ip");
              }}
            >
              8.8.8.8
            </Button>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => {
                setIndicator("google.com");
                setIndicatorType("domain");
              }}
            >
              google.com
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enrichment Summary</CardTitle>
                <div className="flex items-center gap-2">
                  {result.is_malicious ? (
                    <Badge variant="destructive" className="gap-1">
                      <Skull className="h-3 w-3" />
                      Malicious
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Clean
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Aggregate Risk Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(result.aggregate_risk_score)}`}>
                    {result.aggregate_risk_score ?? "N/A"}
                    {result.aggregate_risk_score !== null && "/100"}
                  </span>
                </div>
                {result.aggregate_risk_score !== null && (
                  <Progress
                    value={result.aggregate_risk_score}
                    className="h-2"
                  />
                )}
              </div>

              {/* Sources Queried */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sources:</span>
                <div className="flex gap-2">
                  {result.sources_queried.map((source) => (
                    <Badge key={source} variant="outline" className="gap-1">
                      {getSourceIcon(source)}
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Geolocation */}
              {result.geolocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {result.geolocation.city && `${result.geolocation.city}, `}
                    {result.geolocation.country_name || result.geolocation.country}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {result.enrichments.map((enrichment, index) => (
                    <div key={index}>
                      <div className="space-y-3">
                        {/* Source Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(enrichment.source)}
                            <span className="font-semibold">{enrichment.source}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {enrichment.is_malicious !== undefined && (
                              enrichment.is_malicious ? (
                                <XCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )
                            )}
                            {enrichment.risk_score !== undefined && (
                              <Badge variant={getRiskBadge(enrichment.risk_score)}>
                                Risk: {enrichment.risk_score}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Source-specific data */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          {enrichment.source === "VirusTotal" && enrichment.data && (
                            <>
                              {enrichment.data.last_analysis_stats && (
                                <div className="grid grid-cols-4 gap-4 text-center">
                                  <div>
                                    <div className="text-2xl font-bold text-destructive">
                                      {enrichment.data.last_analysis_stats.malicious || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Malicious</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-warning">
                                      {enrichment.data.last_analysis_stats.suspicious || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Suspicious</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-success">
                                      {enrichment.data.last_analysis_stats.harmless || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Harmless</div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-muted-foreground">
                                      {enrichment.data.last_analysis_stats.undetected || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Undetected</div>
                                  </div>
                                </div>
                              )}
                              {enrichment.data.as_owner && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">AS Owner: </span>
                                  {enrichment.data.as_owner}
                                </div>
                              )}
                            </>
                          )}

                          {enrichment.source === "AbuseIPDB" && enrichment.data && (
                            <>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold text-destructive">
                                    {enrichment.data.abuse_confidence_score || 0}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">Abuse Confidence</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">
                                    {enrichment.data.total_reports || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Total Reports</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">
                                    {enrichment.data.num_distinct_users || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Reporters</div>
                                </div>
                              </div>
                              {enrichment.data.isp && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">ISP: </span>
                                  {enrichment.data.isp}
                                </div>
                              )}
                              {enrichment.data.is_tor && (
                                <Badge variant="destructive">TOR Exit Node</Badge>
                              )}
                            </>
                          )}

                          {enrichment.source === "Shodan" && enrichment.data && (
                            <>
                              {enrichment.data.ports && enrichment.data.ports.length > 0 && (
                                <div>
                                  <span className="text-sm text-muted-foreground">Open Ports: </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {enrichment.data.ports.map((port: number) => (
                                      <Badge key={port} variant="outline">
                                        {port}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {enrichment.data.vulns && enrichment.data.vulns.length > 0 && (
                                <div>
                                  <span className="text-sm text-destructive font-medium">
                                    Vulnerabilities ({enrichment.data.vulns.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {enrichment.data.vulns.slice(0, 5).map((cve: string) => (
                                      <Badge key={cve} variant="destructive">
                                        {cve}
                                      </Badge>
                                    ))}
                                    {enrichment.data.vulns.length > 5 && (
                                      <Badge variant="outline">
                                        +{enrichment.data.vulns.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              {enrichment.data.org && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Organization: </span>
                                  {enrichment.data.org}
                                </div>
                              )}
                              {enrichment.data.os && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">OS: </span>
                                  {enrichment.data.os}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {index < result.enrichments.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}

                  {result.enrichments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No enrichment data returned from the configured sources.</p>
                      <p className="text-sm">Check if API keys are properly configured.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
