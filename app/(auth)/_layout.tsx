import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Inicio' }} />
    </Stack>
  );
}
