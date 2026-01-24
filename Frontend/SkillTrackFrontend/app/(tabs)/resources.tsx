// insert resources page here!
import { View, Text, StyleSheet } from 'react-native';

import { AppText} from "@/components/AppText"

export default function Tab() {
  return (
    <View style={styles.container}>
      <AppText style={styles.profileText}>Resources page!</AppText>
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
