import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { 
  Moon, 
  Compass, 
  AlertTriangle, 
  Ghost, 
  GraduationCap,
  User,
  Activity,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";

const profileTypes = [
  { type: "night_owl", icon: Moon, color: "text-indigo-400", bgColor: "bg-indigo-500/20", description: "Late access patterns, works outside normal hours" },
  { type: "wanderer", icon: Compass, color: "text-blue-400", bgColor: "bg-blue-500/20", description: "Moves between departments frequently" },
  { type: "risk_taker", icon: AlertTriangle, color: "text-orange-400", bgColor: "bg-orange-500/20", description: "High alert history, frequent policy pushes" },
  { type: "shadow", icon: Ghost, color: "text-purple-400", bgColor: "bg-purple-500/20", description: "Low activity but high anomaly rate" },
  { type: "rookie", icon: GraduationCap, color: "text-emerald-400", bgColor: "bg-emerald-500/20", description: "New employee, prone to security mistakes" },
];

const mockUsers = [
  { id: "1", name: "John Mitchell", email: "john.m@company.com", profileType: "night_owl", sensitivity: 75, lastActivity: "2 hours ago", anomalies: 3, patterns: ["Peak activity: 11 PM - 3 AM", "Remote access dominant", "High file access after hours"] },
  { id: "2", name: "Sarah Chen", email: "sarah.c@company.com", profileType: "wanderer", sensitivity: 60, lastActivity: "30 min ago", anomalies: 1, patterns: ["Access to 5+ departments", "Frequent permission changes", "Cross-team collaboration"] },
  { id: "3", name: "Mike Rodriguez", email: "mike.r@company.com", profileType: "risk_taker", sensitivity: 85, lastActivity: "1 hour ago", anomalies: 7, patterns: ["Clicked 3 phishing tests", "Bypassed 2 security warnings", "External USB usage"] },
  { id: "4", name: "Emily Watson", email: "emily.w@company.com", profileType: "shadow", sensitivity: 90, lastActivity: "3 days ago", anomalies: 5, patterns: ["Minimal login activity", "Burst access patterns", "Unusual data queries"] },
  { id: "5", name: "Tom Anderson", email: "tom.a@company.com", profileType: "rookie", sensitivity: 70, lastActivity: "15 min ago", anomalies: 2, patterns: ["Onboarded 2 weeks ago", "Multiple failed logins", "Security training incomplete"] },
];

const getProfileInfo = (type: string) => profileTypes.find(p => p.type === type) || profileTypes[0];

const ProfileCard = ({ user }: { user: typeof mockUsers[0] }) => {
  const profile = getProfileInfo(user.profileType);
  const Icon = profile.icon;

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${profile.bgColor}`}>
            <Icon className={`h-6 w-6 ${profile.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <Badge className={`${profile.bgColor} ${profile.color} border-0`}>
                {user.profileType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Detection Sensitivity</span>
                  <span className="font-medium">{user.sensitivity}%</span>
                </div>
                <Progress value={user.sensitivity} className="h-2" />
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{user.lastActivity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  <span>{user.anomalies} anomalies</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/30">
                <div className="text-xs text-muted-foreground mb-2">Behavioral Patterns</div>
                <div className="flex flex-wrap gap-1">
                  {user.patterns.map((pattern, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{pattern}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CognitiveProfiles = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-blue-400" />
          Neuro-Style Cognitive Profiles
        </h2>
        <p className="text-muted-foreground">Behavior personalities with tuned detection sensitivity</p>
      </div>

      {/* Profile Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {profileTypes.map((profile) => {
          const Icon = profile.icon;
          const count = mockUsers.filter(u => u.profileType === profile.type).length;
          return (
            <Card key={profile.type} className={`${profile.bgColor} border-0`}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 ${profile.color} mx-auto mb-2`} />
                <div className={`font-semibold ${profile.color}`}>
                  {profile.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-2xl font-bold mt-1">{count}</div>
                <div className="text-xs text-muted-foreground mt-1">{profile.description}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockUsers.length}</div>
                <div className="text-sm text-muted-foreground">Profiled Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">76%</div>
                <div className="text-sm text-muted-foreground">Avg Sensitivity</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">18</div>
                <div className="text-sm text-muted-foreground">Total Anomalies</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Detection Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockUsers.map((user) => (
          <ProfileCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default CognitiveProfiles;
