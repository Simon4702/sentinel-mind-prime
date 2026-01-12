import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2, CheckCircle } from 'lucide-react';

export const DataPopulatorButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const populateData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to populate threat intelligence data",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-threat-intel', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.success) {
        setResult(data.stats);
        toast({
          title: "Data Populated Successfully",
          description: `Added ${data.stats.threats} threats, ${data.stats.alerts} alerts, ${data.stats.iocs} IOCs`,
        });
      } else {
        throw new Error(data?.error || 'Failed to populate data');
      }
    } catch (error: any) {
      console.error('Error populating data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to populate threat data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={populateData} 
        disabled={loading}
        className="gap-2"
        size="lg"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : result ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        {loading ? 'Populating...' : result ? 'Data Populated!' : 'Populate Real Threat Data'}
      </Button>

      {result && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>✓ {result.threats} threat intelligence records</p>
          <p>✓ {result.alerts} security alerts</p>
          <p>✓ {result.iocs} IOC watchlist items</p>
          <p>✓ {result.honeypots} honeypots</p>
          <p>✓ {result.darkWebAlerts} dark web alerts</p>
        </div>
      )}
    </div>
  );
};
