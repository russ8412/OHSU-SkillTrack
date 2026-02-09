// app/(tabs)/instructor/student/[email].tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, FlatList, TextInput } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';

interface Skill {
  skillName: string;
  description: string;
  checkedOff: boolean;
  checkedOffBy?: string;
  dateCheckedOff?: string;
  courseId: string;
}

export default function StudentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'profile'>('profile');
  const [loading, setLoading] = useState(false);

  const studentEmail = decodeURIComponent(params.email as string);
  const firstName = params.firstName as string;
  const lastName = params.lastName as string;
  
  // Safely parse courses (passed from instructor.tsx)
  let courses: string[] = [];
  try {
    courses = JSON.parse(params.courses as string);
  } catch (e) {
    // console.error('Failed to parse courses:', params.courses, e);
    courses = [];
  }

  // console.log('Student Detail - Email:', studentEmail, 'Courses:', courses);

  // Filter skills based on selected view and search
  // NOTE: backend does not reliably expose per-student checked state to instructors,
  // so when 'incomplete' is selected show ALL skills (instructors will check them off).
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // If viewing 'complete', only show skills with checkedOff === true
    /*
    if (selectedView === 'complete') {
      filtered = filtered.filter(skill => skill.checkedOff === true);
    }

    // If viewing 'incomplete', show all skills (cannot reliably determine per-student status)
    */

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(skill =>
        skill.skillName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [skills, selectedView, searchQuery]);

  const handleSkillPress = (skill: Skill) => {
    router.push({
      pathname: '/(tabs)/instructor/student/[email]/skill/[skillName]' as any,
      params: {
        email: encodeURIComponent(studentEmail),
        skillName: encodeURIComponent(skill.skillName),
        description: skill.description,
        courseId: skill.courseId,
        firstName,
        lastName,
        courses: params.courses as string,
      }
    });
  };

  /* Progress calculation removed while totals are not tracked in this view
  const getProgressPercentage = () => {
    if (totalSkills === 0) return 0;
    return Math.round((completedSkills / totalSkills) * 100);
  };
  */

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <Pressable
      style={generalStyles.skillCard}
      onPress={() => handleSkillPress(item)}
    >
      <View style={generalStyles.skillInfo}>
        <View style={{ flex: 1 }}>
          <AppText style={generalStyles.cardNameText}>{item.skillName}</AppText>
          {item.checkedOff && item.dateCheckedOff && (
            <AppText style={{ fontSize: 12, color: '#4972FF', marginTop: 4 }}>
              Checked off: {item.dateCheckedOff}
            </AppText>
          )}
        </View>
        {item.checkedOff && (
          <Ionicons name="checkmark-circle" size={24} color="#4972FF" />
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading student profile...</AppText>
      </View>
    );
  }

  // Profile View
  if (selectedView === 'profile') {
    return (
      <View style={generalStyles.container}>
        {/* Header */}
        <View style={generalStyles.headerContainer}>
          <Pressable
            onPress={() => router.replace('/(tabs)/instructor')}
            hitSlop={10}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back-outline" size={40} color="#000000" />
          </Pressable>
          <AppText style={generalStyles.headerTitle}>Student Profile</AppText>
          <Ionicons name="person-circle-outline" size={40} color="#2F6BFF" />
        </View>

        {/* Student Info Card */}
        <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 }}>
            Student Information
          </AppText>
          <AppText style={{ fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 4 }}>
            {firstName} {lastName}
          </AppText>
          <AppText style={{ fontSize: 14, color: '#4972FF' }}>
            {studentEmail}
          </AppText>
        </View>

        {/* Courses List */}
        <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 12 }}>
          Enrolled Courses
        </AppText>

        {courses.length === 0 ? (
          <View style={generalStyles.emptyState}>
            <AppText style={generalStyles.emptyStateIcon}>📚</AppText>
            <AppText style={generalStyles.emptyStateTitle}>No courses found</AppText>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={(c) => c}
            renderItem={({ item }) => (
              <Pressable
                style={generalStyles.courseCard}
                onPress={() => router.push({ pathname: '/(tabs)/instructor/student/[email]/course/[courseId]' as any, params: { email: encodeURIComponent(studentEmail), firstName, lastName, courseId: item, courses: params.courses as string } })}
              >
                <View style={generalStyles.courseHeader}>
                  <AppText style={generalStyles.cardNameText}>{item}</AppText>
                  <AppText style={generalStyles.courseProgressText}>View skills</AppText>
                </View>
              </Pressable>
            )}
            contentContainerStyle={generalStyles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }

  // Fallback return (shouldn't reach here)
  return (
    <View style={generalStyles.container} />
  );
}
