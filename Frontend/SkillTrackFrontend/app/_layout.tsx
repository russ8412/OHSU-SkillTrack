// this file defines our app root layout
import React from "react";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import config from "../src/amplifyconfiguration.json";

import { useFonts } from "expo-font";

Amplify.configure(config);

export default function RootLayout() {
  useFonts({
    Afacad: require("../assets/fonts/static/Afacad-Regular.ttf"),
  });

  return (
    <Authenticator.Provider>
      <Authenticator>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Authenticator>
    </Authenticator.Provider>
  );
}
