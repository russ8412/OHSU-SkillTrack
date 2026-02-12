import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function StudentTabs() {
    return (
        <Tabs initialRouteName="courses" screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    href: null
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: () => (
                        <Ionicons name="person-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
            <Tabs.Screen
                name="courses"
                options={{
                    title: "Courses",
                    tabBarIcon: () => (
                        <Ionicons name="checkmark-circle-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
            <Tabs.Screen
                name="resources"
                options={{
                    title: "Resources",
                    tabBarIcon: () => (
                        <Ionicons name="book-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
        </Tabs>
    )
}