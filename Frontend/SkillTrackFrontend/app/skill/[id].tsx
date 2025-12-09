// app/skill/[id].tsx
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

export default function SkillDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse skill data from params
  const skillName = decodeURIComponent(params.id as string);
  const status = params.status as string || 'incomplete';
  const courseName = decodeURIComponent(params.courseName as string) || 'Unknown Course';

  const isComplete = status === 'complete';

  // Mock data - in real app, fetch from API
  const skillData = {
    description: 'Show ability to administer medications via IV and calculate the amount properly.',
    requirements: [
      'Student properly calculates amount and administers medication via IV',
      'Demonstrates proper IV setup and maintenance',
      'Follows aseptic technique throughout procedure',
      'Correctly documents medication administration'
    ],
    resources: [
      { name: 'iv_medication_guide.pdf', url: '#' },
      { name: 'IV Administration Handbook', url: '#' },
      { name: 'Medication Calculation Worksheet', url: '#' }
    ]
  };

  const handleResourcePress = (url: string) => {
    // In a real app, this would open the PDF or link
    alert('Resource would open here');
  };

  const handleGetCheckedOff = () => {
    // In a real app, this would mark the skill as complete or request instructor approval
    alert('Instructor check-off requested');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: skillName,
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
          <Text style={styles.courseName}>{courseName}</Text>
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
            {isComplete 
              ? 'This skill has been marked as complete by an instructor.'
              : 'This skill has not been marked as complete by an instructor.'}
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
});