import { View, Button, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';


const mockStudents = `
email,first name, last name
srogers@mockmail14123.com,Steve,Rogers
natashar@mockmail155231.com,Natasha,Romanoff
clintbarton13@mockmail177123.com,Clint,Barton
`;

const CsvUpload: React.FC = () => {
    const [data, setData] = useState<Array<{email: string; firstName: string; lastName: string}>>([]);

    const parseCSV = (csv: string) => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/\s/g, ''));


        return lines.map(line => {
            const values = line.split(',');
            return{
                email: values[headers.indexOf('email')],
                firstName: values[headers.indexOf('firstname')],
                lastName: values[headers.indexOf('lastname')],
            };
        });
    };

    const loadCSV = async () =>{
        try{
            const parsed = parseCSV(mockStudents);
            setData(parsed);
        }catch (err){
            console.error('Coundnt load mock csv', err);
        }
    };

    return (
        <View style = {styles.container}>
            <Button title = "Load Mock CSV" onPress = {loadCSV}/>
            <ScrollView>
                {data.map((row, index) => (
                    <Text key = {index}>
                        {row.email} - {row.firstName} {row.lastName}  
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};
export default CsvUpload;

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