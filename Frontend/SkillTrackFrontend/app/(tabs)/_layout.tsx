// use this documentation for more info on tabs: https://docs.expo.dev/router/advanced/tabs/#dynamic-routes
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.85)",

        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 90,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },

        tabBarItemStyle: { height: 64 },

        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 45,
              height: 50,
              borderRadius: 36,
              backgroundColor: "#4972FF",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
          />
        ),
      }}
    >
      {/* visible tabs in our navbar */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="resources"
        options={{
          tabBarIcon: ({ color, size}) => (
            <Ionicons
              name="library-outline"
              size={size ?? 26}
              color={color}
              />
          ),
        }}
      />

      {/* hidden drill-down routes (NOT buttons) */}
      {/* <Tabs.Screen name="courses-by-year" options={{ href: null }} /> */}
      <Tabs.Screen name="course/[id]" options={{ href: null }} />
      <Tabs.Screen name="skill/[id]" options={{ href: null }} />
    </Tabs>
  );
}
