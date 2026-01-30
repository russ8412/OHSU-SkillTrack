// app/(tabs)/instructor/student/[email]/course/[courseId].tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../../../../../src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';

interface SkillItem {
  skillName: string;
  description: string;
}

export default function StudentCourseSkills() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const studentEmail = decodeURIComponent(params.email as string);
  const firstName = params.firstName as string;
  const lastName = params.lastName as string;
  const courseId = params.courseId as string;

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourseSkills = useCallback(async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        throw new Error('No auth token');
      }

      const encodedCourseId = encodeURIComponent(courseId);
      const url = `${BASE_URL}/GetCourseInformation?Course_ID=${encodedCourseId}`;
      console.log('Fetching course info:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error('GetCourseInformation failed:', res.status, body);
        Alert.alert('Error', `Failed to load course ${courseId}: ${res.status}`);
        setSkills([]);
        setLoading(false);
        return;
      }

      const data: any = await res.json();
      // Extract skills
      const items: SkillItem[] = [];
      if (data?.Skills && typeof data.Skills === 'object') {
        Object.entries(data.Skills).forEach(([skillName, skillInfo]: [string, any]) => {
          items.push({
            skillName,
            description: skillInfo?.Description || '',
          });
        });
      }

      setSkills(items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course skills:', err);
      Alert.alert('Error', 'Failed to load course skills');
      setSkills([]);
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseSkills();
  }, [fetchCourseSkills]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    return skills.filter(s => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [skills, searchQuery]);

  const handleSkillPress = (skill: SkillItem) => {
    router.push({
      pathname: '/(tabs)/instructor/student/[email]/skill/[skillName]' as any,
      params: {
        email: encodeURIComponent(studentEmail),
        skillName: encodeURIComponent(skill.skillName),
        description: skill.description,
        courseId,
        firstName,
        lastName,
        courses: params.courses as string,
      }
    });
  };

  const renderItem = ({ item }: { item: SkillItem }) => (
    <Pressable style={generalStyles.skillCard} onPress={() => handleSkillPress(item)}>
      <View style={generalStyles.skillInfo}>
        <View style={{ flex: 1 }}>
          <AppText style={generalStyles.cardNameText}>{item.skillName}</AppText>
          <AppText style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{item.description}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#9AA0A6" />
      </View>
    </Pressable>
  );

  return (
    <View style={generalStyles.container}>
      <View style={generalStyles.headerContainer}>
        <Pressable onPress={() => router.replace('/(tabs)/instructor/student/[email]' as any, )}>
          <Ionicons name="arrow-back-outline" size={40} color="#000" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, fontWeight: '600' }}>{courseId}</AppText>
          <AppText style={{ fontSize: 12, color: '#666' }}>{`${firstName} ${lastName}`}</AppText>
        </View>
        <Ionicons name="school" size={36} color="#2F6BFF" />
      </View>

      <View style={generalStyles.searchContainer}>
        <TextInput
          style={generalStyles.searchInput}
          placeholder="Search skills"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={30} color="#9AA0A6" />
      </View>

      {loading ? (
        <View style={generalStyles.loadingContainer}><AppText style={generalStyles.loadingText}>Loading skills...</AppText></View>
      ) : filtered.length === 0 ? (
        <View style={generalStyles.emptyState}>
          <AppText style={generalStyles.emptyStateIcon}>✓</AppText>
          <AppText style={generalStyles.emptyStateTitle}>No skills found</AppText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(i) => i.skillName}
          contentContainerStyle={generalStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
