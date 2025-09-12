import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Database, Users, Shield, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DatabaseViewer = () => {
  const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 10");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Direct table queries only for security
      if (query.toLowerCase().includes('profiles')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(50);
        
        if (profileError) throw profileError;
        setResults(profileData || []);
        if (profileData && profileData.length > 0) {
          setColumns(Object.keys(profileData[0]));
        }
      } else {
        throw new Error('Only profile queries are supported for security reasons');
      }
      
      toast({
        title: "Query executed successfully",
        description: `Returned ${results.length} rows`,
      });
    } catch (error: any) {
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    { name: "All Profiles", query: "SELECT * FROM profiles ORDER BY created_at DESC" },
    { name: "Admin Users", query: "SELECT * FROM profiles WHERE role = 'admin'" },
    { name: "Recent Logins", query: "SELECT email, full_name, last_login_at FROM profiles WHERE last_login_at IS NOT NULL ORDER BY last_login_at DESC" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Database className="h-6 w-6 mr-2" />
          <div>
            <CardTitle>Database Query Interface</CardTitle>
            <CardDescription>Execute SQL queries to view database information</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(item.query)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          
          <Textarea
            placeholder="Enter your SQL query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px] font-mono"
          />
          
          <Button onClick={executeQuery} disabled={loading} className="w-full">
            {loading ? "Executing..." : "Execute Query"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Query Results
              <Badge variant="secondary">{results.length} rows</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column} className="whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                          {row[column] !== null && row[column] !== undefined 
                            ? String(row[column]) 
                            : <span className="text-muted-foreground">NULL</span>
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseViewer;