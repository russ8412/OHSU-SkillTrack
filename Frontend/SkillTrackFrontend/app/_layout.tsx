import { Stack } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }}/>
    </Stack>
  );
}
