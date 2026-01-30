// app/(tabs)/instructor.tsx
import { AppText } from "@/components/AppText";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, TextInput } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../src/constants/api';
import { useRouter } from 'expo-router';
import generalStyles from '../styles';
import { Ionicons } from '@expo/vector-icons';

interface Student {
  email: string;
  firstName: string;
  lastName: string;
  courses: string[]; // Course IDs this student is enrolled in
}

interface CourseData {
  courseId: string;
  CourseName: string;
  Students: string[];
  Skills: Record<string, any>;
}

interface TeacherData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  TeachingTheseCourses?: string[];
}

export default function InstructorScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch all students from all instructor's courses
  const fetchAllStudents = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Get instructor's courses
      const userResponse = await fetch(`${BASE_URL}/FetchUserData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userData: TeacherData = await userResponse.json();
      const coursesTeaching = userData.TeachingTheseCourses || [];

      // Fetch all course data to get students
      const studentMap = new Map<string, Student>();

      const coursePromises = coursesTeaching.map(courseId =>
        fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        })
          .then(res => res.json())
          .then((courseData: CourseData) => {
            // Add students from this course to the map
            if (courseData.Students && Array.isArray(courseData.Students)) {
              courseData.Students.forEach((studentEmail: string) => {
                if (!studentMap.has(studentEmail)) {
                  // Extract name from email
                  const namePart = studentEmail.split('@')[0];
                  studentMap.set(studentEmail, {
                    email: studentEmail,
                    firstName: namePart,
                    lastName: '',
                    courses: [courseId],
                  });
                } else {
                  // Add course to existing student
                  const student = studentMap.get(studentEmail)!;
                  if (!student.courses.includes(courseId)) {
                    student.courses.push(courseId);
                  }
                }
              });
            }
          })
          .catch(err => console.error(`Error fetching course ${courseId}:`, err))
      );

      await Promise.all(coursePromises);
      const allStudents = Array.from(studentMap.values());
      setStudents(allStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStudents();
  }, [fetchAllStudents]);

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
    console.log('Navigating to student:', student.email, 'Courses:', student.courses);
    router.push({
      pathname: '/(tabs)/instructor/student/[email]' as any,
      params: {
        email: encodeURIComponent(student.email),
        firstName: student.firstName,
        lastName: student.lastName,
        courses: JSON.stringify(student.courses),
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
        <AppText style={generalStyles.courseProgressText}>
          {item.courses.length} course(s)
        </AppText>
      </View>
      <AppText style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        {item.email}
      </AppText>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading students...</AppText>
        <Pressable style={generalStyles.refreshButton} onPress={fetchAllStudents}>
          <AppText style={generalStyles.refreshButtonText}>Refresh</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={generalStyles.container}>
      {/* Header */}
      <View style={generalStyles.headerContainer}>
        <View />
        <AppText style={generalStyles.headerTitle}>
          SkillTrack
        </AppText>
        <Ionicons name="school-outline" size={40} color="#2F6BFF" />
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
