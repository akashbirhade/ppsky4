import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';
import { ProfileDetailScreen } from '@/screens/profile/ProfileDetailScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { VideoCallScreen } from '@/screens/call/VideoCallScreen';
import { PremiumScreen } from '@/screens/premium/PremiumScreen';
import { KundaliScreen } from '@/screens/features/KundaliScreen';
import { AIChatbotScreen } from '@/screens/features/AIChatbotScreen';
import VerificationScreen from '@/screens/features/VerificationScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  ProfileDetail: { userId: string };
  Chat: { conversationId: string; userId: string; name: string };
  VideoCall: { callId: string; receiverId: string; type: 'AUDIO' | 'VIDEO' };
  Premium: undefined;
  Kundali: { userId?: string };
  AICoach: undefined;
  Verification: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="ProfileDetail"
            component={ProfileDetailScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{ animation: 'fade', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
          <Stack.Screen name="Kundali" component={KundaliScreen} />
          <Stack.Screen name="AICoach" component={AIChatbotScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
