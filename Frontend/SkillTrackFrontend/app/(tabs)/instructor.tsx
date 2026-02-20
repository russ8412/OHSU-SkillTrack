// app/(tabs)/instructor.tsx
import { AppText } from "@/components/AppText";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../src/constants/api';
import { useRouter } from 'expo-router';
import generalStyles from '../styles';
import { Ionicons } from '@expo/vector-icons';

interface Course {
  courseId: string;
  courseName: string;
  studentCount: number;
}

interface TeacherData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  TeachingTheseCourses?: string[];
}

interface CourseData {
  CourseName: string;
  Students: string[];
  Skills: Record<string, any>;
}

export default function InstructorScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch courses the instructor teaches
  const fetchCourses = useCallback(async () => {
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

      // Fetch course details for each course
      const coursePromises = coursesTeaching.map(async (courseId) => {
        try {
          const res = await fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token,
            },
          });
          
          if (!res.ok) {
            console.error(`Failed to fetch course ${courseId}`);
            return null;
          }

          const courseData: CourseData = await res.json();
          return {
            courseId,
            courseName: courseData.CourseName || courseId,
            studentCount: courseData.Students?.length || 0,
          };
        } catch (err) {
          console.error(`Error fetching course ${courseId}:`, err);
          return null;
        }
      });

      const coursesData = await Promise.all(coursePromises);
      const validCourses = coursesData.filter((c): c is Course => c !== null);
      
      setCourses(validCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) =>
      c.courseId.toLowerCase().includes(q) ||
      c.courseName.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const handleCoursePress = (course: Course) => {
    console.log('Navigating to course:', course.courseId);
    router.push({
      pathname: '/(tabs)/instructor/course/[courseId]' as any,
      params: {
        courseId: encodeURIComponent(course.courseId),
        courseName: course.courseName,
      }
    });
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Pressable
      style={generalStyles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <View style={generalStyles.courseHeader}>
        <AppText style={generalStyles.cardNameText}>
          {item.courseName}
        </AppText>
        <AppText style={generalStyles.courseProgressText}>
          {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
        </AppText>
      </View>
      <AppText style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        {item.courseId}
      </AppText>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading courses...</AppText>
        <Pressable style={generalStyles.refreshButton} onPress={fetchCourses}>
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
          placeholder="Search courses"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={30} color="#9AA0A6" />
      </View>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <View style={generalStyles.emptyState}>
          <AppText style={generalStyles.emptyStateIcon}>📚</AppText>
          <AppText style={generalStyles.emptyStateTitle}>No courses found</AppText>
          <AppText style={generalStyles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No courses assigned"}
          </AppText>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.courseId}
            contentContainerStyle={generalStyles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Add Course Button */}
          <View style={{ alignItems: 'center', marginVertical: 24, marginBottom: 120 }}>
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#4972FF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={() => {
                router.push('/(tabs)/instructor/add-course');
              }}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
