import React from 'react';
import { View } from 'react-native';

// Esta pantalla se usa para capturar la redirección del flujo de OAuth.
// La lógica real es manejada por el hook `useAuthRequest` en la pantalla de login.
// Este componente solo necesita existir para evitar un error de "Ruta no encontrada".
export default function OAuthRedirectScreen() {
  return <View />;
}
