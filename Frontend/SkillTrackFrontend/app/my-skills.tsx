// app/my-skills.tsx
import { AppText } from "@/components/AppText";
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, FlatList, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import generalStyles from "./styles"

type YearRow = {
  year: number;
  complete: number;
  total: number;
};

export default function MySkillsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: replace these with real counts from data
  const years: YearRow[] = useMemo(
    () => [
      { year: 1, complete: 21, total: 44 },
      { year: 2, complete: 0, total: 36 },
      { year: 3, complete: 0, total: 45 },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return years;
    
    return years.filter((y) => `year ${y.year}`.includes(q));
  }, [searchQuery, years]);
  
  return (
    <>
      <View style={generalStyles.container}>
        {/* headerContainer: icon left, title centered */}
        <View style={generalStyles.headerContainer}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10} // this lets users tap slightly outside the icon
            accessibilityLabel="Back"
          >
            <Ionicons name="checkmark-circle-outline" size={40} color="#2F6BFF" />
          </Pressable>

          <AppText style={generalStyles.headerTitle}>My Skills</AppText>

          {/* spacer so title stays centered */}
          <View style={generalStyles.headerRightSpacer} />
        </View>

        {/* search bar */}
        <View style={generalStyles.searchContainer}>
          <TextInput
            style={generalStyles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9AA0A6"
            value={searchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={30} color="#9AA0A6" />
        </View>

        {/* year cards */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.year)}
          contentContainerStyle={generalStyles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/courses-by-year', params: { year: String(item.year) } })
              }
              style={generalStyles.yearCard}
            >
              <AppText style={generalStyles.yearText}>Year {item.year}</AppText>
              <AppText style={generalStyles.yearProgressText}>
                {item.complete}/{item.total} skills complete
              </AppText>
            </Pressable>
          )}
        />
      </View>
    </>
  );
}