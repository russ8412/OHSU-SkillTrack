import { Stack } from 'expo-router';
import { Slot } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Amplify } from 'aws-amplify';
import { withAuthenticator, useAuthenticator, Authenticator } from '@aws-amplify/ui-react-native';

import config from '../src/amplifyconfiguration.json';
Amplify.configure(config);

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  return (
    <Authenticator.Provider>
      <Slot />
    </Authenticator.Provider>
  );
}
