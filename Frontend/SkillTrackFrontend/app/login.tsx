import {useState} from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import OverviewPage from './overview_page';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log("Logging in with:", username);
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
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  header: { 
    fontSize: 30, 
    color: '#4745b5',
    marginBottom: 30 
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#4745b5',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#000'
  },
  button: { 
    height: 40, 
    width: '100%', 
    backgroundColor: '#4745b5',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
})