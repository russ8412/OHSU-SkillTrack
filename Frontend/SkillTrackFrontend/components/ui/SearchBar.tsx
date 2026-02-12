import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
    return (
        <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#919191"
                value={value}
                onChangeText={onChange}
                selectionColor="#4972FF"
            />
            {value === ""
                ? (<Ionicons name="search-outline" size={28} color="#919191"/>)
                : (<Pressable onPress={() => onChange("")}>
                        <Ionicons name="close-outline" size={28} color="#919191"/>
                   </Pressable>)}
            
        </View>
    )
}

const styles = StyleSheet.create({

    searchContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        marginHorizontal: 15,
        padding: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: '#F5F5F5',
    },

    searchInput: {
        flex: 1,
        paddingVertical: 0,
        fontFamily: 'Afacad',
        fontSize: 20
    }
})