import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '@/components/ui';
import { OptionSelector } from '@/components/ui/FilterChips';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import {
  RELIGIONS, EDUCATION_LEVELS, INCOME_RANGES,
  MARITAL_STATUS, MOTHER_TONGUE, DIET, FAMILY_TYPE, FAMILY_VALUES,
} from '@/constants';
import * as Haptics from '@/utils/haptics';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 5;

export const OnboardingScreen = () => {
  const { updateProfile, setOnboarded } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const [profile, setProfile] = useState({
    // Step 1: Basic
    religion: '',
    motherTongue: '',
    maritalStatus: '',
    // Step 2: Education & Career
    education: '',
    profession: '',
    annualIncome: '',
    // Step 3: Location & Lifestyle
    city: '',
    state: '',
    diet: '',
    // Step 4: Family
    familyType: '',
    familyValues: '',
    fatherOccupation: '',
    motherOccupation: '',
    siblings: '',
    // Step 5: About
    bio: '',
    hobbies: '',
  });

  const updateField = (key: string, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const nextStep = () => {
    Haptics.lightTap();
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      Haptics.lightTap();
      setStep(step - 1);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access to set your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const profileData: any = {};
      Object.entries(profile).forEach(([key, value]) => {
        if (value) {
          if (key === 'hobbies') {
            profileData[key] = value.split(',').map((h: string) => h.trim()).filter(Boolean);
          } else {
            profileData[key] = value;
          }
        }
      });

      if (Object.keys(profileData).length > 0) {
        await updateProfile(profileData);
      }

      // Upload photos
      for (const photoUri of photos) {
        try {
          const formData = new FormData();
          formData.append('photo', {
            uri: photoUri,
            type: 'image/jpeg',
            name: `profile_${Date.now()}.jpg`,
          } as any);
          await profileService.uploadPhoto(formData);
        } catch {}
      }

      Haptics.success();
      setOnboarded(true);
    } catch {
      setOnboarded(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Basic Info
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSub}>Basic details help us find better matches</Text>
            <OptionSelector
              label="Religion"
              options={RELIGIONS}
              selected={profile.religion}
              onSelect={(v) => updateField('religion', v)}
            />
            <OptionSelector
              label="Mother Tongue"
              options={MOTHER_TONGUE}
              selected={profile.motherTongue}
              onSelect={(v) => updateField('motherTongue', v)}
            />
            <OptionSelector
              label="Marital Status"
              options={MARITAL_STATUS}
              selected={profile.maritalStatus}
              onSelect={(v) => updateField('maritalStatus', v)}
            />
          </View>
        );
      case 1: // Education & Career
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Education & Career</Text>
            <Text style={styles.stepSub}>Your qualifications matter</Text>
            <OptionSelector
              label="Highest Education"
              options={EDUCATION_LEVELS}
              selected={profile.education}
              onSelect={(v) => updateField('education', v)}
            />
            <Input
              label="Profession"
              placeholder="e.g. Software Engineer"
              value={profile.profession}
              onChangeText={(v) => updateField('profession', v)}
              icon="briefcase-outline"
            />
            <OptionSelector
              label="Annual Income"
              options={INCOME_RANGES}
              selected={profile.annualIncome}
              onSelect={(v) => updateField('annualIncome', v)}
            />
          </View>
        );
      case 2: // Location & Lifestyle
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location & Lifestyle</Text>
            <Text style={styles.stepSub}>Where you live and how you live</Text>
            <Input
              label="City"
              placeholder="e.g. Mumbai"
              value={profile.city}
              onChangeText={(v) => updateField('city', v)}
              icon="location-outline"
            />
            <Input
              label="State"
              placeholder="e.g. Maharashtra"
              value={profile.state}
              onChangeText={(v) => updateField('state', v)}
              icon="map-outline"
            />
            <OptionSelector
              label="Diet Preference"
              options={DIET}
              selected={profile.diet}
              onSelect={(v) => updateField('diet', v)}
            />
          </View>
        );
      case 3: // Family
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Family Background</Text>
            <Text style={styles.stepSub}>Family details help in matchmaking</Text>
            <OptionSelector
              label="Family Type"
              options={FAMILY_TYPE}
              selected={profile.familyType}
              onSelect={(v) => updateField('familyType', v)}
            />
            <OptionSelector
              label="Family Values"
              options={FAMILY_VALUES}
              selected={profile.familyValues}
              onSelect={(v) => updateField('familyValues', v)}
            />
            <Input
              label="Father's Occupation"
              placeholder="e.g. Business, Retired"
              value={profile.fatherOccupation}
              onChangeText={(v) => updateField('fatherOccupation', v)}
              icon="man-outline"
            />
            <Input
              label="Mother's Occupation"
              placeholder="e.g. Homemaker, Teacher"
              value={profile.motherOccupation}
              onChangeText={(v) => updateField('motherOccupation', v)}
              icon="woman-outline"
            />
          </View>
        );
      case 4: // Photos & Bio
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Photos & About You</Text>
            <Text style={styles.stepSub}>Add photos to get 10x more matches!</Text>

            {/* Photo Upload Grid */}
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 6 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
                  <Ionicons name="add" size={28} color={Colors.primary} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <Input
              label="About Me"
              placeholder="Write a short bio about yourself..."
              value={profile.bio}
              onChangeText={(v) => updateField('bio', v)}
              icon="document-text-outline"
              multiline
              maxLength={300}
            />
            <Input
              label="Hobbies (comma separated)"
              placeholder="e.g. Reading, Traveling, Cooking"
              value={profile.hobbies}
              onChangeText={(v) => updateField('hobbies', v)}
              icon="heart-outline"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step + 1} of {TOTAL_STEPS}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
              <Text style={styles.prevText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          <Button
            title={step === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Continue'}
            onPress={nextStep}
            variant="gradient"
            size="lg"
            loading={loading}
          />
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={() => setOnboarded(true)}>
          <Text style={styles.skipText}>Skip for now →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  progressContainer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  progressText: { ...Typography.caption1, color: Colors.textTertiary, marginTop: Spacing.xs, textAlign: 'right' },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  stepContent: { paddingTop: Spacing.xxl },
  stepTitle: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xs },
  stepSub: { ...Typography.body, color: Colors.textTertiary, marginBottom: Spacing.xxl },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xxl },
  photoThumb: {
    width: (width - Spacing.xl * 2 - Spacing.md * 2) / 3, height: 120,
    borderRadius: BorderRadius.md, overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  removePhotoBtn: { position: 'absolute', top: 4, right: 4 },
  addPhotoBtn: {
    width: (width - Spacing.xl * 2 - Spacing.md * 2) / 3, height: 120,
    borderRadius: BorderRadius.md, borderWidth: 2, borderStyle: 'dashed',
    borderColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  addPhotoText: { ...Typography.caption1, color: Colors.primary, marginTop: 4 },
  actions: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, paddingTop: Spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  prevText: { ...Typography.body, color: Colors.textPrimary },
  skipBtn: { alignItems: 'center', paddingTop: Spacing.lg },
  skipText: { ...Typography.subhead, color: Colors.textTertiary, fontWeight: '500' },
});
