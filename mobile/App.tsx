import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from './src/store/authStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastHost } from './src/components/Toast';

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
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💕</Text>
          </View>
          <Text style={styles.loadingText}>Soulmate Sync</Text>
          <Text style={styles.loadingSub}>Finding your perfect match...</Text>
          <ActivityIndicator size="small" color="#7C3AED" style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
          <ToastHost />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1D26',
    letterSpacing: -0.5,
  },
  loadingSub: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
