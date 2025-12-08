import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import QRCode from "react-native-qrcode-svg";

export default function QRCodeGenerator() {
    const qrValue = "https://www.youtube.com";

    return(
        <View style={styles.container}>
            <QRCode value ={qrValue} size={100}/>
        </View>
    );
};


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