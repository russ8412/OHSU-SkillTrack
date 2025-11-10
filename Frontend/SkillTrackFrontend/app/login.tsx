import {useState} from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import OverviewPage from './overview_page';

export default function LoginScreen() {

  const handleLogin = () => {
    console.log("hello");
  }

  const [showOverview, setShowOverview] = useState(false);
    if(showOverview){
      return <OverviewPage/>;
    }

  return (
    <View style={styles.container}>
        <Text style={styles.header}> Welcome! </Text>
        <Pressable style={styles.button} onPress={ () => setShowOverview(true)}>
          <Text> Log in </Text>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'flex-start'},
  header: { fontSize: 30, color: '#4745b5' },
  button: { height: 30, width: 60, backgroundColor: '#4745b5' }
})