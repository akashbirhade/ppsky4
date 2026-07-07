import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email or mobile number is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (message) {
        Alert.alert('Login Failed', message);
      } else if (err.message?.includes('Network') || err.code === 'ERR_NETWORK') {
        Alert.alert('Connection Error', 'Unable to reach server. Please check your internet connection.');
      } else {
        Alert.alert('Login Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Logo size={36} showText={false} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue finding your soulmate</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email or Mobile"
              placeholder="Enter email or mobile number"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="gradient"
              size="lg"
              loading={loading}
              fullWidth
            />
          </View>

          {/* Social Login */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="call-outline" size={22} color={Colors.success} />
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
  },
  backBtn: {
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.callout,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: Spacing.xxl,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xxl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    ...Typography.subhead,
    color: Colors.primary,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption1,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerLink: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  registerText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  registerBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
