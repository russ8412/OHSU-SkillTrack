// app/_layout.tsx
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react-native';

import config from '../src/amplifyconfiguration.json';
import { StackScreenLifecycleState } from 'react-native-screens';
Amplify.configure(config);

import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Afacad: require("../assets/fonts/static/Afacad-Regular.ttf"),
  });

  return (
    <Authenticator.Provider>
      <Authenticator>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              headerTitle: 'Courses',
              headerBackVisible: false,
            }} 
          />
          {/* May need to move skilltrack/back buttons here to work with IOS... */}
          <Stack.Screen name='my-skills'
            options={{
              headerShown: false,
              headerTitle: 'My Skills',
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen 
            name="courses-by-year" 
            options={{
              headerShown: false,
              headerTitle: 'Courses by Year',
              headerBackTitle: 'Back',
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