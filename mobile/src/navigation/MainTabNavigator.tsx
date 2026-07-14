import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useChatStore } from '@/store/chatStore';
import * as Haptics from '@/utils/haptics';

// Animated tab icon: gentle scale-up + fading pill background on focus.
// (Replaces the old dot indicator for a cleaner, premium active state.)
const TabIcon: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}> = ({ name, color, focused }) => {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [focused, anim]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[styles.activePill, { opacity: anim, transform: [{ scale: anim }] }]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={23} color={color} />
      </Animated.View>
    </View>
  );
};

import { HomeScreen } from '@/screens/home/HomeScreen';
import { InboxScreen } from '@/screens/inbox/InboxScreen';
import { MatchesScreen } from '@/screens/matches/MatchesScreen';
import { MessagesScreen } from '@/screens/messages/MessagesScreen';
import { MyProfileScreen } from '@/screens/profile/MyProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const unreadCount = useChatStore((s) => s.unreadCount);

  return (
    <Tab.Navigator
      initialRouteName="Matches"
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
            case 'Inbox':
              iconName = focused ? 'mail' : 'mail-outline';
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

          return <TabIcon name={iconName} color={color} focused={focused} />;
        },
      })}
      screenListeners={{
        tabPress: () => { Haptics.lightTap(); },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{ tabBarLabel: 'Inbox' }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ tabBarLabel: 'Matches' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Chat',
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
    width: 46,
    height: 34,
  },
  activePill: {
    position: 'absolute',
    width: 46,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
  },
});
