import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 64 - 16) / 3;

export const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, updateProfile, updateUser, loadUser } = useAuthStore();
  const profile = user?.profile;
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    religion: profile?.religion || '',
    caste: profile?.caste || '',
    motherTongue: profile?.motherTongue || '',
    education: profile?.education || '',
    profession: profile?.profession || '',
    annualIncome: profile?.annualIncome || '',
    city: profile?.city || '',
    state: profile?.state || '',
    height: profile?.height?.toString() || '',
    hobbies: profile?.hobbies?.join(', ') || '',
    fatherOccupation: profile?.fatherOccupation || '',
    motherOccupation: profile?.motherOccupation || '',
    siblings: profile?.siblings?.toString() || '',
    familyType: profile?.familyType || '',
    familyStatus: profile?.familyStatus || '',
    familyValues: profile?.familyValues || '',
  });

  const updateField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data: any = { ...form };
      if (data.height) data.height = parseInt(data.height) || undefined;
      if (data.siblings) data.siblings = parseInt(data.siblings) || undefined;
      if (data.hobbies) data.hobbies = data.hobbies.split(',').map((h: string) => h.trim()).filter(Boolean);
      else delete data.hobbies;
      // Remove empty strings
      Object.keys(data).forEach((k) => { if (data[k] === '') delete data[k]; });

      await updateProfile(data);
      Alert.alert('Success', 'Profile updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadPhoto = async () => {
    if (uploadingPhoto) return;

    if ((user?.photos?.length || 0) >= 10) {
      Alert.alert('Limit reached', 'You can upload a maximum of 10 photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingPhoto(true);
    try {
      // Derive a filename & mime type from the picked asset so the server
      // stores the correct extension.
      const name = asset.fileName || asset.uri.split('/').pop() || `photo-${Date.now()}.jpg`;
      const ext = (name.split('.').pop() || 'jpg').toLowerCase();
      const type = asset.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      const formData = new FormData();
      formData.append('photo', {
        uri: asset.uri,
        type,
        name,
      } as any);

      await profileService.uploadPhoto(formData);
      // Refresh the user so the newly-uploaded photo appears in the grid.
      await loadUser();
      Alert.alert('Success', 'Photo uploaded!');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Could not upload photo. Please try again.';
      Alert.alert('Upload failed', message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const photos = user?.photos || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photos */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const photo = photos[i];
            const isNextEmptySlot = !photo && i === photos.length;
            return (
              <TouchableOpacity
                key={i}
                style={styles.photoSlot}
                onPress={pickAndUploadPhoto}
                activeOpacity={0.7}
                disabled={uploadingPhoto}
              >
                {photo ? (
                  <Image source={{ uri: photo.url }} style={styles.photoImage} />
                ) : uploadingPhoto && isNextEmptySlot ? (
                  <View style={styles.photoEmpty}>
                    <ActivityIndicator color={Colors.primary} />
                  </View>
                ) : (
                  <View style={styles.photoEmpty}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                  </View>
                )}
                {photo?.isMain && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Basic Info */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Input label="First Name" value={form.firstName} onChangeText={(v) => updateField('firstName', v)} icon="person-outline" autoCapitalize="words" />
        <Input label="Last Name" value={form.lastName} onChangeText={(v) => updateField('lastName', v)} icon="person-outline" autoCapitalize="words" />
        <Input label="Height (cm)" value={form.height} onChangeText={(v) => updateField('height', v)} icon="resize-outline" keyboardType="numeric" placeholder="e.g. 170" />
        <Input label="About Me" value={form.bio} onChangeText={(v) => updateField('bio', v)} icon="document-text-outline" multiline maxLength={500} placeholder="Tell people about yourself..." />

        {/* Background */}
        <Text style={styles.sectionTitle}>Background</Text>
        <Input label="Religion" value={form.religion} onChangeText={(v) => updateField('religion', v)} icon="globe-outline" placeholder="e.g. Hindu" />
        <Input label="Caste" value={form.caste} onChangeText={(v) => updateField('caste', v)} icon="people-outline" placeholder="Optional" />
        <Input label="Mother Tongue" value={form.motherTongue} onChangeText={(v) => updateField('motherTongue', v)} icon="chatbubble-outline" placeholder="e.g. Hindi" />
        <Input label="Education" value={form.education} onChangeText={(v) => updateField('education', v)} icon="school-outline" placeholder="e.g. B.Tech" />

        {/* Career */}
        <Text style={styles.sectionTitle}>Career & Location</Text>
        <Input label="Profession" value={form.profession} onChangeText={(v) => updateField('profession', v)} icon="briefcase-outline" placeholder="e.g. Software Engineer" />
        <Input label="Annual Income" value={form.annualIncome} onChangeText={(v) => updateField('annualIncome', v)} icon="cash-outline" placeholder="e.g. 10-15 Lakhs" />
        <Input label="City" value={form.city} onChangeText={(v) => updateField('city', v)} icon="location-outline" />
        <Input label="State" value={form.state} onChangeText={(v) => updateField('state', v)} icon="map-outline" />

        {/* Family Details */}
        <Text style={styles.sectionTitle}>Family Details</Text>
        <Input label="Father's Occupation" value={form.fatherOccupation} onChangeText={(v) => updateField('fatherOccupation', v)} icon="man-outline" placeholder="e.g. Business, Retired" />
        <Input label="Mother's Occupation" value={form.motherOccupation} onChangeText={(v) => updateField('motherOccupation', v)} icon="woman-outline" placeholder="e.g. Homemaker, Teacher" />
        <Input label="No. of Siblings" value={form.siblings} onChangeText={(v) => updateField('siblings', v)} icon="people-outline" placeholder="e.g. 2" keyboardType="numeric" />
        <Input label="Family Type" value={form.familyType} onChangeText={(v) => updateField('familyType', v)} icon="home-outline" placeholder="Joint / Nuclear" />
        <Input label="Family Status" value={form.familyStatus} onChangeText={(v) => updateField('familyStatus', v)} icon="trending-up-outline" placeholder="Middle Class / Upper Middle / Rich" />
        <Input label="Family Values" value={form.familyValues} onChangeText={(v) => updateField('familyValues', v)} icon="shield-checkmark-outline" placeholder="Traditional / Moderate / Liberal" />

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <Input label="Hobbies" value={form.hobbies} onChangeText={(v) => updateField('hobbies', v)} icon="heart-outline" placeholder="Comma separated: Travel, Reading, Music" />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button title="Save Changes" onPress={handleSave} variant="gradient" size="lg" loading={loading} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  sectionTitle: {
    ...Typography.headline, color: Colors.textPrimary,
    marginTop: Spacing.xxl, marginBottom: Spacing.md,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoSlot: { width: PHOTO_SIZE, height: PHOTO_SIZE * 1.2, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoEmpty: {
    width: '100%', height: '100%', backgroundColor: Colors.background,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute', bottom: 4, left: 4, backgroundColor: Colors.primary,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  mainBadgeText: { ...Typography.caption2, color: Colors.white, fontWeight: '600' },
  saveContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    backgroundColor: Colors.white, ...Shadows.medium,
  },
});
