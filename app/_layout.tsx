import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../AuthProvider"; // Ajusta la ruta si es necesario
import { useEffect } from "react";

const InitialLayout = () => {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAuthScreen = segments[0] === "login" || segments[0] === "register";

    if (user && !inAuthGroup) {
      router.replace("/(auth)/home");
    } else if (!user && !inAuthScreen) {
      router.replace("/login");
    }
  }, [user, initializing, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="oauth2redirect" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
