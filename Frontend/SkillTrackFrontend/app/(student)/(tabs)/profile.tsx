import { AppText } from "@/components/AppText";
import { signOut } from "aws-amplify/auth";
import { View, Pressable } from "react-native";

const handleLogout = async () => {
    try {
        await signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

export default function Profile() {
    return (
        <View>
            <AppText>Profile</AppText>
            <Pressable style={{ margin: 16 }} onPress={handleLogout}>
                <AppText>Logout</AppText>
            </Pressable>
        </View>

    )
}