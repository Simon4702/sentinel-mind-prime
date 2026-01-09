import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Loader2,
  Copy,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisPanelProps {
  title: string;
  analysisType: "IOC" | "Alert" | "Incident" | "Threat";
  isAnalyzing: boolean;
  analysisResult: string | null;
  onAnalyze: () => void;
  onClose?: () => void;
}

export const AIAnalysisPanel = ({
  title,
  analysisType,
  isAnalyzing,
  analysisResult,
  onAnalyze,
  onClose,
}: AIAnalysisPanelProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeColor = () => {
    switch (analysisType) {
      case "IOC":
        return "bg-purple-500/20 text-purple-400";
      case "Alert":
        return "bg-amber-500/20 text-amber-400";
      case "Incident":
        return "bg-red-500/20 text-red-400";
      case "Threat":
        return "bg-cyan-500/20 text-cyan-400";
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Analysis
            <Badge variant="outline" className={getTypeColor()}>
              {analysisType}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {analysisResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent>
        {!analysisResult && !isAnalyzing && (
          <Button
            onClick={onAnalyze}
            className="w-full gap-2"
            variant="outline"
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Analysis
          </Button>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Analyzing with AI...
            </span>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <ScrollArea className="h-[300px] pr-4">
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysisResult}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
