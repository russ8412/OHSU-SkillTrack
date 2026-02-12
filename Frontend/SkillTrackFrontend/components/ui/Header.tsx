import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../AppText';

interface HeaderProps {
  text: string;
  backArrow: boolean;
  onBackPress?: () => void;
}

export const Header = ({ text, backArrow, onBackPress }: HeaderProps) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.backArrow}>
                {backArrow
                    ? (<Pressable onPress={onBackPress} style={{ backgroundColor: "#FFFFFF" }}>
                            <Ionicons name="arrow-back-outline" size={35} color="#000000"/>
                       </Pressable>)
                    : null}
            </View>
            <AppText style={styles.headerText}>{text}</AppText>
            <View style={styles.logo}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#4972FF" />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    headerContainer: {
        position: "relative",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 125,
        marginBottom: 15
    },

    headerText: {
        fontSize: 30,
        textAlign: "center"
    },

    backArrow: {
        position: "absolute",
        left: 10,
        top: 15
    },

    logo: {
        position: "absolute",
        right: 10,
        top: 10
    }
})