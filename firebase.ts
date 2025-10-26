// firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Extra = {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
};

const extra = (Constants.expoConfig?.extra ??
  // @ts-ignore
  Constants.manifest?.extra) as Extra;

const firebaseConfig = extra.firebase;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Evitar re-inicializar Auth en native durante Fast Refresh
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const g = global as any;
  if (!g._firebaseAuthNative) {
    g._firebaseAuthNative = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  auth = g._firebaseAuthNative;
}

export { app, auth, GoogleAuthProvider };
