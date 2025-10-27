import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '../AuthProvider';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

type ExtraRoot = {
  oauth?: { google?: { iosClientId?: string; androidClientId?: string; webClientId?: string } };
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Lee IDs de app.json -> extra (si los tienes allí)
  const extra = (Constants.expoConfig?.extra ??
    // @ts-ignore legacy manifest for classic builds
    Constants.manifest?.extra) as ExtraRoot;

  const ids = {
    ios: extra?.oauth?.google?.iosClientId ?? extra?.iosClientId,
    android:
      extra?.oauth?.google?.androidClientId ??
      extra?.androidClientId ??
      // Fallback al que nos compartiste
      '706658805587-t5dkeq48v7f3dclk4a2aoulhh9demtj9.apps.googleusercontent.com',
    web: extra?.oauth?.google?.webClientId ?? extra?.webClientId,
  };

  // Esquema con punto (requisito de Google)
  const scheme = 'com.firearcher717.loginapp';

  // Para Android/iOS usa esquema nativo con una sola barra antes del path
  const redirectUri = makeRedirectUri({
    scheme,
    native: `${scheme}:/oauth2redirect`,
  });

  // Configura la solicitud de Google
  // Clave: responseType 'code' + usePKCE true en Android/iOS
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ids.android,
    iosClientId: ids.ios,
    webClientId: ids.web,
    scopes: ['openid', 'email', 'profile'],
    responseType: Platform.OS === 'web' ? 'id_token' : 'code',
    usePKCE: Platform.OS !== 'web',
    redirectUri,
  });

  useEffect(() => {
    const complete = async () => {
      if (!response) return;

      if (Platform.OS === 'web') {
        // Web: viene id_token directo
        if (response.type === 'success') {
          const idToken = (response.params as any)?.id_token;
          if (!idToken) {
            console.log('No id_token en web response:', response);
            return Alert.alert('Error', 'No se recibió el id_token.');
          }
          try {
            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
          } catch (e) {
            console.log('Firebase signIn error (web):', e);
            Alert.alert('Error', 'No se pudo completar el inicio de sesión.');
          } finally {
            setLoadingGoogle(false);
          }
        } else if (response.type === 'error') {
          console.log('Google (web) error:', response);
          setLoadingGoogle(false);
          Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
        }
        return;
      }

      // Android/iOS: Authorization Code + PKCE
      if (response.type === 'success') {
        try {
          if (!request?.codeVerifier) {
            console.log('Falta codeVerifier');
            throw new Error('Falta codeVerifier para PKCE');
          }
          const code = response.params.code as string;
          // Intercambia el code por tokens en el token endpoint de Google
          const tokenRes = await AuthSession.exchangeCodeAsync(
            {
              clientId: ids.android!, // En Android usa el clientId de Android
              code,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier },
            },
            { tokenEndpoint: 'https://oauth2.googleapis.com/token' }
          );

          const idToken = (tokenRes as any).id_token as string | undefined;
          if (!idToken) {
            console.log('Token response sin id_token:', tokenRes);
            throw new Error('No se recibió id_token del token endpoint');
          }

          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        } catch (e) {
          console.log('Intercambio/SignIn error:', e);
          Alert.alert('Error', 'No se pudo completar el inicio de sesión con Google.');
        } finally {
          setLoadingGoogle(false);
        }
      } else if (response.type === 'error') {
        console.log('Google error:', response);
        setLoadingGoogle(false);
        Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
      } else if (response.type === 'dismiss') {
        setLoadingGoogle(false);
      }
    };

    complete();
  }, [response, request, redirectUri, ids.android]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) return Alert.alert('Error', 'Por favor completa todos los campos');
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      let msg = 'Error en el inicio de sesión';
      if (error?.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
      else if (error?.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
      else if (error?.code === 'auth/invalid-email') msg = 'Correo electrónico inválido';
      else if (error?.code === 'auth/operation-not-allowed') msg = 'Email/Contraseña no está habilitado en Firebase.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      // En Dev Client siempre useProxy:false para usar el esquema nativo
      const result = await promptAsync({
        useProxy: Platform.OS === 'web', // web sí usa proxy
        showInRecents: true,
      });
      console.log('Auth result:', result);
      console.log({
        scheme,
        redirectUri,
        androidId: ids.android,
        owner: Constants.appOwnership,
        platform: Platform.OS,
      });
    } catch (e) {
      console.log('promptAsync error:', e);
      setLoadingGoogle(false);
      Alert.alert('Error', 'No se pudo abrir el flujo de Google.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} style={styles.logo} />
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, !request && { opacity: 0.6 }]}
        onPress={handleGoogleLogin}
        disabled={!request || loadingGoogle}
      >
        {loadingGoogle ? (
          <ActivityIndicator color="#1f1f1f" />
        ) : (
          <Text style={styles.googleText}>Continuar con Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.footerText}>
          ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 20 },
  logo: { width: 100, height: 100, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, color: '#1e1e1e' },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    elevation: 3,
    color: '#333',
  },
  button: { width: '100%', backgroundColor: '#007BFF', paddingVertical: 14, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  googleButton: { width: '100%', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#dadce0', marginTop: 12 },
  googleText: { color: '#1f1f1f', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  footerText: { marginTop: 20, color: '#333' },
  link: { color: '#007BFF', fontWeight: '600' },
});
