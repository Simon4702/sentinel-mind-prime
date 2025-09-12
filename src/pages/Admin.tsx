import { useAuth } from "@/hooks/useAuth";
import DatabaseViewer from "@/components/DatabaseViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Database, Settings, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                System administration and database management
              </p>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="default">{profile?.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Clearance</p>
                <Badge variant="secondary">Level {profile?.security_clearance_level}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Viewer */}
        <DatabaseViewer />
      </div>
    </div>
  );
};

export default Admin;