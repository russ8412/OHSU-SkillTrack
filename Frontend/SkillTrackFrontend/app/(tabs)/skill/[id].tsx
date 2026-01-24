// app/skill/[id].tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { BASE_URL } from '../../../src/constants/api';

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
  const year = params.year as string || '1';

  const isComplete = status === 'complete';

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
        year,
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
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading skill details...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: skillData.skillName,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusSection}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isComplete ? '#E8F5E9' : '#FFF4E5' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isComplete ? '#34C759' : '#FF9500' }
            ]}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Text>
          </View>
          <Text style={styles.courseName}>{courseName} (Year {year})</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.descriptionText}>{skillData.description}</Text>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {skillData.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {skillData.resources.map((resource, index) => (
            <Pressable
              key={index}
              style={styles.resourceItem}
              onPress={() => handleResourcePress(resource.url)}
            >
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Completion Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion Details</Text>
          <Text style={styles.completionText}>
            {skillData.completionDetails}
          </Text>
        </View>

        {/* Action Button */}
        <Pressable 
          style={[
            styles.actionButton,
            { backgroundColor: isComplete ? '#34C759' : '#007AFF' }
          ]}
          onPress={handleGetCheckedOff}
        >
          <Text style={styles.actionButtonText}>
            {isComplete ? 'Skill Complete' : 'Get Checked Off'}
          </Text>
        </Pressable>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
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
  statusSection: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  courseName: {
    fontSize: 17,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 17,
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
    color: '#007AFF',
    marginRight: 8,
    lineHeight: 24,
  },
  requirementText: {
    fontSize: 17,
    color: '#000000',
    lineHeight: 24,
    flex: 1,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  resourceArrow: {
    fontSize: 20,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  completionText: {
    fontSize: 17,
    color: '#8E8E93',
    lineHeight: 24,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    fontSize: 17,
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