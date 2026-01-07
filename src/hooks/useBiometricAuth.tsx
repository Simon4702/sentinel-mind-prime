import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  type: string;
}

// Convert ArrayBuffer to Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert Base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported
  const checkSupport = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);
      return available;
    } catch {
      setIsSupported(false);
      return false;
    }
  }, []);

  // Register biometric credential
  const registerBiometric = useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device.",
        variant: "destructive",
      });
      return false;
    }

    setIsRegistering(true);

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "SentinelMind Security Platform",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userEmail,
          displayName: userEmail.split("@")[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },  // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Failed to create credential");
      }

      // Store credential ID in localStorage for this user
      const storedCredentials = JSON.parse(localStorage.getItem("biometric_credentials") || "{}");
      storedCredentials[userId] = {
        credentialId: bufferToBase64(credential.rawId),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("biometric_credentials", JSON.stringify(storedCredentials));

      toast({
        title: "Biometric Registered",
        description: "Your fingerprint/Face ID has been successfully registered.",
      });

      setIsRegistering(false);
      return true;
    } catch (error) {
      console.error("Biometric registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register biometric.",
        variant: "destructive",
      });
      setIsRegistering(false);
      return false;
    }
  }, [toast]);

  // Authenticate with biometric
  const authenticateWithBiometric = useCallback(async (userId?: string): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device.",
        variant: "destructive",
      });
      return false;
    }

    setIsAuthenticating(true);

    try {
      // Get stored credentials
      const storedCredentials = JSON.parse(localStorage.getItem("biometric_credentials") || "{}");
      
      // Build allowed credentials list
      const allowCredentials: PublicKeyCredentialDescriptor[] = [];
      
      if (userId && storedCredentials[userId]) {
        allowCredentials.push({
          id: base64ToBuffer(storedCredentials[userId].credentialId),
          type: "public-key",
          transports: ["internal"],
        });
      } else {
        // Allow any registered credential
        Object.values(storedCredentials).forEach((cred: any) => {
          allowCredentials.push({
            id: base64ToBuffer(cred.credentialId),
            type: "public-key",
            transports: ["internal"],
          });
        });
      }

      if (allowCredentials.length === 0) {
        toast({
          title: "No Biometrics Registered",
          description: "Please register your biometrics first.",
          variant: "destructive",
        });
        setIsAuthenticating(false);
        return false;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials,
        userVerification: "required",
        timeout: 60000,
        rpId: window.location.hostname,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error("Authentication failed");
      }

      toast({
        title: "Biometric Verified",
        description: "Identity confirmed via biometric authentication.",
      });

      setIsAuthenticating(false);
      return true;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Biometric authentication failed.",
        variant: "destructive",
      });
      setIsAuthenticating(false);
      return false;
    }
  }, [toast]);

  // Check if user has registered biometrics
  const hasBiometricRegistered = useCallback((userId: string): boolean => {
    const storedCredentials = JSON.parse(localStorage.getItem("biometric_credentials") || "{}");
    return !!storedCredentials[userId];
  }, []);

  // Remove biometric registration
  const removeBiometric = useCallback((userId: string): void => {
    const storedCredentials = JSON.parse(localStorage.getItem("biometric_credentials") || "{}");
    delete storedCredentials[userId];
    localStorage.setItem("biometric_credentials", JSON.stringify(storedCredentials));
    toast({
      title: "Biometric Removed",
      description: "Your biometric registration has been removed.",
    });
  }, [toast]);

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    checkSupport,
    registerBiometric,
    authenticateWithBiometric,
    hasBiometricRegistered,
    removeBiometric,
  };
};
