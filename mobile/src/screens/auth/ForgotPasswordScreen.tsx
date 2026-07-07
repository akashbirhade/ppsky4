import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/ui';
import { authService } from '@/services';
import { Colors, Spacing, Typography } from '@/constants/theme';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={sent ? 'checkmark-circle-outline' : 'key-outline'} size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>{sent ? 'Check Your Email' : 'Forgot Password?'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent a password reset link to ${email}`
            : "Don't worry! Enter your email and we'll send you a reset link."
          }
        </Text>

        {!sent && (
          <>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
              style={{ width: '100%', marginTop: Spacing.xxl }}
            />
            <Button title="Send Reset Link" onPress={handleSubmit} variant="gradient" size="lg" loading={loading} fullWidth />
          </>
        )}

        {sent && (
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            size="lg"
            fullWidth
            style={{ marginTop: Spacing.xxl }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  backBtn: {
    marginTop: Spacing.md, marginLeft: Spacing.xxl,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  content: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.huge,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: { ...Typography.title2, color: Colors.textPrimary, marginBottom: Spacing.md },
  subtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
