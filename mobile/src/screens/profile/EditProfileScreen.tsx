import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/constants/theme';

export const EditProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, padding: Spacing.xl },
  title: { ...Typography.title1, color: Colors.textPrimary },
});
