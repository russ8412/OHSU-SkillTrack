// app/(tabs)/instructor/student/[email]/skill/[skillName].tsx
import { useState, useCallback } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';

export default function SkillApprovalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [approving, setApproving] = useState(false);

  const studentEmail = decodeURIComponent(params.email as string);
  const skillName = decodeURIComponent(params.skillName as string);
  const description = params.description as string;
  const courseId = params.courseId as string;
  const firstName = params.firstName as string;
  const lastName = params.lastName as string;

  const handleApproveSkill = useCallback(async () => {
    try {
      setApproving(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        setApproving(false);
        return;
      }

      // Call CheckStudentOff endpoint
      const response = await fetch(`${BASE_URL}/CheckStudentOff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          Course_ID: courseId,
          Skill_Name: skillName,
          Student_List: [studentEmail],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Alert.alert('Success', `${skillName} approved for ${firstName} ${lastName}`);
      
      // Go back to student detail page
      router.replace({
        pathname: '/(tabs)/instructor/student/[email]' as any,
        params: {
          email: encodeURIComponent(studentEmail),
          firstName,
          lastName,
          courses: params.courses as string,
        }
      });
    } catch (error) {
      console.error('Error approving skill:', error);
      Alert.alert('Error', 'Failed to approve skill');
    } finally {
      setApproving(false);
    }
  }, [studentEmail, skillName, courseId, firstName, lastName, router, params.courses]);

  return (
    <View style={generalStyles.container}>
      {/* Header */}
      <View style={generalStyles.headerContainer}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back-outline" size={40} color="#000000" />
        </Pressable>
        <AppText style={generalStyles.courseHeaderTitle}>{skillName}</AppText>
        <Ionicons name="checkmark-outline" size={40} color="#2F6BFF" />
      </View>

      {/* Student Info */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4 }}>
          Student
        </AppText>
        <AppText style={{ fontSize: 16, color: '#4972FF', fontWeight: '500' }}>
          {firstName} {lastName}
        </AppText>
        <AppText style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {studentEmail}
        </AppText>
      </View>

      {/* Skill Description */}
      <View style={{ marginBottom: 24 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
          Skill Description
        </AppText>
        <View style={{ padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
          <AppText style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>
            {description}
          </AppText>
        </View>
      </View>

      {/* Approve Button */}
      <Pressable
        style={[
          generalStyles.refreshButton,
          approving && { opacity: 0.6 },
        ]}
        onPress={handleApproveSkill}
        disabled={approving}
      >
        <AppText style={generalStyles.refreshButtonText}>
          {approving ? 'Approving...' : 'Approve Skill Proficiency'}
        </AppText>
      </Pressable>

      {/* Info text */}
      <View style={{ marginTop: 24, padding: 12, backgroundColor: '#E8F0FE', borderRadius: 8 }}>
        <AppText style={{ fontSize: 12, color: '#1F47B6', lineHeight: 16 }}>
          By approving this skill, you confirm that {firstName} has demonstrated proficiency and this skill will be marked as complete.
        </AppText>
      </View>
    </View>
  );
}
