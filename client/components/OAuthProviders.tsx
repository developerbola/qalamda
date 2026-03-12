import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface OAuthProviderProps {
  provider: 'github' | 'google';
  onLogin?: () => void;
  onError?: (error: Error) => void;
}

export function OAuthProvider({ provider, onLogin, onError }: OAuthProviderProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw error;
      }

      const result = await data.json();
      if (result.error) {
        throw new Error(result.error);
      }

      if (onLogin) {
        onLogin();
      }
    } catch (err: any) {
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="w-full justify-center"
    >
      {loading ? 'Connecting...' : provider === 'github' ? 'Continue with GitHub' : 'Continue with Google'}
    </Button>
  );
}

export function OAuthProviders() {
  return (
    <div className="space-y-3">
      <OAuthProvider provider="github" />
      <OAuthProvider provider="google" />
    </div>
  );
}