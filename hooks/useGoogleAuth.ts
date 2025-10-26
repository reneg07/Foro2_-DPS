import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth() {
  const router = useRouter();
  const extra = (Constants.expoConfig?.extra || {}) as {
    iosClientId?: string;
    androidClientId?: string;
  };

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'loginapp', useProxy: false });
  console.log('redirectUri (nativa) ->', redirectUri);

  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: extra.iosClientId,
    androidClientId: extra.androidClientId,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setUser(authentication);
      router.replace('/home');
    } else if (response?.type === 'error') {
      setError('Error al autenticarse con Google');
    }
  }, [response]);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await promptAsync({ useProxy: false });
    } catch (err: any) {
      setError(err.message || 'Error en signIn');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, signOut: () => setUser(null) };
}
