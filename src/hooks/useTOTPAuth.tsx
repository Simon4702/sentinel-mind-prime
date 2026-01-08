import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TOTPSetupData {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

export const useTOTPAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<TOTPSetupData | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  const checkTOTPStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase.functions.invoke('totp-auth', {
        body: { action: 'status' }
      });

      if (error) throw error;
      setIsEnabled(data.enabled);
      return data.enabled;
    } catch (error) {
      console.error('Error checking TOTP status:', error);
      return false;
    }
  }, []);

  const generateTOTPSecret = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('totp-auth', {
        body: { action: 'generate' }
      });

      if (error) throw error;

      setSetupData(data);
      return data;
    } catch (error: any) {
      console.error('Error generating TOTP secret:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate TOTP secret",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const enableTOTP = useCallback(async (code: string, secret: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('totp-auth', {
        body: { action: 'enable', code, secret }
      });

      if (error) throw error;

      if (data.enabled) {
        setIsEnabled(true);
        setSetupData(null);
        toast({
          title: "TOTP Enabled",
          description: "Two-factor authentication is now active",
        });
        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: "Please check the code and try again",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error enabling TOTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable TOTP",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const verifyTOTP = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('totp-auth', {
        body: { action: 'verify', code }
      });

      if (error) throw error;

      return data.valid;
    } catch (error: any) {
      console.error('Error verifying TOTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify code",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const disableTOTP = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('totp-auth', {
        body: { action: 'disable' }
      });

      if (error) throw error;

      if (data.disabled) {
        setIsEnabled(false);
        toast({
          title: "TOTP Disabled",
          description: "Two-factor authentication has been disabled",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error disabling TOTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable TOTP",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    setupData,
    isEnabled,
    generateTOTPSecret,
    enableTOTP,
    verifyTOTP,
    disableTOTP,
    checkTOTPStatus,
  };
};
