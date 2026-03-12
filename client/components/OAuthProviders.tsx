import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

interface OAuthProviderProps {
  provider: 'github' | 'google';
  onLogin?: () => void;
  onError?: (error: string) => void;
}

export function OAuthProvider({ provider, onLogin, onError }: OAuthProviderProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithOAuth } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        if (onError) onError(error);
      } else if (onLogin) {
        onLogin();
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || 'OAuth failure');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={loading}
      className="w-full justify-center flex gap-2"
    >
      {loading ? 'Connecting...' : `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
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