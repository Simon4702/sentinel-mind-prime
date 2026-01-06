import { ReactNode } from "react";
import { TacticalHeader, TacticalNavigation, ClassificationBanner } from "@/components/tactical";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background tactical-grid">
      {/* Classification Banner */}
      <ClassificationBanner level="UNCLASSIFIED" caveats={['FOUO']} position="top" />
      
      {/* Add padding for classification banner */}
      <div className="pt-5">
        {/* Tactical Header */}
        <TacticalHeader classification="UNCLASSIFIED" />

        {/* Tactical Navigation */}
        <TacticalNavigation />

        {/* Main Content with scanline effect */}
        <main className="scanline min-h-[calc(100vh-180px)]">
          {children}
        </main>

        {/* Footer Status Bar */}
        <footer className="border-t border-accent/20 bg-black/60 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>SENTINEL PRIME v3.0.0-TACTICAL</span>
              <span className="text-accent">|</span>
              <span className="flex items-center gap-1">
                <span className="status-light active" />
                ALL SYSTEMS NOMINAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>ENCRYPTION: AES-256-GCM</span>
              <span className="text-accent">|</span>
              <span>AUDIT: ENABLED</span>
              <span className="text-accent">|</span>
              <span>MFA: ACTIVE</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
