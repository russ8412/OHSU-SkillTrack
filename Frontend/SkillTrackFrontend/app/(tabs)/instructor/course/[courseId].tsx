// app/(tabs)/instructor/course/[courseId].tsx
import { AppText } from "@/components/AppText";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, TextInput } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../../../src/constants/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';

interface Student {
  email: string;
  firstName: string;
  lastName: string;
}

interface CourseData {
  CourseName: string;
  Students: string[];
  Skills: Record<string, any>;
}

export default function CourseDetailScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = decodeURIComponent(params.courseId as string);
  const courseName = (params.courseName as string) || courseId;

  // Fetch students in this course
  const fetchStudents = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const courseData: CourseData = await response.json();
      
      // Process students
      const studentsArray: Student[] = [];
      if (courseData.Students && Array.isArray(courseData.Students)) {
        courseData.Students.forEach((studentEmail: string) => {
          // Extract name from email
          const namePart = studentEmail.split('@')[0];
          studentsArray.push({
            email: studentEmail,
            firstName: namePart,
            lastName: '',
          });
        });
      }

      setStudents(studentsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;

    return students.filter((s) =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleStudentPress = (student: Student) => {
    console.log('Navigating to student:', student.email, 'in course:', courseId);
    router.push({
      pathname: '/(tabs)/instructor/course/[courseId]/student/[email]' as any,
      params: {
        courseId: encodeURIComponent(courseId),
        courseName: courseName,
        email: encodeURIComponent(student.email),
        firstName: student.firstName,
        lastName: student.lastName,
      }
    });
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <Pressable
      style={generalStyles.courseCard}
      onPress={() => handleStudentPress(item)}
    >
      <View style={generalStyles.courseHeader}>
        <AppText style={generalStyles.cardNameText}>
          {item.firstName} {item.lastName}
        </AppText>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading students...</AppText>
        <Pressable style={generalStyles.refreshButton} onPress={fetchStudents}>
          <AppText style={generalStyles.refreshButtonText}>Refresh</AppText>
        </Pressable>
      </View>
    );
  }

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
        <AppText style={generalStyles.headerTitle}>
          {courseName}
        </AppText>
        <Ionicons name="school-outline" size={40} color="#2F6BFF" />
      </View>

      {/* Course Info */}
      <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 }}>
          Course ID
        </AppText>
        <AppText style={{ fontSize: 16, color: '#4972FF', fontWeight: '500' }}>
          {courseId}
        </AppText>
        <AppText style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
          {students.length} student{students.length !== 1 ? 's' : ''} enrolled
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={generalStyles.searchContainer}>
        <TextInput
          style={generalStyles.searchInput}
          placeholder="Search students"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={30} color="#9AA0A6" />
      </View>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <View style={generalStyles.emptyState}>
          <AppText style={generalStyles.emptyStateIcon}>👥</AppText>
          <AppText style={generalStyles.emptyStateTitle}>No students found</AppText>
          <AppText style={generalStyles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No students enrolled"}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.email}
          contentContainerStyle={generalStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
