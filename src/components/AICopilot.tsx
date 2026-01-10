import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  Trash2,
  Maximize2,
  Minimize2,
  Zap,
  Target,
  Search,
  Network
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "general" | "analysis" | "report" | "investigation";
}

const quickActions = [
  { label: "Summarize today's incidents", icon: FileText, type: "report" },
  { label: "Explain threat severity levels", icon: AlertTriangle, type: "general" },
  { label: "Suggest investigation steps for ransomware", icon: Lightbulb, type: "investigation" },
  { label: "Generate executive security report", icon: Shield, type: "report" },
  { label: "Analyze IOC: suspicious IP 185.220.101.0", icon: Target, type: "analysis" },
  { label: "Explain MITRE ATT&CK technique T1566", icon: Network, type: "general" },
  { label: "What are signs of lateral movement?", icon: Search, type: "investigation" },
  { label: "Create incident response checklist", icon: Zap, type: "investigation" },
];

const CHAT_URL = "https://pboadzdcadtvuqzigysv.supabase.co/functions/v1/ai-copilot";

export const AICopilot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Security AI Copilot powered by advanced AI. I can help you:\n\n• **Analyze threats & IOCs** - Get instant risk assessments\n• **Investigate incidents** - Step-by-step guidance\n• **Generate reports** - Executive summaries & technical docs\n• **Explain attacks** - Plain language threat explanations\n• **MITRE ATT&CK mapping** - Understand techniques & tactics\n\nHow can I assist you today?",
      timestamp: new Date(),
      type: "general",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBib2FkemRjYWR0dnVxemlneXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI2NTEsImV4cCI6MjA3MzE0ODY1MX0.vYijJKR4f0uAhS1PAtq4GJNp2TqfWoUC_TWEFJq4vlo",
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      throw new Error(errorData.error || "Failed to get AI response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === "assistant") {
                lastMessage.content = assistantContent;
              }
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === "assistant") {
                lastMessage.content = assistantContent;
              }
              return newMessages;
            });
          }
        } catch { /* ignore */ }
      }
    }

    return assistantContent;
  };

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
      const chatMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
      await streamChat(chatMessages);
    } catch (error) {
      console.error('AI Copilot error:', error);
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "assistant" && !lastMessage.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([{
      role: "assistant",
      content: "Conversation cleared. How can I help you with your security analysis?",
      timestamp: new Date(),
      type: "general",
    }]);
    toast({ title: "Conversation cleared" });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(null), 2000);
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case "analysis": return "bg-purple-500/20 text-purple-400";
      case "report": return "bg-blue-500/20 text-blue-400";
      case "investigation": return "bg-amber-500/20 text-amber-400";
      default: return "bg-emerald-500/20 text-emerald-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Security AI Copilot
            <Badge variant="outline" className="ml-2 text-xs">Powered by Gemini</Badge>
          </h2>
          <p className="text-muted-foreground">Your AI assistant for threat analysis, incident response & security insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearConversation}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Chat Interface */}
        <div className={isExpanded ? '' : 'lg:col-span-3'}>
          <Card className={`flex flex-col ${isExpanded ? 'h-[700px]' : 'h-[600px]'}`}>
            <CardContent className="flex-1 flex flex-col p-4">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" && (
                        <div className="p-2 rounded-full bg-primary/20 h-fit">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}>
                        <div className={`p-4 rounded-lg ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-card border border-border"
                        }`}>
                          {message.role === "assistant" && message.type && (
                            <Badge className={`${getMessageTypeColor(message.type)} mb-2`}>
                              {message.type}
                            </Badge>
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === "assistant" && message.content && (
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
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-primary/20 h-fit">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Textarea
                  placeholder="Ask about threats, incidents, IOCs, or security best practices..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  disabled={isLoading}
                  className="min-h-[44px] max-h-[120px] resize-none"
                  rows={1}
                />
                <Button 
                  onClick={() => sendMessage(input)} 
                  disabled={isLoading || !input.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only show when not expanded */}
        {!isExpanded && (
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
                        className="w-full justify-start text-left h-auto py-2.5 px-3"
                        onClick={() => sendMessage(action.label)}
                        disabled={isLoading}
                      >
                        <Icon className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-xs leading-tight">{action.label}</span>
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
                    <span>IOC analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                    <span>MITRE ATT&CK mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                    <span>Investigation guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                    <span>Report generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">AI Powered</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Powered by Google Gemini for real-time security analysis, threat intelligence, and incident response guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICopilot;
