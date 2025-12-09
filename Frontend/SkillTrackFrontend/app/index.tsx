// app/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { BASE_URL } from '../src/constants/api';
import { useRouter } from 'expo-router';

interface Course {
  courseName: string;
  totalSkills: number;
  completedSkills: number;
  year: number;
  skills: Array<{
    skillName: string;
    status: boolean;
  }>;
}

interface StudentData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Years?: Array<{
    Courses?: Array<{
      CourseName?: string;
      Skills?: Record<string, boolean>;
    }>;
  }>;
}

// Define styles BEFORE the component function
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#000000',
  },
  yearFilterContainer: {
    marginBottom: 24,
    maxHeight: 40,
  },
  yearButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeYearButton: {
    backgroundColor: '#007AFF',
  },
  yearButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeYearButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  progressContainer: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  refreshButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#8E8E93',
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4745b5',
    marginBottom: 4,
  },
});

// Now define the component function AFTER styles
export default function CourseListScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(1);
  const router = useRouter();

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

      console.log('Fetching data from:', `${BASE_URL}/hello`);
      const response = await fetch(`${BASE_URL}/hello`, {
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
      
      // Check if Years exists and is an array
      if (data.Years && Array.isArray(data.Years)) {
        data.Years.forEach((yearData, yearIndex) => {
          // Check if Courses exists and is an array
          if (yearData.Courses && Array.isArray(yearData.Courses)) {
            yearData.Courses.forEach(course => {
              const courseName = course.CourseName || 'Unnamed Course';
              const skills = course.Skills || {};
              const skillEntries = Object.entries(skills);
              
              // Count completed skills (status === true)
              const completedCount = skillEntries.filter(([_, status]) => status === true).length;
              
              const courseData: Course = {
                courseName,
                totalSkills: skillEntries.length,
                completedSkills: completedCount,
                year: yearIndex + 1,
                skills: skillEntries.map(([skillName, status]) => ({
                  skillName,
                  status: status === true
                }))
              };
              
              console.log(`Course: ${courseName}, Total: ${skillEntries.length}, Completed: ${completedCount}`);
              allCourses.push(courseData);
            });
          }
        });
      }

      console.log('Processed courses:', allCourses);
      
      setCourses(allCourses);
      setFilteredCourses(allCourses.filter(course => course.year === 1));
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
  useEffect(() => {
    let filtered = courses;
    
    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter(course => course.year === selectedYear);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchQuery, selectedYear, courses]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleYearSelect = (year: number | null) => {
    setSelectedYear(year);
  };

  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/course/[id]',
      params: { 
        id: encodeURIComponent(course.courseName),
        year: course.year.toString(),
        totalSkills: course.totalSkills.toString(),
        completedSkills: course.completedSkills.toString(),
        skills: JSON.stringify(course.skills)
      }
    });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Pressable 
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseName}>{item.courseName}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {item.completedSkills}/{item.totalSkills} skills complete
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${getProgressPercentage(item.completedSkills, item.totalSkills)}%` }
          ]}
        />
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.header}>Loading courses...</Text>
        <Pressable style={styles.refreshButton} onPress={fetchCoursesData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  // Get unique years from courses
  const years = Array.from(new Set(courses.map(course => course.year))).sort();

  return (
    <View style={styles.container}>
      {/* Header with logout button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          Year {selectedYear || 'All'}
        </Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      {/* Year Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.yearFilterContainer}
      >
        <Pressable 
          style={[
            styles.yearButton,
            selectedYear === null && styles.activeYearButton
          ]}
          onPress={() => handleYearSelect(null)}
        >
          <Text style={[
            styles.yearButtonText,
            selectedYear === null && styles.activeYearButtonText
          ]}>
            All Years
          </Text>
        </Pressable>
        
        {years.map(year => (
          <Pressable
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.activeYearButton
            ]}
            onPress={() => handleYearSelect(year)}
          >
            <Text style={[
              styles.yearButtonText,
              selectedYear === year && styles.activeYearButtonText
            ]}>
              Year {year}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📚</Text>
          <Text style={styles.emptyStateTitle}>No courses found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No courses available"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item, index) => `${item.courseName}-${item.year}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}