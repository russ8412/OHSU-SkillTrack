import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingScreen = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4972FF"/>
        </View>
    )
}

const styles = StyleSheet.create({
    
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
        margin: 20
    }
})