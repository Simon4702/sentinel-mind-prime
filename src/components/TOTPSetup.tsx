import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Shield, Smartphone, CheckCircle2, XCircle, Loader2, Copy, Key } from 'lucide-react';
import { useTOTPAuth } from '@/hooks/useTOTPAuth';
import { useToast } from '@/hooks/use-toast';

interface TOTPSetupProps {
  onVerified?: () => void;
  mode?: 'setup' | 'verify';
}

export const TOTPSetup = ({ onVerified, mode = 'setup' }: TOTPSetupProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStep, setSetupStep] = useState<'initial' | 'scanning' | 'verifying' | 'complete'>('initial');
  const { toast } = useToast();
  
  const {
    isLoading,
    setupData,
    isEnabled,
    generateTOTPSecret,
    enableTOTP,
    verifyTOTP,
    disableTOTP,
    checkTOTPStatus,
  } = useTOTPAuth();

  useEffect(() => {
    checkTOTPStatus();
  }, [checkTOTPStatus]);

  const handleStartSetup = async () => {
    const data = await generateTOTPSecret();
    if (data) {
      setSetupStep('scanning');
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6 || !setupData) return;
    
    setSetupStep('verifying');
    const success = await enableTOTP(verificationCode, setupData.secret);
    
    if (success) {
      setSetupStep('complete');
      onVerified?.();
    } else {
      setSetupStep('scanning');
      setVerificationCode('');
    }
  };

  const handleVerifyLogin = async () => {
    if (verificationCode.length !== 6) return;
    
    const isValid = await verifyTOTP(verificationCode);
    if (isValid) {
      onVerified?.();
    } else {
      setVerificationCode('');
    }
  };

  const handleDisable = async () => {
    await disableTOTP();
    setSetupStep('initial');
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
    }
  };

  // Verification mode for login
  if (mode === 'verify') {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={verificationCode}
              onChange={setVerificationCode}
              maxLength={6}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <Button
            onClick={handleVerifyLogin}
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Setup mode
  if (isEnabled && setupStep !== 'complete') {
    return (
      <Card className="border-green-500/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">TOTP Authentication</CardTitle>
                <CardDescription>Two-factor authentication is enabled</CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Disable TOTP
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'complete') {
    return (
      <Card className="border-green-500/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-500/10 w-fit">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-xl text-green-400">TOTP Enabled Successfully!</CardTitle>
          <CardDescription>
            Your account is now protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500/20 bg-green-500/5">
            <Shield className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-300">
              You'll need to enter a code from your authenticator app each time you sign in.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'scanning' && setupData) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Set Up Authenticator</CardTitle>
          <CardDescription>
            Scan the QR code with Google Authenticator, Authy, or similar app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              <img 
                src={setupData.qrCodeUrl} 
                alt="TOTP QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Manual entry secret */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Or enter this code manually:
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
              <code className="flex-1 break-all text-center">{setupData.secret}</code>
              <Button variant="ghost" size="icon" onClick={copySecret}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verification input */}
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Enter the 6-digit code from your app to verify:
            </p>
            <div className="flex justify-center">
              <InputOTP
                value={verificationCode}
                onChange={setVerificationCode}
                maxLength={6}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSetupStep('initial')}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyAndEnable}
              disabled={verificationCode.length !== 6 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Enable TOTP
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial state
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">TOTP Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security with time-based codes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-primary/20 bg-primary/5">
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Use Google Authenticator, Authy, or any TOTP-compatible app to generate verification codes.
          </AlertDescription>
        </Alert>
        
        <Button
          onClick={handleStartSetup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Set Up TOTP
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
