import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, FlatList, TextInput, ScrollView } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText'


interface Skill {
  skillName: string;
  status: boolean;
}

interface StudentData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Courses?: Record<
    string,
    {
      CourseName?: string,
      Skills?: Record<string, boolean>
    }
  >;
}

export default function CourseSkillsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [loading, setLoading] = useState(true);

  // Parse course data from params
  const courseName = decodeURIComponent(params.id as string);
  // const year = parseInt(params.year as string) || 1;
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

      console.log('Fetching all data from /FetchUserData endpoint');
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
      console.log('Full data received:', data);
      
      // Find the specific course in the data structure
      let courseSkills: Skill[] = [];

      const coursesObject = data.Courses;
      
      // updated to take years out and now only relies on course objects
      if (coursesObject && typeof coursesObject === 'object') {
        const matchedCourse = Object.values(coursesObject).find((c) => c?.CourseName === courseName);

        if (matchedCourse?.Skills) {
          const skillEntries = Object.entries(matchedCourse.Skills);
          courseSkills = skillEntries.map(([skillName, status]) => ({
            skillName,
            status: status === true
          }));
          console.log(`Found ${skillEntries.length} skills for course: ${courseName}`);
        } else {
          console.warn(`Course not found: ${courseName}`);
          }
      }
      
      setSkills(courseSkills);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching course skills:', error);
      setLoading(false);
    }
  }, [courseName]);

  useEffect(() => {
    fetchCourseSkills();
  }, [fetchCourseSkills]);

  // const completedSkills = completedSkillsFromParams > 0 
  //   ? completedSkillsFromParams 
  //   : skills.filter(skill => skill.status).length;
  // const totalSkillsCount = totalSkills > 0 
  //   ? totalSkills 
  //   : skills.length;

  
  const filteredSkills = useMemo(() => {
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
    
    return filtered;
  }, [searchQuery, filter, skills]);

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
      }
    });
  };

  // we should consider making this blue to make it pop!

  // const getStatusColor = (status: boolean) => {
  //   return status ? '#4972FF' : '#000000';
  // };

  // here's a function to get a checkmark once a skill is complete
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <Ionicons name="checkmark-outline" size={24} color="000000" />
    ) : ""
  };

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <Pressable 
      style={generalStyles.skillCard}
      onPress={() => handleSkillPress(item)}
    >
      <View style={generalStyles.skillInfo}>
        <AppText style={generalStyles.cardNameText}>{item.skillName}</AppText>

          <AppText>
            {getStatusIcon(item.status)}
          </AppText>
      </View>
      
      {/* <View style={generalStyles.progressBar}>
        <View 
          style={[
            generalStyles.progressFill,
            { width: `${getProgressPercentage(item.completedSkills, item.totalSkills)}%` }
          ]}
        />
      </View> */}
    </Pressable>
  );

  return (
    <>
      <View style={generalStyles.container}>
        {/* Course Info */}
          <View style={generalStyles.headerContainer}>
              <Pressable
              onPress={() => router.replace('/')}
              hitSlop={10} // this lets users tap slightly outside the icon
              accessibilityLabel="Back"
              >
              <Ionicons name="arrow-back-outline" size={40} color="#000000" />
              </Pressable>
              <AppText style={generalStyles.courseHeaderTitle}>{courseName}</AppText>
              <Ionicons name="checkmark-circle-outline" size={40} color="#2F6BFF" />
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

        {/* Filter Buttons */}
        <View style={generalStyles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={generalStyles.filterScroll}
          >
            <Pressable 
              style={[
                generalStyles.filterButton,
                filter === 'all' && generalStyles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <AppText style={[
                generalStyles.filterButtonText,
                filter === 'all' && generalStyles.activeFilterButtonText
              ]}>
                All Skills
              </AppText>
            </Pressable>
            
            <Pressable 
              style={[
                generalStyles.filterButton,
                filter === 'complete' && generalStyles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('complete')}
            >
              <AppText style={[
                generalStyles.filterButtonText,
                filter === 'complete' && generalStyles.activeFilterButtonText
              ]}>
                Complete
              </AppText>
            </Pressable>
            
            <Pressable 
              style={[
                generalStyles.filterButton,
                filter === 'incomplete' && generalStyles.activeFilterButton
              ]}
              onPress={() => handleFilterChange('incomplete')}
            >
              <AppText style={[
                generalStyles.filterButtonText,
                filter === 'incomplete' && generalStyles.activeFilterButtonText
              ]}>
                Incomplete
              </AppText>
            </Pressable>
          </ScrollView>
        </View>
        
        {/* Skills List */}
        {loading ? (
          <View style={generalStyles.loadingContainer}>
            <AppText style={generalStyles.loadingText}>Loading skills...</AppText>
          </View>
        ) : filteredSkills.length === 0 ? (

          // this is the case where no skills are found
          <View style={generalStyles.emptyState}>
            <AppText style={generalStyles.emptyStateIcon}>🔍</AppText>
            <AppText style={generalStyles.emptyStateTitle}>No skills found</AppText>
            <AppText style={generalStyles.emptyStateText}>
              {searchQuery ? "Try adjusting your search" : 
               filter === 'complete' ? "No complete skills" : 
               filter === 'incomplete' ? "All skills are complete!" : 
               "No skills available"}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={filteredSkills}
            renderItem={renderSkillItem}
            keyExtractor={(item, index) => `${item.skillName}-${index}`}
            contentContainerStyle={generalStyles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}