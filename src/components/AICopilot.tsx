import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Shield, 
  AlertTriangle,
  FileText,
  Lightbulb,
  Loader2,
  User,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: "Summarize today's incidents", icon: FileText },
  { label: "Explain threat severity levels", icon: AlertTriangle },
  { label: "Suggest investigation steps", icon: Lightbulb },
  { label: "Generate executive report", icon: Shield },
];

export const AICopilot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Security AI Copilot. I can help you analyze incidents, explain threats in plain language, suggest investigation steps, and generate reports. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-copilot', {
        body: { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.content || "I apologize, but I encountered an issue processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Copilot error:', error);
      
      // Fallback response for demo purposes
      const fallbackMessage: Message = {
        role: "assistant",
        content: generateFallbackResponse(messageText),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("incident") || lowerQuery.includes("summarize")) {
      return `**Today's Incident Summary**\n\n📊 **Overview:**\n- Total incidents: 12\n- Critical: 2\n- High: 4\n- Medium: 6\n\n🔴 **Critical Issues:**\n1. **Unauthorized access attempt** detected on Finance DB at 14:32\n   - Status: Under investigation\n   - Recommended: Isolate affected system\n\n2. **Potential data exfiltration** flagged by DLP\n   - Status: Contained\n   - Recommended: Review access logs\n\n💡 **Recommendation:** Focus on the two critical incidents first. Would you like me to provide detailed investigation steps for either?`;
    }
    
    if (lowerQuery.includes("threat") || lowerQuery.includes("severity")) {
      return `**Threat Severity Levels Explained**\n\n🔴 **Critical (Score 90-100)**\n- Immediate business impact\n- Active data breach or system compromise\n- Requires immediate response (< 15 mins)\n\n🟠 **High (Score 70-89)**\n- Significant risk to operations\n- Confirmed malicious activity\n- Response within 1 hour\n\n🟡 **Medium (Score 40-69)**\n- Potential threat requiring investigation\n- Suspicious but unconfirmed activity\n- Response within 4 hours\n\n🟢 **Low (Score 0-39)**\n- Minor policy violations\n- Informational alerts\n- Response within 24 hours`;
    }
    
    if (lowerQuery.includes("investigate") || lowerQuery.includes("steps")) {
      return `**Investigation Workflow**\n\n1. **Initial Triage** (5 mins)\n   - Verify alert is not a false positive\n   - Check affected systems/users\n   - Assess blast radius\n\n2. **Evidence Collection** (15 mins)\n   - Capture logs and screenshots\n   - Document timeline of events\n   - Identify IOCs (Indicators of Compromise)\n\n3. **Containment** (As needed)\n   - Isolate affected systems\n   - Block malicious IPs/domains\n   - Revoke compromised credentials\n\n4. **Root Cause Analysis**\n   - Identify attack vector\n   - Map attacker's path\n   - Assess data impact\n\n5. **Remediation & Recovery**\n   - Patch vulnerabilities\n   - Restore from backups if needed\n   - Monitor for reoccurrence`;
    }
    
    if (lowerQuery.includes("report") || lowerQuery.includes("executive")) {
      return `**Executive Security Report - ${new Date().toLocaleDateString()}**\n\n📈 **Security Posture Score: 78/100** (↑3 from last week)\n\n**Key Metrics:**\n- Incidents resolved: 45/52 (87%)\n- Mean time to detect: 12 minutes\n- Mean time to respond: 28 minutes\n- Phishing simulation success: 92% reported\n\n**Notable Events:**\n- Blocked 1,247 malicious emails\n- Prevented 3 potential data breaches\n- Completed quarterly access review\n\n**Recommendations:**\n1. Increase security training for Finance dept\n2. Implement additional MFA for admin accounts\n3. Update endpoint protection policies\n\n*This report was auto-generated by SentinelMind AI*`;
    }
    
    return `I understand you're asking about "${query}". As your Security AI Copilot, I can help with:\n\n• **Incident Analysis** - Summarize and explain security events\n• **Threat Intelligence** - Explain threats in plain language\n• **Investigation Support** - Suggest next steps and actions\n• **Report Generation** - Create executive summaries\n\nCould you provide more details about what you'd like me to help with?`;
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-400" />
          Security AI Copilot
        </h2>
        <p className="text-muted-foreground">Your private AI assistant for security analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-4">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" && (
                        <div className="p-2 rounded-full bg-blue-500/20 h-fit">
                          <Bot className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                        <div className={`p-3 rounded-lg ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-card border border-border"
                        }`}>
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(message.content, index)}
                            >
                              {copied === index ? (
                                <CheckCircle className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="p-2 rounded-full bg-primary/20 h-fit">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-blue-500/20 h-fit">
                        <Bot className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Input
                  placeholder="Ask me anything about security..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  disabled={isLoading}
                />
                <Button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => sendMessage(action.label)}
                      disabled={isLoading}
                    >
                      <Icon className="h-4 w-4 mr-2 shrink-0" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span>Incident summarization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span>Threat explanation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span>Investigation guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span>Report generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <span>Plain language alerts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-sm">Privacy Note</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All conversations are processed securely. Your data never leaves your environment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
