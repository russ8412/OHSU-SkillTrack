// app/(tabs)/instructor/course/[courseId]/student/[email].tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, FlatList, TextInput, ScrollView } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';

interface Skill {
  skillName: string;
  description: string;
  checkedOff: boolean;
  checkedOffBy?: string;
  dateCheckedOff?: string;
}

interface CourseData {
  CourseName: string;
  Students: string[];
  Skills: Record<string, { Description: string }>;
  StudentsExtended?: Record<string, {
    FirstName?: string;
    LastName?: string;
    Courses: Record<string, {
      CourseName: string;
      Skills: Record<string, {
        CheckedOff: boolean;
        CheckedOffBy?: string;
        DateCheckedOff?: string;
      }>;
    }>;
  }>;
}

export default function StudentCourseSkillsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const studentEmail = decodeURIComponent(params.email as string);
  const firstName = params.firstName as string;
  const lastName = params.lastName as string;
  const courseId = decodeURIComponent(params.courseId as string);
  const courseName = (params.courseName as string) || courseId;

  // Fetch skills for this student in this course
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        throw new Error('No auth token');
      }

      // Fetch course information with extended student info
      // Student_Emails should be passed as a simple query parameter value (email address)
      const url = `${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}&Student_Emails=${encodeURIComponent(studentEmail)}`;
      console.log('Fetching skills for student in course:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      console.log('API Response status:', res.status);
      const responseText = await res.text();
      console.log('API Response body:', responseText);

      if (!res.ok) {
        console.error('GetCourseInformation failed:', res.status);
        console.error('Response body:', responseText);
        setSkills([]);
        setLoading(false);
        return;
      }

      const data: CourseData = JSON.parse(responseText);
      console.log('Course data received:', JSON.stringify(data, null, 2));

      // Extract skills with their status for this student
      const items: Skill[] = [];
      
      // StudentsExtended is an object keyed by email, not an array
      const studentData = data.StudentsExtended?.[studentEmail];
      
      // Skills are nested under Courses[courseId].Skills
      const studentSkills = studentData?.Courses?.[courseId]?.Skills;
      
      if (data?.Skills && typeof data.Skills === 'object') {
        Object.entries(data.Skills).forEach(([skillName, skillInfo]) => {
          // Check if this student has completed this skill
          const skillStatus = studentSkills?.[skillName];
          
          items.push({
            skillName,
            description: skillInfo?.Description || '',
            checkedOff: skillStatus?.CheckedOff || false,
            checkedOffBy: skillStatus?.CheckedOffBy,
            dateCheckedOff: skillStatus?.DateCheckedOff,
          });
        });
      }

      setSkills(items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setSkills([]);
      setLoading(false);
    }
  }, [courseId, studentEmail]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(skill =>
        skill.skillName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [skills, searchQuery]);

  const handleSkillPress = (skill: Skill) => {
    router.push({
      pathname: '/(tabs)/instructor/course/[courseId]/student/[email]/skill/[skillName]' as any,
      params: {
        courseId: encodeURIComponent(courseId),
        courseName: courseName,
        email: encodeURIComponent(studentEmail),
        skillName: encodeURIComponent(skill.skillName),
        description: skill.description,
        firstName,
        lastName,
        checkedOff: skill.checkedOff.toString(),
        checkedOffBy: skill.checkedOffBy || '',
        dateCheckedOff: skill.dateCheckedOff || '',
      }
    });
  };

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <Pressable
      style={generalStyles.skillCard}
      onPress={() => handleSkillPress(item)}
    >
      <View style={generalStyles.skillInfo}>
        <View style={{ flex: 1 }}>
          <AppText style={generalStyles.cardNameText}>{item.skillName}</AppText>
        </View>
        {item.checkedOff ? (
          <Ionicons name="checkmark-circle" size={24} color="#4972FF" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#9AA0A6" />
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading skills...</AppText>
      </View>
    );
  }

  // Calculate stats for display
  const completedCount = skills.filter(s => s.checkedOff).length;
  const totalCount = skills.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        <View style={{ flex: 1, alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, fontWeight: '600' }}>
            {firstName} {lastName}
          </AppText>
          <AppText style={{ fontSize: 12, color: '#666' }}>{courseName}</AppText>
        </View>
        <Ionicons name="person-circle-outline" size={40} color="#2F6BFF" />
      </View>

      {/* Progress Card */}
      <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 }}>
          Progress
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText style={{ fontSize: 24, fontWeight: '700', color: '#4972FF' }}>
            {progressPercentage}%
          </AppText>
          <AppText style={{ fontSize: 14, color: '#666' }}>
            {completedCount} of {totalCount} skills completed
          </AppText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={generalStyles.searchContainer}>
        <TextInput
          style={generalStyles.searchInput}
          placeholder="Search skills"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={30} color="#9AA0A6" />
      </View>

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <View style={generalStyles.emptyState}>
          <AppText style={generalStyles.emptyStateIcon}>✓</AppText>
          <AppText style={generalStyles.emptyStateTitle}>No skills found</AppText>
          <AppText style={generalStyles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No skills in this view"}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filteredSkills}
          renderItem={renderSkillItem}
          keyExtractor={(item) => item.skillName}
          contentContainerStyle={generalStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
