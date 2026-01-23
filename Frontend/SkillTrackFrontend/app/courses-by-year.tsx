// app/index.tsx
import { AppText } from "@/components/AppText";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { BASE_URL } from '../src/constants/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import generalStyles from './styles';

import { Ionicons } from '@expo/vector-icons';


interface Course {
  courseId: string;
  courseName: string;
  totalSkills: number;
  completedSkills: number;
  year: number;
  skills: Array<{
    skillName: string;
    status: boolean;
  }>;
}

// Defines the structure of the student data returned by the API
// Students have Years, which contain Courses, which contain Skills
interface StudentData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Years?: Record<
    string,
    {
      Courses?: Record<
      string,
      {
        CourseName?: string;
        Skills?: Record<string, boolean>;
      }
      >;
    }
  >;
}



// Now define the component function AFTER styles
export default function CourseListScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  // const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(1);

  const router = useRouter();
  const params = useLocalSearchParams<{ year?: string }>();

  // Set selected year from URL params on initial load
  useEffect(() => {
    if (params?.year) {
      const yearNum = parseInt(params.year, 10);
      if (!Number.isNaN(yearNum)) {
        setSelectedYear(yearNum);
      }
    }
  }, [params?.year]);


  const handleLogout = async () => {
    try {
      await signOut();
      // The app will automatically show the login screen
      // because Authenticator will detect the user is signed out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Fetch data from API
  const fetchCoursesData = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // calls the updated API endpoint
      console.log('Fetching data from:', `${BASE_URL}/FetchUserData`);
      const response = await fetch(`${BASE_URL}/FetchUserData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudentData = await response.json();
      
      // Process data into courses with progress
      const allCourses: Course[] = [];
      
      // Process years data
      const yearsObject = data.Years;
      
      if (yearsObject && typeof yearsObject === 'object') {
        Object.entries(yearsObject).forEach(([yearIndex, yearData]) => {
          const yearNum = parseInt(yearIndex, 10); // Convert year index to number unsure if needed...
          if (Number.isNaN(yearNum)) return; // Skip invalid year indices

          const coursesObject = yearData?.Courses;
          if (!coursesObject || typeof coursesObject !== 'object') return; // Skip if no courses (shouldn't really happen)

          Object.entries(coursesObject).forEach(([courseId, course]) => {
            const courseName = course?.CourseName || 'Unnamed Course'; // in the case of a missing name... shouldn't happen ideally
            const skills = course?.Skills || {}; // Default to empty object if no skills
            const skillEntries = Object.entries(skills); // [ [skillName, status], ... ]
            
            // Count completed skills (status === true)
            const completedCount = skillEntries.filter(([_, status]) => status === true).length;

            allCourses.push({
              courseId,
              courseName,
              totalSkills: skillEntries.length,
              completedSkills: completedCount,
              year: yearNum,
              skills: skillEntries.map(([skillName, status]) => ({
                skillName,
                status: status === true,
              })),
            });
          });
        });
      }
              
      // console.log('`Course: ${courseName}, Total: ${skillEntries.length}, Completed: ${completedCount}`');
      console.log('Processed courses: ', allCourses);
      
      setCourses(allCourses);
      setLoading(false);      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesData();
  }, [fetchCoursesData]);

  // Filter courses based on search and year
  // useMemo is more efficient because it only re-computes when courses, selectedYear, or searchQuery changes
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filterByYear = courses.filter((c) => c.year === selectedYear);

    if (!q) return filterByYear;

    return filterByYear.filter((c) => 
      (c.courseName ?? '').toLowerCase().includes(q)
    );
  }, [courses, selectedYear, searchQuery]);

  // handleCoursePress simply takes us to the path below where we have course information
  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/course/[id]',
      params: { 
        id: encodeURIComponent(course.courseName),
        courseId: course.courseId,
        year: course.year.toString(),
        totalSkills: course.totalSkills.toString(),
        completedSkills: course.completedSkills.toString(),
        skills: JSON.stringify(course.skills)
      }
    });
  };

  // we may do something like this for the profile page for total progress
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // 
  const renderCourseItem = ({ item }: { item: Course }) => (
    <Pressable 
      style={generalStyles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <View style={generalStyles.courseHeader}>
        <AppText style={generalStyles.courseName}>{item.courseName}</AppText>

          <AppText style={generalStyles.courseProgressText}>
            {item.completedSkills}/{item.totalSkills} skills complete
          </AppText>
      </View>
      
      {/* May need to investigate how to replace progress bar with a completed check mark once a user has completed all tasks... */}
      <View style={generalStyles.progressBar}>
        <View 
          style={[
            generalStyles.progressFill,
            { width: `${getProgressPercentage(item.completedSkills, item.totalSkills)}%` }
          ]}
        />
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingHeader}>Loading courses...</AppText>
        <Pressable style={generalStyles.refreshButton} onPress={fetchCoursesData}>
          <AppText style={generalStyles.refreshButtonText}>Refresh</AppText>
        </Pressable>
      </View>
    );
  }



  // Get unique years from courses
  const years = Array.from(new Set(courses.map(course => course.year))).sort((a, b) => a - b); // sort ascending

  return (
    <View style={generalStyles.container}>
      {/* Header with logout button */}
      <View style={generalStyles.headerContainer}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10} // this lets users tap slightly outside the icon
            accessibilityLabel="Back"
          >
            <Ionicons name="checkmark-circle-outline" size={40} color="#2F6BFF" />
          </Pressable>
        <AppText style={generalStyles.headerTitle}>
          Year {selectedYear || 'All'}
        </AppText>
        <Pressable onPress={handleLogout} style={generalStyles.logoutButton}>
          <AppText style={generalStyles.logoutText}>Logout</AppText>
        </Pressable>
      </View>
      
      {/* Search Bar */}
      <View style={generalStyles.searchContainer}>
        <TextInput
          style={generalStyles.searchInput}
          placeholder="Search"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={30} color="#9AA0A6" />
      </View>
      
      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <View style={generalStyles.emptyState}>
          {/* clear use of AI btw */}
          <AppText style={generalStyles.emptyStateIcon}>📚</AppText> 
          <AppText style={generalStyles.emptyStateTitle}>No courses found!</AppText>
          <AppText style={generalStyles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No courses available"}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => `${item.courseId}-${item.year}`}
          contentContainerStyle={generalStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}