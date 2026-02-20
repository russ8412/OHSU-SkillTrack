// app/(tabs)/instructor/add-course.tsx
import { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../../src/constants/api';
import { useRouter } from 'expo-router';

export default function AddCourseScreen() {
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const headers: HeadersInit = token
          ? { 'Content-Type': 'application/json', 'Authorization': token }
          : { 'Content-Type': 'application/json' };
        const res = await fetch(`${BASE_URL}/GetListOfTemplates`, {
          method: 'GET',
          headers,
        });
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        // Assume data is an array of objects with ID and Name
        const parsed = Array.isArray(data)
          ? data.map((t: any) => ({
              id: t.ID?.split('#')[1] || t.ID || '',
              name: t.Name || t.ID || '',
            }))
          : [];
        setTemplates(parsed);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        Alert.alert('Error', 'Failed to load templates');
      }
    };
    fetchTemplates();
  }, []);

  const handleAddCourse = async () => {
    if (!selectedTemplate) return;
    try {
      setSubmitting(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const headers: HeadersInit = token
        ? { 'Content-Type': 'application/json', 'Authorization': token }
        : { 'Content-Type': 'application/json' };
      const res = await fetch(`${BASE_URL}/CreateCourseFromTemplate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ Template_ID: selectedTemplate }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      Alert.alert('Success', 'Course created!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ margin: 32 }} />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ marginBottom: 16 }}>Select a course template:</Text>
      <Picker
        selectedValue={selectedTemplate}
        onValueChange={setSelectedTemplate}
        style={{ marginBottom: 24 }}
      >
        <Picker.Item label="Select a template..." value={null} />
        {templates.map((t) => (
          <Picker.Item key={t.id} label={t.name} value={t.id} />
        ))}
      </Picker>
      <Button
        title={submitting ? 'Adding...' : 'Add Course'}
        onPress={handleAddCourse}
        disabled={!selectedTemplate || submitting}
      />
    </View>
  );
}
