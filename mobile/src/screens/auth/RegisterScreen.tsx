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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

// Oldest allowed = 80 years ago, youngest allowed = exactly 18 years ago today.
const today = new Date();
const MAX_DOB = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
const MIN_DOB = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());

const formatDob = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDobLabel = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { register } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDate, setDobDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    mobileNumber: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // On Android the picker is a dialog — close it after any interaction.
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed' || !selected) return;
    setDobDate(selected);
    updateField('dateOfBirth', formatDob(selected));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2) newErrors.firstName = 'Minimum 2 characters';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.trim().length < 2) newErrors.lastName = 'Minimum 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Enter valid 10-digit Indian mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password))
      newErrors.password = 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords don\'t match';
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
      else if (age > 80) newErrors.dateOfBirth = 'Please enter a valid date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
      });
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (message) {
        Alert.alert('Registration Failed', message);
      } else if (err.message?.includes('Network') || err.code === 'ERR_NETWORK') {
        Alert.alert('Connection Error', 'Unable to reach server. Please check your internet connection.');
      } else {
        Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>
              {step === 1 ? 'Create Account' : 'Almost There!'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Start your journey to find your perfect match'
                : 'Set up your credentials and gender'}
            </Text>
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={styles.form}>
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                icon="person-outline"
                autoCapitalize="words"
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                icon="person-outline"
                autoCapitalize="words"
                error={errors.lastName}
              />
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                icon="mail-outline"
                error={errors.email}
              />
              <Input
                label="Mobile Number"
                placeholder="9876543210"
                value={formData.mobileNumber}
                onChangeText={(v) => updateField('mobileNumber', v)}
                keyboardType="phone-pad"
                icon="call-outline"
                error={errors.mobileNumber}
              />
              <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" fullWidth />
            </View>
          )}

          {/* Step 2: Password, DOB & Gender */}
          {step === 2 && (
            <View style={styles.form}>
              <Input
                label="Password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.password}
              />
              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChangeText={(v) => updateField('confirmPassword', v)}
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />

              {/* Date of Birth — calendar picker (must be 18+) */}
              <Text style={styles.dobLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.dobField, errors.dateOfBirth && styles.dobFieldError]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.textTertiary} />
                <Text style={[styles.dobValue, !dobDate && styles.dobPlaceholder]}>
                  {dobDate ? formatDobLabel(dobDate) : 'Select your date of birth'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
              {errors.dateOfBirth
                ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                : <Text style={styles.dobHint}>You must be at least 18 years old</Text>}

              {showDatePicker && (
                <DateTimePicker
                  value={dobDate || MAX_DOB}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  maximumDate={MAX_DOB}
                  minimumDate={MIN_DOB}
                  onChange={handleDateChange}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <Button title="Done" onPress={() => setShowDatePicker(false)} variant="outline" size="md" fullWidth />
              )}

              {/* Gender Selection */}
              <Text style={styles.genderLabel}>I am a</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, formData.gender === 'MALE' && styles.genderBtnActive]}
                  onPress={() => updateField('gender', 'MALE')}
                >
                  <Ionicons name="male" size={28} color={formData.gender === 'MALE' ? Colors.white : Colors.secondary} />
                  <Text style={[styles.genderText, formData.gender === 'MALE' && styles.genderTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, formData.gender === 'FEMALE' && styles.genderBtnActive]}
                  onPress={() => updateField('gender', 'FEMALE')}
                >
                  <Ionicons name="female" size={28} color={formData.gender === 'FEMALE' ? Colors.white : Colors.primary} />
                  <Text style={[styles.genderText, formData.gender === 'FEMALE' && styles.genderTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

              <View style={{ height: Spacing.xxl }} />
              <Button title="Create Account" onPress={handleRegister} variant="gradient" size="lg" loading={loading} fullWidth />
            </View>
          )}

          {/* Terms */}
          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xxl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40,
  },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    width: 40, height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  headerSection: { marginTop: Spacing.xxxl, marginBottom: Spacing.xxl },
  title: { ...Typography.largeTitle, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.callout, color: Colors.textSecondary },
  form: { marginBottom: Spacing.xxl },
  dobLabel: {
    ...Typography.subhead, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  dobField: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.borderDark,
    backgroundColor: Colors.white,
  },
  dobFieldError: { borderColor: Colors.error },
  dobValue: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  dobPlaceholder: { color: Colors.textTertiary },
  dobHint: { ...Typography.caption1, color: Colors.textTertiary, marginTop: Spacing.xs },
  genderLabel: {
    ...Typography.subhead, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.lg,
  },
  genderRow: { flexDirection: 'row', gap: Spacing.lg },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.lg, borderRadius: 16, borderWidth: 2,
    borderColor: Colors.border, gap: Spacing.sm,
  },
  genderBtnActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  genderText: { ...Typography.bodyBold, color: Colors.textPrimary },
  genderTextActive: { color: Colors.white },
  errorText: { ...Typography.caption1, color: Colors.error, marginTop: Spacing.xs },
  terms: {
    ...Typography.caption1, color: Colors.textTertiary,
    textAlign: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl,
  },
  termsLink: { color: Colors.primary, fontWeight: '500' },
});
