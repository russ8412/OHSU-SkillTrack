import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AppText } from "@/components/AppText"
import generalStyles from '../styles';
import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../src/constants/api';
import QRCode from "react-native-qrcode-svg";

interface SkillCheckInfo {
  CheckedOff: boolean;
  CheckedOffBy: string;
  DateCheckedOff: string;
}

interface UserData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Courses?: Record<
    string,
    {
      CourseName?: string;
      Skills?: Record<string, SkillCheckInfo>;
    }
  >;
}

interface UserToken {
  Token: string;
}

export default function ProfileTab() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalSkills, setTotalSkills] = useState(0);
  const [completedSkills, setCompletedSkills] = useState(0);
  const [userToken, setUserToken] = useState<UserToken | null>(null);


  // Fetch user data from API
  const fetchUserData = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

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

      const data: UserData = await response.json();
      setUserData(data);

      // Calculate total and completed skills
      let totalCount = 0;
      let completedCount = 0;

      if (data.Courses && typeof data.Courses === 'object') {
        Object.values(data.Courses).forEach((course) => {
          const skills = course?.Skills || {};
          const skillEntries = Object.entries(skills);
          totalCount += skillEntries.length;
          completedCount += skillEntries.filter(
            ([_, statusInfo]) => statusInfo.CheckedOff
          ).length;
        });
      }

      setTotalSkills(totalCount);
      setCompletedSkills(completedCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    
    try{
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${BASE_URL}/FetchUserToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as UserToken;
      setUserToken(data);
    }catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleLogout = async () => {
    try {
      await signOut();
      // The app will automatically show the login screen
      // because Authenticator will detect the user is signed out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={generalStyles.loadingContainer}>
        <AppText style={generalStyles.loadingText}>Loading profile...</AppText>
        <Pressable style={generalStyles.refreshButton} onPress={fetchUserData}>
          <AppText style={generalStyles.refreshButtonText}>Refresh</AppText>
        </Pressable>
      </View>
    );
  }

  const displayName = userData?.FirstName && userData?.LastName 
    ? `${userData.FirstName} ${userData.LastName}`
    : userData?.FirstName || 'User';

  const displayToken = userToken?.Token;

  return (
    <ScrollView style={generalStyles.container}>
      {/* Header */}
      <View style={generalStyles.headerContainer}>
        <View />
        <AppText style={generalStyles.headerTitle}>
          Profile
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Card */}
      <View style={generalStyles.profileCard}>
        {/* Name */}
        <AppText style={generalStyles.profileNameText}>{displayName}</AppText>
         
        {/* QR Code */}
        <QRCode value={displayToken} size={150}/>
        
        {/* Email */}
        <AppText style={generalStyles.profileEmailText}>{userData?.Email}</AppText>

        {/* Divider */}
        <View style={generalStyles.profileDivider} />

        {/* Skills Progress */}
        <AppText style={generalStyles.profileProgressLabel}>Skills Progress</AppText>
        <AppText style={generalStyles.profileSkillsCountText}>
          {completedSkills} of {totalSkills} completed
        </AppText>

        {/* Progress Bar */}
        <View style={generalStyles.progressBar}>
          <View
            style={[
              generalStyles.progressFill,
              {
                width: totalSkills > 0
                  ? `${Math.round((completedSkills / totalSkills) * 100)}%`
                  : '0%',
              },
            ]}
          />
        </View>
      </View>

      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        style={generalStyles.profileLogoutButton}
      >
        <AppText style={generalStyles.logoutText}>Logout</AppText>
      </Pressable>
    </ScrollView>
  );
}
