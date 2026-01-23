// app/_layout.tsx
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react-native';

import config from '../src/amplifyconfiguration.json';
Amplify.configure(config);

export default function RootLayout() {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerTitle: 'Courses',
              headerBackVisible: false,
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              headerTitle: 'My Profile',
              headerBackVisible: false,
            }} 
          />
          <Stack.Screen 
            name="course/[id]" 
            options={{ 
              headerTitle: 'Course',
              headerBackTitle: 'Back',
            }} 
          />
          <Stack.Screen 
            name="skill/[id]" 
            options={{ 
              headerTitle: 'Skill',
              headerBackTitle: 'Back',
            }} 
          />
        </Stack>
      </Authenticator>
    </Authenticator.Provider>
  );
}