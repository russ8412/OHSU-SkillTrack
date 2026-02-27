// app/(tabs)/instructor/[id].tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';

interface Skill {
  skillName: string;
  description: string;
}

interface Student {
  email: string;
  firstName: string;
  lastName: string;
}

interface StudentSkillStatus {
  [email: string]: {
    [skillName: string]: {
      CheckedOff: boolean;
      CheckedOffBy: string;
      DateCheckedOff: string;
    };
  };
}

interface CourseInformation {
  CourseName: string;
  Skills: Record<string, { Description: string }>;
  Students: Array<{ Email?: string; FirstName?: string; LastName?: string }>;
  Teachers?: string[];
  StudentSkillStatus?: StudentSkillStatus;
}

export default function InstructorCourseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingOff, setCheckingOff] = useState(false);

  const courseName = decodeURIComponent(params.id as string);
  const courseId = decodeURIComponent(params.courseId as string);

  // Fetch course information
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log(`Fetching course information for: ${courseId}`);
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

      const data: CourseInformation = await response.json();
      console.log('Course data received:', data);

      // Process skills
      const skillsArray: Skill[] = [];
      if (data.Skills && typeof data.Skills === 'object') {
        Object.entries(data.Skills).forEach(([skillName, skillInfo]) => {
          skillsArray.push({
            skillName,
            description: (skillInfo as any)?.Description || '',
          });
        });
      }

      // Process students
      const studentsArray: Student[] = [];
      if (data.Students && Array.isArray(data.Students)) {
        data.Students.forEach((student: any) => {
          // Students array contains strings (emails) in the new format
          // Handle both string format and object format
          let email = '';
          let firstName = '';
          let lastName = '';
          
          if (typeof student === 'string') {
            // New format: Students are just email strings
            email = student;
            // Extract name from email if possible (before @)
            const namePart = email.split('@')[0];
            firstName = namePart;
          } else if (typeof student === 'object') {
            // Old format or if API returns objects
            email = student.Email || '';
            firstName = student.FirstName || '';
            lastName = student.LastName || '';
          }
          
          console.log('Processing student:', { email, firstName, lastName });
          
          studentsArray.push({
            email,
            firstName,
            lastName,
          });
        });
      }

      console.log('Processed students:', studentsArray);
      setSkills(skillsArray);
      setStudents(studentsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      Alert.alert('Error', 'Failed to load course information');
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;

    return students.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Toggle student selection
  const toggleStudentSelection = (email: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(email)) {
      newSet.delete(email);
    } else {
      newSet.add(email);
    }
    setSelectedStudents(newSet);
  };

  // Check off selected students
  const handleCheckOff = async () => {
    if (!selectedSkill) {
      Alert.alert('Error', 'Please select a skill');
      return;
    }

    if (selectedStudents.size === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    try {
      setCheckingOff(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        setCheckingOff(false);
        return;
      }

      const studentList = Array.from(selectedStudents);

      console.log('Checking off students:', {
        courseId,
        skillName: selectedSkill,
        studentList,
      });

      const requestBody = {
        Course_ID: courseId,
        Skill_Name: selectedSkill,
        Student_List: studentList,
      };

      console.log('Request body being sent:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${BASE_URL}/CheckStudentOff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('CheckStudentOff response status:', response.status);
      const responseText = await response.text();
      console.log('CheckStudentOff raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Alert.alert('Success', `${selectedStudents.size} student(s) checked off for ${selectedSkill}`);
      setSelectedStudents(new Set());
      setSelectedSkill(null);

      // Refresh course data
      await fetchCourseData();
    } catch (error) {
      console.error('Error checking off students:', error);
      Alert.alert('Error', 'Failed to check off students');
    } finally {
      setCheckingOff(false);
    }
  };

  const renderSkillButton = (skill: Skill) => (
    <Pressable
      key={skill.skillName}
      style={[
        generalStyles.filterButton,
        selectedSkill === skill.skillName && generalStyles.activeFilterButton,
      ]}
      onPress={() => setSelectedSkill(skill.skillName)}
    >
      <AppText
        style={[
          generalStyles.filterButtonText,
          selectedSkill === skill.skillName && generalStyles.activeFilterButtonText,
        ]}
      >
        {skill.skillName}
      </AppText>
    </Pressable>
  );

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isSelected = selectedStudents.has(item.email);
    return (
      <Pressable
        style={[
          generalStyles.skillCard,
          isSelected && { backgroundColor: '#D4E3FF' },
        ]}
        onPress={() => toggleStudentSelection(item.email)}
      >
        <View style={generalStyles.skillInfo}>
          <View style={{ flex: 1 }}>
            <AppText style={generalStyles.cardNameText}>
              {item.firstName} {item.lastName}
            </AppText>
            <AppText style={{ fontSize: 14, color: '#666' }}>
              {item.email}
            </AppText>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#4972FF" />
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading course...</AppText>
      </View>
    );
  }

  return (
    <View style={generalStyles.container}>
      {/* Header */}
      <View style={generalStyles.headerContainer}>
        <Pressable
          onPress={() => router.replace('/instructor')}
          hitSlop={10}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back-outline" size={40} color="#000000" />
        </Pressable>
        <AppText style={generalStyles.courseHeaderTitle}>{courseName}</AppText>
        <Ionicons name="school-outline" size={40} color="#2F6BFF" />
      </View>

      {/* Skill Selection */}
      <View style={{ marginBottom: 16 }}>
        <AppText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
          Select Skill to Check Off
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={generalStyles.filterScroll}
        >
          {skills.map(skill => renderSkillButton(skill))}
        </ScrollView>
      </View>

      {/* Selected Skill Info */}
      {selectedSkill && (
        <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: '#4972FF' }}>
            Selected: {selectedSkill}
          </AppText>
          <AppText style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {selectedStudents.size} student(s) selected
          </AppText>
        </View>
      )}

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
          <AppText style={generalStyles.emptyStateTitle}>No students found BRUH!</AppText>
          <AppText style={generalStyles.emptyStateText}>
            {searchQuery ? "Try adjusting your search" : "No students in this course"}
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

      {/* Check Off Button */}
      {selectedSkill && selectedStudents.size > 0 && (
        <Pressable
          style={[
            generalStyles.refreshButton,
            { marginBottom: 120 },
            checkingOff && { opacity: 0.6 },
          ]}
          onPress={handleCheckOff}
          disabled={checkingOff}
        >
          <AppText style={generalStyles.refreshButtonText}>
            {checkingOff ? 'Checking off...' : `Check Off ${selectedStudents.size} Student(s)`}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
