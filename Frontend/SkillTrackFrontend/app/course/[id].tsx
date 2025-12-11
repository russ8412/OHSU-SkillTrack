import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { BASE_URL } from '../../src/constants/api';

interface Skill {
  skillName: string;
  status: boolean;
}

interface Course {
  CourseName?: string;
  Skills?: Record<string, boolean>;
}

interface YearData {
  Courses?: Course[];
}

interface StudentData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Years?: YearData[];
}

export default function CourseSkillsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [loading, setLoading] = useState(true);

  // Parse course data from params
  const courseName = decodeURIComponent(params.id as string);
  const year = parseInt(params.year as string) || 1;
  const totalSkills = parseInt(params.totalSkills as string) || 0;
  const completedSkillsFromParams = parseInt(params.completedSkills as string) || 0;

  const fetchCourseSkills = useCallback(async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('Fetching all data from /hello endpoint');
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
      console.log('Full data received:', data);
      
      // Find the specific course in the data structure
      let courseSkills: Skill[] = [];
      
      if (data.Years && Array.isArray(data.Years)) {
        // Year is 1-based index in the UI, but 0-based in the array
        const yearIndex = year - 1;
        if (yearIndex >= 0 && yearIndex < data.Years.length) {
          const yearData = data.Years[yearIndex];
          
          if (yearData.Courses && Array.isArray(yearData.Courses)) {
            const course = yearData.Courses.find(c => 
              c.CourseName === courseName
            );
            
            if (course && course.Skills) {
              const skillEntries = Object.entries(course.Skills);
              courseSkills = skillEntries.map(([skillName, status]) => ({
                skillName,
                status: status === true
              }));
              console.log(`Found ${skillEntries.length} skills for course: ${courseName}`);
            } else {
              console.warn(`Course not found: ${courseName} in year ${year}`);
            }
          }
        }
      }
      //fallback mock data if no skills found. only for testing purposes
      if (courseSkills.length === 0) {
        console.log('No skills found in API response, using fallback data');
        const mockSkills: Skill[] = [
          { skillName: 'Handwashing - Infection Prevention', status: true },
          { skillName: 'PPE - Infection Prevention', status: true },
          { skillName: 'Vital Signs / Oximetry', status: true },
          { skillName: 'Intake / Output, Specimen Collection', status: false },
          { skillName: 'Basic Skills Checklist', status: false },
          { skillName: 'Introduction to Lab Values', status: false },
          { skillName: 'Mobility - Ambulation', status: false },
          { skillName: 'IV - Medical Administration and Calculation', status: false },
        ];
        courseSkills = mockSkills;
      }
      
      setSkills(courseSkills);
      setFilteredSkills(courseSkills);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching course skills:', error);
      setLoading(false);
    }
  }, [courseName, year]);

  useEffect(() => {
    fetchCourseSkills();
  }, [fetchCourseSkills]);

  const completedSkills = completedSkillsFromParams > 0 
    ? completedSkillsFromParams 
    : skills.filter(skill => skill.status).length;
  const totalSkillsCount = totalSkills > 0 
    ? totalSkills 
    : skills.length;

  // Filter
  useEffect(() => {
    let filtered = skills;
    
    // Apply status filter
    if (filter === 'complete') {
      filtered = filtered.filter(skill => skill.status === true);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(skill => skill.status === false);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(skill =>
        skill.skillName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredSkills(filtered);
  }, [searchQuery, filter, skills]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (newFilter: 'all' | 'complete' | 'incomplete') => {
    setFilter(newFilter);
  };

  const handleSkillPress = (skill: Skill) => {
    router.push({
      pathname: '/skill/[id]',
      params: { 
        id: encodeURIComponent(skill.skillName),
        status: skill.status ? 'complete' : 'incomplete',
        courseName: courseName,
        year: year.toString()
      }
    });
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#34C759' : '#FF9500';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Complete' : 'Incomplete';
  };

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <Pressable 
      style={styles.skillCard}
      onPress={() => handleSkillPress(item)}
    >
      <View style={styles.skillInfo}>
        <Text style={styles.skillName}>{item.skillName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status ? '#E8F5E9' : '#FFF4E5' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: courseName,
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseName}</Text>
          <Text style={styles.yearText}>Year {year}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {completedSkills}/{totalSkillsCount} skills complete
            </Text>
          </View>
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

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <Pressable 
              style={[
                styles.filterButton,
                filter === 'all' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'all' && styles.activeFilterButtonText
              ]}>
                All Skills
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.filterButton,
                filter === 'complete' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('complete')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'complete' && styles.activeFilterButtonText
              ]}>
                Complete
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.filterButton,
                filter === 'incomplete' && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('incomplete')}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'incomplete' && styles.activeFilterButtonText
              ]}>
                Incomplete
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Skills Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
            {filter === 'complete' ? ' complete' : filter === 'incomplete' ? ' incomplete' : ''}
          </Text>
        </View>
        
        {/* Skills List */}
        {loading ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.loadingText}>Loading skills...</Text>
          </View>
        ) : filteredSkills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No skills found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? "Try adjusting your search" : 
               filter === 'complete' ? "No complete skills" : 
               filter === 'incomplete' ? "All skills are complete!" : 
               "No skills available"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSkills}
            renderItem={renderSkillItem}
            keyExtractor={(item, index) => `${item.skillName}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // ... (keep all existing styles exactly as they were)
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  courseInfo: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  yearText: {
    fontSize: 17,
    color: '#8E8E93',
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#000000',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  listContainer: {
    paddingBottom: 20,
  },
  skillCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 85,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: '#C7C7CC',
    fontWeight: '300',
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
});