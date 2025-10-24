import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsub;
  }, [initializing]);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const register = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email.trim());
    Alert.alert('Listo', 'Te enviamos un correo para restablecer tu contraseña.');
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user, initializing, login, register, resetPassword, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
