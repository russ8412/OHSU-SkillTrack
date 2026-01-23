// app/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Stack } from 'expo-router';
import { BASE_URL } from '../src/constants/api';

interface StudentData {
  Email?: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string[] | null;
  ID?: string;
  Years?: Record<string, {
    Courses?: Record<string, {
      CourseName?: string;
      Skills?: Record<string, boolean>;
    }>;
  }>;
}

const ProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { width: `${Math.round(percentage)}%` }
          ]}
        />
      </View>
      <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalSkills, setTotalSkills] = useState(0);
  const [completedSkills, setCompletedSkills] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        console.log('Fetching user data from:', `${BASE_URL}/FetchUserData`);
        const response = await fetch(`${BASE_URL}/FetchUserData`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          setLoading(false);
          return;
        }

        const data: StudentData = await response.json();
        setUserData(data);

        // Log for debug
       //console.log('Full API Response:', JSON.stringify(data, null, 2));

        // Calculate total and completed skills
        let totalCount = 0;
        let completedCount = 0;

        if (data.Years && typeof data.Years === 'object') {
          console.log('Years object:', data.Years);
          
          // Years is a dictionary, not an array
          Object.entries(data.Years).forEach(([yearKey, yearData]: any) => {
            console.log(`Processing Year ${yearKey}`);
            
            if (yearData.Courses && typeof yearData.Courses === 'object') {
              console.log(`  Number of courses in Year ${yearKey}:`, Object.keys(yearData.Courses).length);
              
              // Courses is also a dictionary, not an array
              Object.entries(yearData.Courses).forEach(([courseKey, course]: any) => {
                if (course.Skills && typeof course.Skills === 'object') {
                  const skillEntries = Object.entries(course.Skills);
                  console.log(`    Course ${courseKey} (${course.CourseName}): ${skillEntries.length} skills`);
                  totalCount += skillEntries.length;
                  completedCount += skillEntries.filter(([_, status]: any) => status === true).length;
                }
              });
            }
          });
        }

        console.log('Total skills calculated:', totalCount);
        console.log('Completed skills calculated:', completedCount);
        setTotalSkills(totalCount);
        setCompletedSkills(completedCount);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const progressPercentage = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
  const fullName = `${userData?.FirstName || 'User'} ${userData?.LastName || ''}`.trim();

  // Determine year (find the highest year number from Years dictionary)
  const currentYear = userData?.Years 
    ? Math.max(...Object.keys(userData.Years).map(Number))
    : 1;

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: 'My Profile',
            headerBackVisible: false,
          }}
        />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'My Profile',
          headerBackVisible: false,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>My Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfoSection}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.yearText}>Year {currentYear}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <ProgressBar percentage={progressPercentage} />
          <View style={styles.progressDetailsContainer}>
            <Text style={styles.progressDetails}>
              {completedSkills} of {totalSkills} skills completed
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSkills}</Text>
            <Text style={styles.statLabel}>Total Skills</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSkills}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSkills - completedSkills}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  userInfoSection: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  userName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  yearText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  progressPercentage: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  progressDetailsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  progressDetails: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
});
