// this file is respoonsible for adding students to a course as a teacher if they need to
// TBD if we will mainly have students adding themselves to courses
import { useState, useEffect } from 'react';
import { View, TextInput, Button, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../../../../src/constants/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppText } from "@/components/AppText";
import generalStyles from '@/app/styles';

export default function AddStudentsToCourse() {
    // since we don't have a way to display a list of students,
    // I won't include a useEffect hook until we need one...
    const router = useRouter();

    const params = useLocalSearchParams();
    const courseId = decodeURIComponent(params.courseId as string);

    const [addingStudent, setAddingStudent] = useState(false);
    const [studentEmail, setStudentEmail] = useState("");

    const handleAddStudent = async () => {

        if (!studentEmail) {
            Alert.alert("Error", "Enter a student email")
            return
        }

        // try to create a student
        try {
            // we want to track this to alert teacher that they're trying to add a student
            setAddingStudent(true);

            
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            // response yells at us if we don't test for non-existent token
            // we call w/token if it exists
            // otherwise we still call it but it will likely return an error
            const headers: HeadersInit = token
                ? { 'Content-Type': 'application/json', 'Authorization': token }
                : { 'Content-Type': 'application/json' };

            console.log('courseId:', courseId);
            console.log('studentInput:', studentEmail);
            console.log('token_use guess (JWT middle):', token?.split('.')[1]?.slice(0, 20));
            
            // get auth sesh + JWT
            // add a student to the course using course and student ID's
            const res = await fetch(`${BASE_URL}/AddStudentToCourse`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                    Course_ID: courseId,
                    Student_ID: studentEmail
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            Alert.alert(`Successfully added ${studentEmail} to ${courseId}`)
            router.back() // in theory, this should take us back to course info page but I think it's a bit buggy rn
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setAddingStudent(false);
        }
    };

    return (
        // replace with styling as we please
        <View style = {[generalStyles.container]}>
            <AppText>
                Add Student to Course
            </AppText>

            <TextInput
                value={studentEmail}
                onChangeText={setStudentEmail}
                placeholder="Enter student email"
                style={[
                    generalStyles.searchContainer
                ]}
            />

            <Pressable
                onPress={handleAddStudent}
                disabled={addingStudent}
                style={[
                    generalStyles.refreshButton
                ]}
            >
                <AppText> {addingStudent? 'adding' : 'add student'} </AppText>
            </Pressable>
        </View>
    )

}