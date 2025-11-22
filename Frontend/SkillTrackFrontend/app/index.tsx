/*import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function OverviewPage() {
  const handleFilter= () => {
    console.log("Clicked Filter");
  };

  const handleSearch = () => {
    console.log("Clicked Search");
  };


  return (
    <View style={styles.container}>
        <Text style={styles.header}> SkillsTrack </Text>
        <View style={styles.menu}>
            <Pressable style={styles.wrapper} onPress={handleSearch}>
                <Text style={styles.wrapperText}>Search</Text>
            </Pressable>

            <Pressable style={styles.wrapper} onPress={handleFilter}>
                <Text style={styles.wrapperText}>Filter</Text>
            </Pressable>
        </View>
        <View style={styles.wrapper}>
                <Text style={styles.wrapperText}>Example Skill 1</Text>
                <Text style={styles.description}>Example Description</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'flex-start'},
  header: { fontSize: 30, color: '#4745b5' },
  menu:{
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },

  wrapper: { backgroundColor: '#4745b5',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            maxWidth: 300,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'},
wrapperText:{
        color: 'white',
        fontSize: 16,
        fontWeight: '600'

},

description: {
    marginTop: 8,
    textAlign: 'left',
    color: "white",
    fontSize: 14,
    maxWidth: 120,
},

});*/

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';

import { Authenticator } from '@aws-amplify/ui-react-native';

export default function LoginPage() {
  return <Authenticator />;
}
