import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, EyeOff, Trash2, Plus, RefreshCw, AlertTriangle, 
  Shield, Clock, TrendingUp, TrendingDown, Minus 
} from 'lucide-react';
import { 
  useIOCWatchlist, 
  useAddIOC, 
  useRemoveIOC, 
  useToggleIOC, 
  useTriggerIOCScan,
  IOCWatchlistItem 
} from '@/hooks/useIOCWatchlist';
import { format } from 'date-fns';

export const IOCWatchlistManager = () => {
  const { data: watchlist, isLoading } = useIOCWatchlist();
  const addIOC = useAddIOC();
  const removeIOC = useRemoveIOC();
  const toggleIOC = useToggleIOC();
  const triggerScan = useTriggerIOCScan();

  const [newIOC, setNewIOC] = useState({ type: 'ip', value: '', description: '' });

  const handleAddIOC = () => {
    if (!newIOC.value.trim()) return;
    addIOC.mutate({
      indicator_type: newIOC.type,
      indicator_value: newIOC.value.trim(),
      description: newIOC.description || undefined,
    });
    setNewIOC({ type: 'ip', value: '', description: '' });
  };

  const getRiskBadge = (item: IOCWatchlistItem) => {
    if (item.last_risk_score === null) {
      return <Badge variant="outline" className="text-muted-foreground">Not scanned</Badge>;
    }
    if (item.is_malicious) {
      return <Badge variant="destructive">Malicious ({item.last_risk_score}%)</Badge>;
    }
    if (item.last_risk_score > 30) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Suspicious ({item.last_risk_score}%)</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Clean ({item.last_risk_score}%)</Badge>;
  };

  const getChangeIndicator = (item: IOCWatchlistItem) => {
    if (item.previous_risk_score === null || item.last_risk_score === null) return null;
    const change = item.last_risk_score - item.previous_risk_score;
    if (change > 0) {
      return <span className="flex items-center text-red-400 text-xs"><TrendingUp className="h-3 w-3 mr-1" />+{change}</span>;
    }
    if (change < 0) {
      return <span className="flex items-center text-green-400 text-xs"><TrendingDown className="h-3 w-3 mr-1" />{change}</span>;
    }
    return <span className="flex items-center text-muted-foreground text-xs"><Minus className="h-3 w-3 mr-1" />0</span>;
  };

  const activeCount = watchlist?.filter(i => i.is_active).length || 0;
  const maliciousCount = watchlist?.filter(i => i.is_malicious).length || 0;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Total IOCs</p>
                <p className="text-2xl font-bold">{watchlist?.length || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Active Monitoring</p>
                <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Malicious</p>
                <p className="text-2xl font-bold text-red-400">{maliciousCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <Button 
              onClick={() => triggerScan.mutate()} 
              disabled={triggerScan.isPending}
              className="w-full h-full"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${triggerScan.isPending ? 'animate-spin' : ''}`} />
              {triggerScan.isPending ? 'Scanning...' : 'Run Scan Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add IOC Form */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add IOC to Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={newIOC.type} onValueChange={(v) => setNewIOC(p => ({ ...p, type: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="hash">File Hash</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter indicator value..."
              value={newIOC.value}
              onChange={(e) => setNewIOC(p => ({ ...p, value: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Description (optional)"
              value={newIOC.description}
              onChange={(e) => setNewIOC(p => ({ ...p, description: e.target.value }))}
              className="w-48"
            />
            <Button onClick={handleAddIOC} disabled={!newIOC.value.trim() || addIOC.isPending}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">IOC Watchlist</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : watchlist?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No IOCs in watchlist. Add some indicators to start monitoring.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/30 sticky top-0">
                  <tr className="text-xs text-muted-foreground">
                    <th className="p-3 text-left">Active</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Indicator</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Change</th>
                    <th className="p-3 text-left">Last Scan</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist?.map((item) => (
                    <tr key={item.id} className="border-t border-border/30 hover:bg-muted/20">
                      <td className="p-3">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => toggleIOC.mutate({ id: item.id, is_active: checked })}
                        />
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.indicator_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-mono text-sm">{item.indicator_value}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{getRiskBadge(item)}</td>
                      <td className="p-3">{getChangeIndicator(item)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.last_scan_at 
                            ? format(new Date(item.last_scan_at), 'MMM d, HH:mm')
                            : 'Never'}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeIOC.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
