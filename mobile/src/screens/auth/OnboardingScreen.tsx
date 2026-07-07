import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const { updateProfile, setOnboarded } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    religion: '',
    city: '',
    profession: '',
    bio: '',
  });

  const updateField = (key: string, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
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
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const profileData: any = {};
      if (profile.religion) profileData.religion = profile.religion;
      if (profile.city) profileData.city = profile.city;
      if (profile.profession) profileData.profession = profile.profession;
      if (profile.bio) profileData.bio = profile.bio;

      if (Object.keys(profileData).length > 0) {
        await updateProfile(profileData);
      }

      if (photo) {
        try {
          const formData = new FormData();
          formData.append('photo', {
            uri: photo,
            type: 'image/jpeg',
            name: 'profile.jpg',
          } as any);
          await profileService.uploadPhoto(formData);
        } catch {}
      }

      setOnboarded(true);
    } catch {
      setOnboarded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Quick Profile Setup</Text>
          <Text style={styles.subtitle}>
            Takes less than 2 minutes. You can always edit later.
          </Text>
        </View>

        <TouchableOpacity style={styles.photoContainer} onPress={pickPhoto} activeOpacity={0.7}>
          {photo ? (
            <View style={styles.photoPreview}>
              <Ionicons name="checkmark-circle" size={44} color={Colors.primary} />
              <Text style={styles.photoSelectedText}>Photo Selected ✓</Text>
            </View>
          ) : (
            <LinearGradient colors={['#faf5ff', '#f0f9ff']} style={styles.photoUpload}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.photoTitle}>Add a Profile Photo</Text>
              <Text style={styles.photoHint}>Profiles with photos get 10x more matches</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Input label="Religion" placeholder="e.g. Hindu, Muslim, Christian" value={profile.religion} onChangeText={(v) => updateField('religion', v)} icon="globe-outline" />
          <Input label="City" placeholder="Where do you live?" value={profile.city} onChangeText={(v) => updateField('city', v)} icon="location-outline" />
          <Input label="Profession" placeholder="e.g. Software Engineer" value={profile.profession} onChangeText={(v) => updateField('profession', v)} icon="briefcase-outline" />
          <Input label="About Me (optional)" placeholder="A few words about yourself..." value={profile.bio} onChangeText={(v) => updateField('bio', v)} icon="document-text-outline" multiline maxLength={200} />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Start Finding Matches" onPress={handleComplete} variant="gradient" size="lg" loading={loading} fullWidth />
        <TouchableOpacity style={styles.skipBtn} onPress={() => setOnboarded(true)}>
          <Text style={styles.skipText}>Skip for now →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 20 },
  header: { alignItems: 'center', paddingTop: Spacing.xxxl, paddingBottom: Spacing.xxl },
  emoji: { fontSize: 48, marginBottom: Spacing.md },
  title: { ...Typography.title1, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  photoContainer: { marginBottom: Spacing.xxl },
  photoUpload: {
    alignItems: 'center', paddingVertical: Spacing.xxl, borderRadius: BorderRadius.xl,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primaryLight,
  },
  cameraCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  photoTitle: { ...Typography.bodyBold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  photoHint: { ...Typography.caption1, color: Colors.textSecondary },
  photoPreview: {
    alignItems: 'center', paddingVertical: Spacing.xxl, borderRadius: BorderRadius.xl, backgroundColor: Colors.primarySoft,
  },
  photoSelectedText: { ...Typography.bodyBold, color: Colors.primary, marginTop: Spacing.sm },
  form: { marginBottom: Spacing.lg },
  actions: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  skipBtn: { alignItems: 'center', paddingTop: Spacing.lg },
  skipText: { ...Typography.subhead, color: Colors.textTertiary, fontWeight: '500' },
});
