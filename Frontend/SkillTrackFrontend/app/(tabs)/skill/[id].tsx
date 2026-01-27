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

// Mock data for skill details
const mockSkillDetails: Record<string, SkillDetailData> = {
  'Handwashing - Infection Prevention': {
    skillName: 'Handwashing - Infection Prevention',
    description: 'Demonstrate proper handwashing technique for infection prevention and control in healthcare settings.',
    requirements: [
      'Wet hands with clean, running water',
      'Apply soap and lather all surfaces of hands',
      'Scrub for at least 20 seconds',
      'Rinse thoroughly under running water',
      'Dry hands using a clean towel or air dryer'
    ],
    resources: [
      { name: 'CDC Hand Hygiene Guidelines', url: 'https://www.cdc.gov/handhygiene/index.html' },
      { name: 'WHO Hand Hygiene Techniques', url: 'https://www.who.int/gpsc/5may/Hand_Hygiene_Why_How_and_When_Brochure.pdf' }
    ],
    completionDetails: 'Skill completion requires demonstration of proper technique and answering knowledge questions.'
  },
  'PPE - Infection Prevention': {
    skillName: 'PPE - Infection Prevention',
    description: 'Properly don (put on) and doff (remove) personal protective equipment (PPE) to prevent infection transmission.',
    requirements: [
      'Identify appropriate PPE for different clinical situations',
      'Correctly sequence donning of gown, mask, goggles, gloves',
      'Safely remove contaminated PPE without self-contamination',
      'Dispose of PPE properly in designated containers'
    ],
    resources: [
      { name: 'PPE Donning and Doffing Guide', url: 'https://www.cdc.gov/hai/pdfs/ppe/ppe-sequence.pdf' },
      { name: 'Infection Control Guidelines', url: 'https://www.cdc.gov/infectioncontrol/guidelines/index.html' }
    ],
    completionDetails: 'Must demonstrate proper technique for both donning and doffing procedures.'
  },
  'Vital Signs / Oximetry': {
    skillName: 'Vital Signs / Oximetry',
    description: 'Accurately measure and document vital signs including temperature, pulse, respiration, blood pressure, and oxygen saturation.',
    requirements: [
      'Correctly use thermometer, stethoscope, blood pressure cuff, and pulse oximeter',
      'Obtain accurate readings on simulated patients',
      'Recognize normal vs. abnormal vital sign ranges',
      'Properly document findings in appropriate format'
    ],
    resources: [
      { name: 'Vital Signs Measurement Guide', url: '#' },
      { name: 'Pulse Oximetry Training Module', url: '#' }
    ],
    completionDetails: 'Accuracy within acceptable ranges must be demonstrated on multiple attempts.'
  },
  // Add more mock data as needed
};

export default function SkillDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Parse skill data from params
  const skillName = decodeURIComponent(params.id as string);
  const status = params.status as string || 'incomplete';
  const courseName = decodeURIComponent(params.courseName as string) || 'Unknown Course';

  const isComplete = status === 'complete';

  const handleBack = () => {
    if (courseName) {
      router.replace({ pathname: "/course/[id]", params: { id: courseName }});
    } else {
      router.back(); // hopefully the top works so this doesnt take us to the profile page
      console.log("Error going back to course ", {courseName} )
    }
  }

  // Get skill details from mock data
  const skillData = mockSkillDetails[skillName] || {
    skillName,
    description: 'Detailed description for this skill will be available soon.',
    requirements: [
      'Demonstrate competency in skill performance',
      'Follow established protocols and procedures',
      'Document completion appropriately'
    ],
    resources: [
      { name: 'Course Textbook', url: '#' },
      { name: 'Skill Checklist', url: '#' }
    ],
    completionDetails: isComplete 
      ? 'This skill has been marked as complete by an instructor.' 
      : 'This skill requires instructor verification for completion.'
  };

  // Optional: Verify skill status with API (but /hello doesn't have individual skill status)
  useEffect(() => {
    const verifySkillStatus = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        // Get all data to verify skill status
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

        const data = await response.json();
        console.log('Data received for verification:', data);
        // Note: We could parse to verify, but for now we trust the params
        setLoading(false);
        
      } catch (error) {
        console.error('Error verifying skill status:', error);
        setLoading(false);
      }
    };

    verifySkillStatus();
  }, [skillName, courseName]);

  const handleResourcePress = (url: string) => {
    if (url && url !== '#' && url.startsWith('http')) {
      Linking.openURL(url);
    } else {
      alert('Resource link not available');
    }
  };

  const handleGetCheckedOff = async () => {
    try {
      // Since we don't have an endpoint to update skill status, we'll just show an alert
      // In a real app, you would call an API endpoint here
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
              <AppText style={generalStyles.courseHeaderTitle}>{courseName}</AppText>
              <Ionicons name="checkmark-circle-outline" size={40} color="#2F6BFF" />
        </View>

      <ScrollView style={generalStyles.container} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusSection}>
          {isComplete ? (
            <View>
                <Ionicons name="checkmark-outline" size={20} color="#4972FF" />
                <AppText style={styles.statusText}>Complete</AppText>
          </View>
        ) : (
          <AppText style={styles.statusText}>Incomplete</AppText>
        )}
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Details</AppText>
          <AppText style={styles.descriptionText}>{skillData.description}</AppText>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Requirements</AppText>
          {skillData.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <AppText style={styles.bullet}>•</AppText>
              <AppText style={styles.requirementText}>{requirement}</AppText>
            </View>
          ))}
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Resources</AppText>
          {skillData.resources.map((resource, index) => (
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
            {skillData.completionDetails}
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
          <AppText style={styles.actionButtonText}>
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
    color: '#4972FF'
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
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
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