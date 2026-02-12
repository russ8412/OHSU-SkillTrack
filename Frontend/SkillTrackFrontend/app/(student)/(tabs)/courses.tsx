import { AppText } from "@/components/AppText";
import { signOut } from "aws-amplify/auth";
import { Pressable, View } from "react-native";

export default function Courses() {
    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
        <View>
            <Pressable style={{ margin: 16 }} onPress={handleLogout}>
                <AppText>Logout</AppText>
            </Pressable>
            <AppText>Courses</AppText>
        </View>
    )
}