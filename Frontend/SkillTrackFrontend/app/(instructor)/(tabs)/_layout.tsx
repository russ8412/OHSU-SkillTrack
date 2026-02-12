import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function InstructorTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: () => (
                        <Ionicons name="person-outline" size={30} color="#FFFFFF"/>
                    )
                }}
            />
        </Tabs>
    )
}