import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useChatStore } from '@/store/chatStore';
import * as Haptics from '@/utils/haptics';

import { HomeScreen } from '@/screens/home/HomeScreen';
import { DiscoverScreen } from '@/screens/discover/DiscoverScreen';
import { MatchesScreen } from '@/screens/matches/MatchesScreen';
import { MessagesScreen } from '@/screens/messages/MessagesScreen';
import { MyProfileScreen } from '@/screens/profile/MyProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const unreadCount = useChatStore((s) => s.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 90 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#7C3AED',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 12,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Discover':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Matches':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeGlow} />}
              <Ionicons name={iconName} size={23} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
      screenListeners={{
        tabPress: () => { Haptics.lightTap(); },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ tabBarLabel: 'Matches' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.secondary,
            fontSize: 9,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
            borderRadius: 9,
          },
        }}
      />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
  },
  activeDot: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
