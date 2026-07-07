import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { RELIGIONS, EDUCATION_LEVELS } from '@/constants';

const { width } = Dimensions.get('window');

const steps = [
  { title: 'Basic Info', subtitle: 'Tell us about yourself' },
  { title: 'Background', subtitle: 'Your cultural & educational background' },
  { title: 'Lifestyle', subtitle: 'Help us find your perfect match' },
  { title: 'Photos', subtitle: 'Add your best photos' },
];

export const OnboardingScreen = () => {
  const { updateProfile, setOnboarded } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    height: '',
    bio: '',
    religion: '',
    caste: '',
    motherTongue: '',
    education: '',
    profession: '',
    annualIncome: '',
    city: '',
    state: '',
    hobbies: '',
  });

  const updateField = (key: string, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateProfile(profile);
      setOnboarded(true);
    } catch {
      setOnboarded(true); // Allow skip
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={Colors.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.stepText}>{step + 1}/{steps.length}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Step 0: Basic */}
        {step === 0 && (
          <>
            <Input label="First Name" placeholder="Your first name" value={profile.firstName} onChangeText={(v) => updateField('firstName', v)} icon="person-outline" autoCapitalize="words" />
            <Input label="Last Name" placeholder="Your last name" value={profile.lastName} onChangeText={(v) => updateField('lastName', v)} icon="person-outline" autoCapitalize="words" />
            <Input label="Date of Birth" placeholder="DD/MM/YYYY" value={profile.dateOfBirth} onChangeText={(v) => updateField('dateOfBirth', v)} icon="calendar-outline" />
            <Input label="Height (cm)" placeholder="e.g. 170" value={profile.height} onChangeText={(v) => updateField('height', v)} keyboardType="numeric" icon="resize-outline" />
            <Input label="About Me" placeholder="Write a short bio..." value={profile.bio} onChangeText={(v) => updateField('bio', v)} multiline maxLength={500} icon="document-text-outline" />
          </>
        )}

        {/* Step 1: Background */}
        {step === 1 && (
          <>
            <Input label="Religion" placeholder="Select religion" value={profile.religion} onChangeText={(v) => updateField('religion', v)} icon="globe-outline" />
            <Input label="Caste" placeholder="Your caste (optional)" value={profile.caste} onChangeText={(v) => updateField('caste', v)} icon="people-outline" />
            <Input label="Mother Tongue" placeholder="e.g. Hindi, Marathi" value={profile.motherTongue} onChangeText={(v) => updateField('motherTongue', v)} icon="chatbubble-outline" />
            <Input label="Education" placeholder="Highest qualification" value={profile.education} onChangeText={(v) => updateField('education', v)} icon="school-outline" />
          </>
        )}

        {/* Step 2: Lifestyle */}
        {step === 2 && (
          <>
            <Input label="Profession" placeholder="e.g. Software Engineer" value={profile.profession} onChangeText={(v) => updateField('profession', v)} icon="briefcase-outline" />
            <Input label="Annual Income" placeholder="e.g. 10-15 Lakhs" value={profile.annualIncome} onChangeText={(v) => updateField('annualIncome', v)} icon="cash-outline" />
            <Input label="City" placeholder="Where do you live?" value={profile.city} onChangeText={(v) => updateField('city', v)} icon="location-outline" />
            <Input label="State" placeholder="Your state" value={profile.state} onChangeText={(v) => updateField('state', v)} icon="map-outline" />
            <Input label="Hobbies" placeholder="e.g. Travel, Reading, Music" value={profile.hobbies} onChangeText={(v) => updateField('hobbies', v)} icon="heart-outline" />
          </>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <View style={styles.photoSection}>
            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} style={styles.photoSlot}>
                  <Ionicons name="camera-outline" size={24} color={Colors.textTertiary} />
                  <Text style={styles.photoText}>{i === 0 ? 'Main Photo' : `Photo ${i + 1}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.photoHint}>
              Upload at least 1 photo. Clear face photos get 3x more responses!
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        {step > 0 && (
          <Button title="Back" onPress={() => setStep(step - 1)} variant="outline" size="md" style={{ flex: 0.4 }} />
        )}
        <Button
          title={step === steps.length - 1 ? 'Complete' : 'Continue'}
          onPress={handleNext}
          variant="gradient"
          size="lg"
          loading={loading}
          style={{ flex: 1 }}
        />
      </View>

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={() => setOnboarded(true)}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, gap: Spacing.md,
  },
  progressBg: {
    flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.background, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  stepText: { ...Typography.caption1, color: Colors.textSecondary, fontWeight: '600' },
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg },
  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.callout, color: Colors.textSecondary },
  form: { flex: 1, paddingHorizontal: Spacing.xxl },
  photoSection: { alignItems: 'center' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  photoSlot: {
    width: (width - 80) / 3, height: (width - 80) / 3,
    borderRadius: BorderRadius.lg, borderWidth: 2, borderStyle: 'dashed',
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  photoText: { ...Typography.caption2, color: Colors.textTertiary, marginTop: 4 },
  photoHint: { ...Typography.footnote, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg },
  actions: {
    flexDirection: 'row', gap: Spacing.md,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  skipBtn: { alignItems: 'center', paddingBottom: Spacing.lg },
  skipText: { ...Typography.subhead, color: Colors.textTertiary },
});
