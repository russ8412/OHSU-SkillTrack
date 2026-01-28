// app/skill/[id].tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { BASE_URL } from '../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText'

interface SkillDetailData {
  skillName: string;
  description: string;
  requirements: string[];
  resources: Array<{
    name: string;
    url: string;
  }>;
  completionDetails: string;
}

interface CourseInfoResponse{
  CourseName?: string;
  Skills?: Record<string,
  {
    Description?: string;
    Requirements?: string[];
    Resources?: Array<{ name: string; url?: string }>;
    CompletionDetails?: string;  // this could be needed for the "need to get checked off"/"checked off by _ on _" at the bottom?
  }>;
}

export default function SkillDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const [skillData, setSkillData] = useState<SkillDetailData | null>(null);

  // Parse skill data from params
  const skillName = decodeURIComponent(params.id as string);
  const status = params.status as string || 'incomplete';
  const courseName = decodeURIComponent(params.courseName as string) || 'Unknown Course';

  const isComplete = status === 'complete';

  const courseId = params.courseId as string;

  const handleBack = () => {
    if (courseName) {
      router.replace({ 
        pathname: "/course/[id]", 
        params: { id: encodeURIComponent(courseName), courseId },
      });
    } else {
      router.back(); // hopefully the top works so this doesnt take us to the profile page
      console.log("Error going back to course ", {courseName} )
    }
  }


  // Optional: Verify skill status with API (but /hello doesn't have individual skill status)

    useEffect( () => { 
      const fetchSkillDetails = async () => {
      try {
        setLoading(true);

        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        console.log('fetching skill details from: ', `${BASE_URL}/GetCourseInformation`)
        // Get all data to verify skill status based on courseId
        const response = await fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        });
        
        console.log('Fetching info for courseId: ', courseId);

        // friendlier error responses
        if (!response.ok) {
          const text = await response.text();
          console.error('/GetCourseInformation call failed:', {
            status: response.status,
            body: text,
            courseIdSent: courseId,
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const courseInfo: CourseInfoResponse = await response.json();
        console.log('course info: ', courseInfo);

        const skillTemplate = courseInfo?.Skills?.[skillName];

        if (!skillTemplate) {
          console.warn('Skill not found in course: ', { courseName, skillName });
          setLoading(false);
          return;
        }
        
      
        setSkillData({
          skillName,
          description: skillTemplate.Description ?? 'No description available.',
          requirements: skillTemplate.Requirements ?? ['No requirements available.'],
          resources: (skillTemplate.Resources ?? []).map((r) => ({
            name: r.name ?? 'Resource',
            url: r.url ?? '#',
          })),
          completionDetails: skillTemplate.CompletionDetails ?? (
            isComplete ? 'Marked as complete by instructor.' // probably change based on what message we want
            : 'This skill has not been marked as complete by an instructor.'
          ),
        }),

        setLoading(false);
      } catch (error) {
        console.error('Error verifying skill status:', error);
        setLoading(false);
      }
    };

    fetchSkillDetails();
  }, [skillName, courseName, courseId, isComplete]);

  const handleResourcePress = (url: string) => {
    if (url && url !== '#' && url.startsWith('http')) {
      Linking.openURL(url);
    } else {
      alert('Resource link not available');
    }
  };

  // NOTE: once we get the teacher checkoff functionality we must update this!
  const handleGetCheckedOff = async () => {
    try {
      alert(`Skill "${skillName}" would be marked as complete. This requires instructor verification.`);
      
      // Optional: Log to console for debugging
      console.log('Skill completion requested:', {
        skillName,
        courseName,
        studentEmail: 'test@example.com' // Would get from auth session
      });
      
    } catch (error) {
      console.error('Error marking skill as complete:', error);
      alert('Failed to update skill status');
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerTitle: skillName,
            headerBackTitle: 'Back',
          }}
        />
        <View style={generalStyles.container}>
          <AppText style={styles.loadingText}>Loading skill details...</AppText>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={generalStyles.container}>
        <View style={generalStyles.headerContainer}>
          <Pressable
          onPress={() => handleBack()}
              hitSlop={10} // this lets users tap slightly outside the icon
              accessibilityLabel="Back"
              >
              <Ionicons name="arrow-back-outline" size={40} color="#000000" />
              </Pressable>
              <AppText style={generalStyles.courseHeaderTitle}>{skillName}</AppText>
              <Ionicons name="checkmark-circle-outline" size={40} color="#2F6BFF" />
        </View>

      <ScrollView style={generalStyles.container} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusSection}>
          {isComplete ? (
            <View>
                <Ionicons name="checkmark-outline" size={20} color="#4972FF" />
                <AppText style={[
                  styles.statusText,
                  { color: "#4972FF"},
                  ]}>Complete</AppText>
          </View>
        ) : (
          <AppText style={[
                  styles.statusText,
                  { color: "#919191"},
                  ]}>Incomplete</AppText>
        )}
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Details</AppText>
          <AppText style={styles.descriptionText}>{skillData?.description}</AppText>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Requirements</AppText>
          {skillData?.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <AppText style={styles.bullet}>•</AppText>
              <AppText style={styles.requirementText}>{requirement}</AppText>
            </View>
          ))}
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Resources</AppText>
          {skillData?.resources.map((resource, index) => (
            <Pressable
              key={index}
              style={styles.resourceItem}
              onPress={() => handleResourcePress(resource.url)}
            >
              <AppText style={styles.resourceName}>{resource.name}</AppText>
              <AppText style={styles.resourceArrow}>›</AppText>
            </Pressable>
          ))}
        </View>

        {/* Completion Details */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Completion Details</AppText>
          <AppText style={styles.completionText}>
            {skillData?.completionDetails}
          </AppText>
        </View>

        {/* Action Button */}
        <Pressable 
          style={[
            styles.actionButton,
            { backgroundColor: isComplete ? '#4972FF' : '#F4F4F4' }
          ]}
          onPress={handleGetCheckedOff}
        >
          <AppText style={[
            styles.actionButtonText,
            { color: isComplete ? '#ffffff' : '#000000'}
            ]}>
            {isComplete ? 'Skill Complete' : 'Get Checked Off'}
          </AppText>
        </Pressable>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  // ... (keep all existing styles exactly as they were)

  statusSection: {
    marginBottom: 30,
    alignItems: 'center',
  },

  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },

  // courseName: {
  //   fontSize: 17,
  //   color: '#8E8E93',
  // },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },

  descriptionText: {
    fontSize: 20,
    color: '#000000',
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 17,
    color: '#000000',
    marginRight: 8,
    lineHeight: 24,
  },
  requirementText: {
    fontSize: 20,
    color: '#000000',
    lineHeight: 24,
    flex: 1,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 30,
    padding: 16,
    marginBottom: 10,
  },
  resourceName: {
    fontSize: 17,
    color: '#4972FF',
    fontWeight: '500',
  },
  resourceArrow: {
    fontSize: 20,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  completionText: {
    fontSize: 20,
    color: '#000000',
    flexDirection: "row",
    alignItems: "center"
  },
  actionButton: {
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: 250,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '600',
    // color: '#ffffff',
  },
  spacer: {
    height: 40,
  },
  loadingText: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
});