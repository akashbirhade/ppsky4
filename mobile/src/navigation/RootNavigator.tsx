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
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import HostsScreen from '@/screens/hosts/HostsScreen';
import HostDetailScreen from '@/screens/hosts/HostDetailScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { PartnerPreferencesScreen } from '@/screens/preferences/PartnerPreferencesScreen';
import { PhotoGalleryScreen } from '@/screens/gallery/PhotoGalleryScreen';
import { ActivityScreen } from '@/screens/activity/ActivityScreen';
import { SuccessStoriesScreen } from '@/screens/stories/SuccessStoriesScreen';
import { WeddingVendorsScreen } from '@/screens/vendors/WeddingVendorsScreen';
import { PrivacySettingsScreen } from '@/screens/settings/PrivacySettingsScreen';
import { ProfileBoostScreen } from '@/screens/premium/ProfileBoostScreen';
import { ContactDirectoryScreen } from '@/screens/contacts/ContactDirectoryScreen';
import { CommunityScreen } from '@/screens/community/CommunityScreen';
import { FamilyScreen } from '@/screens/family/FamilyScreen';
import { EventsScreen } from '@/screens/events/EventsScreen';

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
  Notifications: undefined;
  Hosts: undefined;
  HostDetail: { hostId: string };
  Settings: undefined;
  EditProfile: undefined;
  PartnerPreferences: undefined;
  PhotoGallery: { photos: any[]; initialIndex?: number; userName?: string };
  Activity: undefined;
  SuccessStories: undefined;
  WeddingVendors: undefined;
  PrivacySettings: undefined;
  ProfileBoost: undefined;
  ContactDirectory: undefined;
  Community: undefined;
  Family: undefined;
  Events: undefined;
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
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Hosts" component={HostsScreen} />
          <Stack.Screen name="HostDetail" component={HostDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PartnerPreferences" component={PartnerPreferencesScreen} />
          <Stack.Screen
            name="PhotoGallery"
            component={PhotoGalleryScreen}
            options={{ animation: 'fade', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="Activity" component={ActivityScreen} />
          <Stack.Screen name="SuccessStories" component={SuccessStoriesScreen} />
          <Stack.Screen name="WeddingVendors" component={WeddingVendorsScreen} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
          <Stack.Screen
            name="ProfileBoost"
            component={ProfileBoostScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
          <Stack.Screen name="ContactDirectory" component={ContactDirectoryScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Family" component={FamilyScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
