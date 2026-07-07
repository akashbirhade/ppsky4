import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from './src/store/authStore';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Soulmate Sync</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D26',
    letterSpacing: -0.5,
  },
});
