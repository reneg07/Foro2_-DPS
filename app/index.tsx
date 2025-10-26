import { Redirect } from 'expo-router';

// Este es el punto de entrada de la aplicación.
// Redirige inmediatamente a la pantalla de login.
export default function Index() {
  return <Redirect href="/login" />;
}
