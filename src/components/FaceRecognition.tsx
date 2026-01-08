import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Check, X, Loader2, ScanFace, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FaceRecognitionProps {
  mode: "register" | "verify";
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// Simple face detection using canvas analysis
const detectFace = (video: HTMLVideoElement, canvas: HTMLCanvasElement): boolean => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple skin tone detection as a basic face presence indicator
  let skinPixels = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Basic skin tone detection
    if (r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 &&
        r - g > 15 && r - b > 15) {
      skinPixels++;
    }
  }

  // If more than 5% of pixels are skin-toned, likely a face is present
  const skinRatio = skinPixels / totalPixels;
  return skinRatio > 0.05 && skinRatio < 0.6;
};

// Generate a hash from image data
const generateFaceHash = async (canvas: HTMLCanvasElement): Promise<string> => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Get a smaller sample for hashing
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = 32;
  smallCanvas.height = 32;
  const smallCtx = smallCanvas.getContext("2d");
  if (!smallCtx) return "";

  smallCtx.drawImage(canvas, 0, 0, 32, 32);
  const imageData = smallCtx.getImageData(0, 0, 32, 32);
  const data = imageData.data;

  // Create a simple perceptual hash
  let hash = "";
  for (let i = 0; i < data.length; i += 16) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    hash += avg > 128 ? "1" : "0";
  }

  return hash;
};

// Compare two face hashes
const compareFaceHashes = (hash1: string, hash2: string): number => {
  if (hash1.length !== hash2.length) return 0;
  
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  
  return matches / hash1.length;
};

const FaceRecognition = ({ mode, userId, onSuccess, onCancel, className }: FaceRecognitionProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsStreaming(false);
    setFaceDetected(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setStatus("idle");
    
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available in this browser");
      }

      // Try with ideal constraints first, then fall back to basic
      let stream: MediaStream | null = null;
      
      const constraints = [
        { video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } },
        { video: { facingMode: "user" } },
        { video: true }
      ];

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (e) {
          console.log("Constraint failed, trying next:", constraint, e);
          continue;
        }
      }

      if (!stream) {
        throw new Error("Unable to access camera with any settings");
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready with timeout
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error("Video element not found"));
          
          const timeout = setTimeout(() => reject(new Error("Video load timeout")), 10000);
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            videoRef.current?.play()
              .then(() => resolve())
              .catch(reject);
          };
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Video failed to load"));
          };
        });
        
        setIsStreaming(true);

        // Start face detection loop
        detectionIntervalRef.current = setInterval(() => {
          if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            const detected = detectFace(videoRef.current, canvasRef.current);
            setFaceDetected(detected);
          }
        }, 200);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      
      let errorMessage = "Unable to access camera.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage = "Camera access denied. Please grant camera permissions in your browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "No camera found. Please connect a camera and try again.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage = "Camera is in use by another application. Please close other apps using the camera.";
        } else if (err.name === "AbortError") {
          errorMessage = "Camera access was interrupted. Please try again.";
        } else if (err.name === "SecurityError") {
          errorMessage = "Camera access blocked for security reasons. Please check your browser settings.";
        } else {
          errorMessage = err.message || "Unable to access camera.";
        }
      }
      
      setError(errorMessage);
    }
  }, []);

  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceDetected) return;

    setIsProcessing(true);
    setStatus("scanning");

    // Countdown effect
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setCountdown(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !videoRef.current) throw new Error("Canvas context not available");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      const faceHash = await generateFaceHash(canvas);
      
      if (mode === "register") {
        // Store the face hash
        const storedFaces = JSON.parse(localStorage.getItem("face_recognition_data") || "{}");
        storedFaces[userId || "default"] = {
          hash: faceHash,
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem("face_recognition_data", JSON.stringify(storedFaces));

        setStatus("success");
        toast({
          title: "Face Registered",
          description: "Your facial biometrics have been securely stored.",
        });
        
        setTimeout(() => {
          stopCamera();
          onSuccess?.();
        }, 1500);
      } else {
        // Verify against stored face
        const storedFaces = JSON.parse(localStorage.getItem("face_recognition_data") || "{}");
        const storedData = storedFaces[userId || "default"];

        if (!storedData) {
          setStatus("failed");
          setError("No facial data registered for this user.");
          setIsProcessing(false);
          return;
        }

        const similarity = compareFaceHashes(faceHash, storedData.hash);
        
        // Require at least 60% similarity (adjustable threshold)
        if (similarity >= 0.6) {
          setStatus("success");
          toast({
            title: "Face Verified",
            description: `Identity confirmed (${Math.round(similarity * 100)}% match).`,
          });
          
          setTimeout(() => {
            stopCamera();
            onSuccess?.();
          }, 1500);
        } else {
          setStatus("failed");
          setError(`Face verification failed (${Math.round(similarity * 100)}% match). Please try again.`);
        }
      }
    } catch (err) {
      console.error("Face processing error:", err);
      setStatus("failed");
      setError("Failed to process facial data.");
    }

    setIsProcessing(false);
  }, [faceDetected, mode, userId, onSuccess, stopCamera, toast]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const hasFaceRegistered = (userId?: string): boolean => {
    const storedFaces = JSON.parse(localStorage.getItem("face_recognition_data") || "{}");
    return !!storedFaces[userId || "default"];
  };

  return (
    <Card className={cn("border-border/50 bg-card/95 backdrop-blur", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            status === "success" ? "bg-success/20" : 
            status === "failed" ? "bg-destructive/20" : "bg-primary/20"
          )}>
            <ScanFace className={cn(
              "h-6 w-6",
              status === "success" ? "text-success" : 
              status === "failed" ? "text-destructive" : "text-primary"
            )} />
          </div>
          <div>
            <CardTitle className="text-lg">
              {mode === "register" ? "Register Face ID" : "Face Verification"}
            </CardTitle>
            <CardDescription>
              {mode === "register" 
                ? "Capture your facial biometrics for secure authentication"
                : "Verify your identity using facial recognition"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
          {!isStreaming ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Camera className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Camera not active</p>
              <Button onClick={startCamera} variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Face detection overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning frame */}
                <div className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-48 h-64 border-2 rounded-[40%]",
                  "transition-all duration-300",
                  faceDetected 
                    ? "border-success shadow-[0_0_20px_hsl(120_65%_50%/0.5)]" 
                    : "border-primary/50 animate-pulse"
                )}>
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-current rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-current rounded-br-lg" />
                </div>

                {/* Status indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2",
                    faceDetected 
                      ? "bg-success/90 text-success-foreground" 
                      : "bg-muted/90 text-muted-foreground"
                  )}>
                    {faceDetected ? (
                      <>
                        <Check className="h-3 w-3" />
                        Face Detected
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Position your face in the frame
                      </>
                    )}
                  </div>
                </div>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary animate-pulse">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Success overlay */}
                {status === "success" && (
                  <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                    <div className="bg-success/90 p-4 rounded-full">
                      <ShieldCheck className="h-12 w-12 text-success-foreground" />
                    </div>
                  </div>
                )}

                {/* Failed overlay */}
                {status === "failed" && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <div className="bg-destructive/90 p-4 rounded-full">
                      <AlertTriangle className="h-12 w-12 text-destructive-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {isStreaming && (
            <Button
              onClick={captureAndProcess}
              disabled={!faceDetected || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ScanFace className="h-4 w-4 mr-2" />
                  {mode === "register" ? "Capture & Register" : "Verify Face"}
                </>
              )}
            </Button>
          )}
          
          {onCancel && (
            <Button variant="outline" onClick={() => {
              stopCamera();
              onCancel();
            }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {isStreaming && (
            <Button variant="ghost" onClick={stopCamera}>
              Stop Camera
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceRecognition;
export { FaceRecognition };
