import { useAuth } from "@/hooks/useAuth";
import DatabaseViewer from "@/components/DatabaseViewer";
import UserManagement from "@/components/UserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Database, Settings } from "lucide-react";
import { Layout } from "@/components/Layout";

const Admin = () => {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System administration and database management
            </p>
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

          {/* User Management */}
          <UserManagement />
          
          {/* Database Viewer */}
          <div className="mt-6">
            <DatabaseViewer />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;