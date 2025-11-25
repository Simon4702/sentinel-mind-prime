import { ReactNode } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Navigation } from "@/components/Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <nav className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">SentinelMind</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.department || 'Security Platform'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Menu */}
      <Navigation />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
