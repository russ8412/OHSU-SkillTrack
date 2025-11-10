import { Stack } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Amplify } from 'aws-amplify';
import {withAuthenticator,useAuthenticator} from '@aws-amplify/ui-react-native';

import config from '../src/amplifyconfiguration.json';
Amplify.configure(config);

// export const unstable_settings = {
//   anchor: '(tabs)',
// };



function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }}/>
    </Stack>
  );
}

export default withAuthenticator(RootLayout);
