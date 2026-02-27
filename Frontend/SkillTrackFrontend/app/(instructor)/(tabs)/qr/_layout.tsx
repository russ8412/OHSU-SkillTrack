// this layout file will describe a STACK navigator for our QR Code Checkoff Flow

import { Stack } from "expo-router";

export default function QRStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false}}/>
            <Stack.Screen name="[email]" options={{ headerShown: false}}/>
            <Stack.Screen name="[courseId]" options={{ headerShown: false}}/>
            <Stack.Screen name="[skillName]" options={{ headerShown: false}}/>
        </Stack>
    )
}