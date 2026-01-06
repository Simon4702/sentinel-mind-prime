import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Lock, Fingerprint, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userSignUpSchema, userSignInSchema, emailSchema, passwordSchema } from "@/lib/validation";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL for recovery hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
          setResetMode(false);
          toast({
            title: "Password recovery",
            description: "Please enter your new password below.",
          });
        } else if (session?.user) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validation = userSignUpSchema.safeParse({
      email: email.trim(),
      password,
      fullName: fullName.trim()
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(signUpError.message);
      }
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validation = userSignInSchema.safeParse({
      email: email.trim(),
      password
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(signInError.message);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validation = emailSchema.safeParse(email.trim());
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/auth`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      toast({
        title: "Reset link sent",
        description: "Please check your email for password reset instructions.",
      });
      setResetMode(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setResetMode(false);
      navigate("/");
    }
  };

  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';

  return (
    <div className="min-h-screen bg-background tactical-grid flex flex-col">
      {/* Classification Banner */}
      <div className="classification-banner classification-unclassified">
        UNCLASSIFIED // FOUO
      </div>

      {/* Status Bar */}
      <div className="border-b border-accent/20 bg-black/60 px-4 py-1">
        <div className="container mx-auto flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="status-light active" />
              SECURE CONNECTION
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              TLS 1.3 / AES-256-GCM
            </span>
          </div>
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background Shield */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[800px] h-[800px]" 
            viewBox="0 0 400 400" 
            fill="none"
          >
            <path 
              d="M200 50 L320 100 L320 200 Q320 280 200 350 Q80 280 80 200 L80 100 Z" 
              stroke="hsl(45, 100%, 50%)" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M200 80 L290 115 L290 190 Q290 250 200 310 Q110 250 110 190 L110 115 Z" 
              stroke="hsl(120, 60%, 40%)" 
              strokeWidth="1" 
              fill="none" 
            />
          </svg>
        </div>

        <Card className="w-full max-w-md tactical-card relative z-10">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-2 border-primary rounded-sm flex items-center justify-center bg-black/50 relative">
                <Shield className="h-9 w-9 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-tactical-pulse" />
              </div>
            </div>
            <CardTitle className="font-tactical text-2xl tracking-wider text-primary">
              SENTINEL PRIME
            </CardTitle>
            <CardDescription className="font-mono text-[11px] tracking-wider">
              TACTICAL DEFENSE OPERATIONS CENTER
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-mono text-muted-foreground">
              <Fingerprint className="h-3 w-3" />
              <span>SECURE ACCESS TERMINAL</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                <TabsTrigger value="signin" className="font-tactical text-xs tracking-wider">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-tactical text-xs tracking-wider">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {recoveryMode ? (
                  <form onSubmit={handleUpdatePassword} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password-reset" className="font-mono text-xs uppercase tracking-wider">
                        New Password
                      </Label>
                      <Input
                        id="new-password-reset"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-muted/30 border-accent/30 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password-reset" className="font-mono text-xs uppercase tracking-wider">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password-reset"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-muted/30 border-accent/30 font-mono"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full btn-tactical font-tactical tracking-wider" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      UPDATE PASSWORD
                    </Button>
                  </form>
                ) : !resetMode ? (
                  <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="font-mono text-xs uppercase tracking-wider">
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-muted/30 border-accent/30 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="font-mono text-xs uppercase tracking-wider">
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-muted/30 border-accent/30 font-mono"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full font-tactical tracking-wider" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Lock className="mr-2 h-4 w-4" />
                      AUTHENTICATE
                    </Button>
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-xs font-mono text-muted-foreground hover:text-primary"
                        onClick={() => setResetMode(true)}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="font-mono text-xs uppercase tracking-wider">
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-muted/30 border-accent/30 font-mono"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full font-tactical tracking-wider" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      SEND RESET LINK
                    </Button>
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-xs font-mono text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setResetMode(false);
                          setError("");
                        }}
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-mono text-xs uppercase tracking-wider">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-muted/30 border-accent/30 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-mono text-xs uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/30 border-accent/30 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-mono text-xs uppercase tracking-wider">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-muted/30 border-accent/30 font-mono"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                      <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full font-tactical tracking-wider" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Fingerprint className="mr-2 h-4 w-4" />
                    CREATE ACCOUNT
                  </Button>
                </form>
              </TabsContent>
              
            </Tabs>
          </CardContent>

          {/* Security Footer */}
          <div className="px-6 pb-4 pt-2 border-t border-border/30">
            <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                256-BIT ENCRYPTION
              </span>
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-success" />
                SECURE
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Classification Banner */}
      <div className="classification-banner classification-unclassified">
        UNCLASSIFIED // FOUO
      </div>
    </div>
  );
};

export default Auth;