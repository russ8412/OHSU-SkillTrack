// insert resources page here after reading comments below!
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { AppText} from "@/components/AppText"
import generalStyles from '../styles';

export default function Tab() {
    // be sure to copy/use similar logic for the signout button on new profile page
    const handleLogout = async () => {
    try {
        await signOut();
        // The app will automatically show the login screen
        // because Authenticator will detect the user is signed out
    } catch (error) {
        console.error('Error signing out:', error);
    }
    };
  return (
    <View style={styles.container}>
      <AppText style={styles.profileText}>Profile page!</AppText>
        <Pressable onPress={handleLogout} style={generalStyles.logoutButton}>
          <AppText style={generalStyles.logoutText}>Logout</AppText>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 25,
  }
});
