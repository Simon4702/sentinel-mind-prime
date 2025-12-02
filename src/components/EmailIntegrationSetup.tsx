import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Mail, 
  Shield, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  Settings,
  Webhook
} from "lucide-react";
import { toast } from "sonner";

interface IntegrationStatus {
  gmail: boolean;
  outlook: boolean;
  webhook: boolean;
}

export const EmailIntegrationSetup = () => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    gmail: false,
    outlook: false,
    webhook: false
  });
  
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-monitor`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const testWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'test-phishing@suspicious-domain.xyz',
          to: 'user@company.com',
          subject: 'URGENT: Your account will be suspended - Verify Now!',
          text: 'Dear Customer, Your account has been compromised. Click here to verify: http://secure-login-paypa1.com/verify',
          provider: 'webhook'
        })
      });
      
      const result = await response.json();
      
      if (result.analysis?.isPhishing) {
        toast.success('Webhook working! Phishing detected with risk score: ' + result.analysis.riskScore + '%');
      } else {
        toast.info('Webhook working! Email analyzed with risk score: ' + result.analysis?.riskScore + '%');
      }
    } catch (error) {
      toast.error('Webhook test failed: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Integration Setup</h2>
          <p className="text-muted-foreground">Connect your email services for real-time phishing detection</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Real-Time Protection
        </Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Webhook Endpoint Ready</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Your email monitoring endpoint is active and ready to receive emails.</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="bg-muted px-2 py-1 rounded text-xs flex-1 overflow-x-auto">
              {webhookUrl}
            </code>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="gmail" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gmail" className="gap-2">
            <Mail className="h-4 w-4" />
            Gmail
          </TabsTrigger>
          <TabsTrigger value="outlook" className="gap-2">
            <Mail className="h-4 w-4" />
            Outlook/M365
          </TabsTrigger>
          <TabsTrigger value="webhook" className="gap-2">
            <Webhook className="h-4 w-4" />
            Generic Webhook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gmail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-500" />
                Google Workspace / Gmail Integration
              </CardTitle>
              <CardDescription>
                Set up Gmail API with Pub/Sub to monitor incoming emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="text-primary hover:underline">Google Cloud Console</a></li>
                    <li>Enable the Gmail API and Pub/Sub API</li>
                    <li>Create a Pub/Sub topic (e.g., "email-notifications")</li>
                    <li>Create a push subscription with your webhook URL</li>
                    <li>Configure Gmail API to watch for incoming messages</li>
                    <li>Grant publish permissions to gmail-api-push@system.gserviceaccount.com</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label>Push Subscription URL</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" onClick={() => copyToClipboard(webhookUrl, 'URL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noopener">
                      <ExternalLink className="h-4 w-4" />
                      Enable Gmail API
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://console.cloud.google.com/cloudpubsub" target="_blank" rel="noopener">
                      <ExternalLink className="h-4 w-4" />
                      Configure Pub/Sub
                    </a>
                  </Button>
                </div>
              </div>

              {integrationStatus.gmail && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Gmail Connected</AlertTitle>
                  <AlertDescription>Monitoring incoming emails for phishing threats</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outlook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Microsoft 365 / Outlook Integration
              </CardTitle>
              <CardDescription>
                Set up Microsoft Graph API webhooks to monitor Outlook emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener" className="text-primary hover:underline">Azure Portal</a></li>
                    <li>Register an application in Azure AD</li>
                    <li>Grant Mail.Read permission (Application type)</li>
                    <li>Create a subscription using Microsoft Graph API</li>
                    <li>Set notificationUrl to your webhook endpoint</li>
                    <li>Configure changeType as "created" for new emails</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label>Notification URL for Graph API</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" onClick={() => copyToClipboard(webhookUrl, 'URL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <Label className="text-xs">Graph API Subscription Request Example:</Label>
                  <pre className="text-xs overflow-x-auto p-2 bg-background rounded">
{`POST https://graph.microsoft.com/v1.0/subscriptions
{
  "changeType": "created",
  "notificationUrl": "${webhookUrl}",
  "resource": "me/mailFolders('Inbox')/messages",
  "expirationDateTime": "2024-12-31T00:00:00Z",
  "clientState": "your-secret-state"
}`}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener">
                      <ExternalLink className="h-4 w-4" />
                      Azure App Registration
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://learn.microsoft.com/en-us/graph/api/subscription-post-subscriptions" target="_blank" rel="noopener">
                      <ExternalLink className="h-4 w-4" />
                      Graph API Docs
                    </a>
                  </Button>
                </div>
              </div>

              {integrationStatus.outlook && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Outlook Connected</AlertTitle>
                  <AlertDescription>Monitoring incoming emails for phishing threats</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-purple-500" />
                Generic Webhook Integration
              </CardTitle>
              <CardDescription>
                Works with SendGrid, Mailgun, Postmark, or any email service with inbound parsing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Supported Providers:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      SendGrid Inbound Parse
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Mailgun Routes
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Postmark Inbound
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Custom SMTP Relay
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Endpoint</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" onClick={() => copyToClipboard(webhookUrl, 'URL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <Label className="text-xs">Expected JSON Payload Format:</Label>
                  <pre className="text-xs overflow-x-auto p-2 bg-background rounded">
{`{
  "from": "sender@example.com",
  "to": "recipient@yourcompany.com",
  "subject": "Email Subject",
  "text": "Plain text body",
  "html": "<p>HTML body (optional)</p>",
  "headers": { ... }
}`}
                  </pre>
                </div>

                <Button onClick={testWebhook} className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Test Webhook with Sample Phishing Email
                </Button>
              </div>

              {integrationStatus.webhook && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Webhook Active</AlertTitle>
                  <AlertDescription>Ready to receive and analyze forwarded emails</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            What Gets Analyzed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Email Content Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Domain spoofing detection</li>
                <li>• Urgency language patterns</li>
                <li>• Credential harvesting keywords</li>
                <li>• Sender/display name mismatch</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">URL & Link Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Typosquatting detection</li>
                <li>• Suspicious TLD identification</li>
                <li>• IP-based URL detection</li>
                <li>• Known malicious patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
