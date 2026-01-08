import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Fingerprint, 
  ScanFace, 
  ShieldCheck, 
  Loader2, 
  Check, 
  X, 
  Settings,
  AlertTriangle,
  Key
} from "lucide-react";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { FaceRecognition } from "@/components/FaceRecognition";
import { TOTPSetup } from "@/components/TOTPSetup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BiometricAuthPanelProps {
  userId: string;
  userEmail: string;
  mode?: "login" | "settings";
  onAuthSuccess?: () => void;
}

const BiometricAuthPanel = ({ userId, userEmail, mode = "settings", onAuthSuccess }: BiometricAuthPanelProps) => {
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [faceMode, setFaceMode] = useState<"register" | "verify">("register");
  
  const {
    isSupported,
    isInSandbox,
    isRegistering,
    isAuthenticating,
    checkSupport,
    registerBiometric,
    authenticateWithBiometric,
    hasBiometricRegistered,
    removeBiometric,
  } = useBiometricAuth();

  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  useEffect(() => {
    checkSupport();
    setBiometricRegistered(hasBiometricRegistered(userId));
    const storedFaces = JSON.parse(localStorage.getItem("face_recognition_data") || "{}");
    setFaceRegistered(!!storedFaces[userId]);
  }, [checkSupport, hasBiometricRegistered, userId]);

  const handleBiometricRegister = async () => {
    const success = await registerBiometric(userId, userEmail);
    if (success) {
      setBiometricRegistered(true);
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometric(userId);
    if (success) {
      onAuthSuccess?.();
    }
  };

  const handleRemoveBiometric = () => {
    removeBiometric(userId);
    setBiometricRegistered(false);
  };

  const handleFaceRegisterSuccess = () => {
    setShowFaceRecognition(false);
    setFaceRegistered(true);
  };

  const handleFaceVerifySuccess = () => {
    setShowFaceRecognition(false);
    onAuthSuccess?.();
  };

  const handleRemoveFace = () => {
    const storedFaces = JSON.parse(localStorage.getItem("face_recognition_data") || "{}");
    delete storedFaces[userId];
    localStorage.setItem("face_recognition_data", JSON.stringify(storedFaces));
    setFaceRegistered(false);
  };

  if (mode === "login") {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or use biometrics
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Fingerprint/Face ID Login */}
          {isSupported && biometricRegistered && (
            <Button
              variant="outline"
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="h-16 flex flex-col gap-1"
            >
              {isAuthenticating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Fingerprint className="h-5 w-5 text-primary" />
              )}
              <span className="text-xs">Touch ID / Face ID</span>
            </Button>
          )}

          {/* Face Recognition Login */}
          {faceRegistered && (
            <Dialog open={showFaceRecognition && faceMode === "verify"} onOpenChange={(open) => {
              if (!open) setShowFaceRecognition(false);
            }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFaceMode("verify");
                    setShowFaceRecognition(true);
                  }}
                  className="h-16 flex flex-col gap-1"
                >
                  <ScanFace className="h-5 w-5 text-primary" />
                  <span className="text-xs">Face Recognition</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Face Verification</DialogTitle>
                </DialogHeader>
                <FaceRecognition
                  mode="verify"
                  userId={userId}
                  onSuccess={handleFaceVerifySuccess}
                  onCancel={() => setShowFaceRecognition(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!biometricRegistered && !faceRegistered && (
          <p className="text-xs text-muted-foreground text-center">
            No biometrics registered. Set up biometrics in your security settings.
          </p>
        )}
      </div>
    );
  }

  // Settings mode
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Biometric Security</CardTitle>
            <CardDescription>
              Configure fingerprint, Face ID, and face recognition
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* WebAuthn Biometrics (Fingerprint/Face ID) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Touch ID / Face ID</p>
                <p className="text-xs text-muted-foreground">
                  Use device biometrics for quick authentication
                </p>
              </div>
            </div>
            <Badge variant={biometricRegistered ? "default" : "secondary"}>
              {biometricRegistered ? "Registered" : "Not Set Up"}
            </Badge>
          </div>

          {!isSupported ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {isInSandbox 
                ? "WebAuthn is blocked in preview mode. Use Face Recognition or open in new tab."
                : "Device biometrics not supported on this browser/device"}
            </div>
          ) : (
            <div className="flex gap-2">
              {!biometricRegistered ? (
                <Button
                  size="sm"
                  onClick={handleBiometricRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Register Biometrics
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBiometricAuth}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveBiometric}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Face Recognition */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScanFace className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Face Recognition</p>
                <p className="text-xs text-muted-foreground">
                  Advanced facial biometric verification
                </p>
              </div>
            </div>
            <Badge variant={faceRegistered ? "default" : "secondary"}>
              {faceRegistered ? "Registered" : "Not Set Up"}
            </Badge>
          </div>

          <div className="flex gap-2">
            {!faceRegistered ? (
              <Dialog open={showFaceRecognition && faceMode === "register"} onOpenChange={(open) => {
                if (!open) setShowFaceRecognition(false);
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setFaceMode("register");
                      setShowFaceRecognition(true);
                    }}
                  >
                    <ScanFace className="h-4 w-4 mr-2" />
                    Register Face
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Register Face ID</DialogTitle>
                  </DialogHeader>
                  <FaceRecognition
                    mode="register"
                    userId={userId}
                    onSuccess={handleFaceRegisterSuccess}
                    onCancel={() => setShowFaceRecognition(false)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <Dialog open={showFaceRecognition && faceMode === "verify"} onOpenChange={(open) => {
                  if (!open) setShowFaceRecognition(false);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFaceMode("verify");
                        setShowFaceRecognition(true);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Face Verification Test</DialogTitle>
                    </DialogHeader>
                    <FaceRecognition
                      mode="verify"
                      userId={userId}
                      onSuccess={() => setShowFaceRecognition(false)}
                      onCancel={() => setShowFaceRecognition(false)}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFace}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* TOTP Authentication */}
        <TOTPSetup />

        {/* Security Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-success" />
            Military-Grade Security
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            <li>• Biometric data stored locally on device</li>
            <li>• Face hashes use one-way encryption</li>
            <li>• WebAuthn follows FIDO2 standards</li>
            <li>• TOTP codes expire every 30 seconds</li>
            <li>• No raw biometric data leaves your device</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricAuthPanel;
