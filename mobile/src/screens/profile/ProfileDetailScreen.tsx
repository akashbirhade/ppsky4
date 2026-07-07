import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { profileService, chatService, matchService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';
import { ActionSheetIOS, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ProfileDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data } = await profileService.getProfileById(userId);
      setProfile(data.data);
    } catch {
      Alert.alert('Error', 'Could not load profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    Haptics.heavyTap();
    try {
      const { data } = await matchService.likeProfile(userId);
      if (data.data?.isMatch) {
        Haptics.success();
        Alert.alert('It\'s a Match! 🎉', 'You both liked each other!');
      } else {
        Alert.alert('Liked! ❤️', 'Interest sent successfully');
      }
    } catch {}
  };

  const handleChat = async () => {
    Haptics.mediumTap();
    try {
      const { data } = await chatService.getOrCreateConversation(userId);
      navigation.navigate('Chat', {
        conversationId: data.data.id,
        userId,
        name: `${profile.firstName} ${profile.lastName || ''}`,
      });
    } catch {}
  };

  const handleCall = (type: 'AUDIO' | 'VIDEO') => {
    navigation.navigate('VideoCall', { receiverId: userId, type, callId: '' });
  };

  const showMoreOptions = () => {
    const options = ['Block User', 'Report User', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex },
        (index) => handleOptionSelect(index),
      );
    } else {
      Alert.alert('Options', '', [
        { text: 'Block User', style: 'destructive', onPress: () => handleOptionSelect(0) },
        { text: 'Report User', onPress: () => handleOptionSelect(1) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (index === 0) {
      Alert.alert(
        'Block User',
        'They won\'t be able to see your profile or message you. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block', style: 'destructive',
            onPress: async () => {
              try {
                await matchService.blockUser(userId);
                Haptics.warning();
                Alert.alert('Blocked', 'This user has been blocked.');
                navigation.goBack();
              } catch {}
            },
          },
        ],
      );
    } else if (index === 1) {
      Alert.alert(
        'Report User',
        'Why are you reporting this profile?',
        [
          { text: 'Fake Profile', onPress: () => submitReport('fake_profile') },
          { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
          { text: 'Harassment', onPress: () => submitReport('harassment') },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const submitReport = async (reason: string) => {
    try {
      await matchService.reportUser(userId, reason);
      Haptics.success();
      Alert.alert('Reported', 'Thank you for helping keep our community safe.');
    } catch {}
  };

  if (loading || !profile) {
    return <View style={styles.container} />;
  }

  const photos = profile.user?.photos || [];
  const currentPhoto = photos[currentPhotoIndex]?.url || 'https://via.placeholder.com/400';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Photo Gallery */}
        <View style={styles.photoSection}>
          <Image source={{ uri: currentPhoto }} style={styles.mainPhoto} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)']}
            style={styles.photoOverlay}
          />

          {/* Photo Indicators */}
          <View style={styles.photoIndicators}>
            {photos.map((_: any, i: number) => (
              <View key={i} style={[styles.indicator, i === currentPhotoIndex && styles.indicatorActive]} />
            ))}
          </View>

          {/* Left/Right tap zones */}
          <TouchableOpacity
            style={styles.tapLeft}
            onPress={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
          />
          <TouchableOpacity
            style={styles.tapRight}
            onPress={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
          />

          {/* Back button */}
          <SafeAreaView style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.topActionBtn}>
                <Ionicons name="share-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topActionBtn} onPress={showMoreOptions}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Profile Content */}
        <View style={styles.content}>
          {/* Name & Basic */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {profile.firstName} {profile.lastName || ''}
              </Text>
              {profile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={Colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.ageLocation}>
              {profile.age} yrs • {profile.height ? `${profile.height} cm` : ''} • {profile.city}, {profile.state}
            </Text>
            {profile.profession && (
              <Text style={styles.professionText}>{profile.profession}</Text>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About {profile.firstName}</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              {[
                { icon: 'school-outline', label: 'Education', value: profile.education },
                { icon: 'briefcase-outline', label: 'Profession', value: profile.profession },
                { icon: 'cash-outline', label: 'Income', value: profile.annualIncome },
                { icon: 'resize-outline', label: 'Height', value: profile.height ? `${profile.height} cm` : null },
                { icon: 'globe-outline', label: 'Religion', value: profile.religion },
                { icon: 'people-outline', label: 'Caste', value: profile.caste },
                { icon: 'chatbubble-outline', label: 'Mother Tongue', value: profile.motherTongue },
                { icon: 'heart-outline', label: 'Marital Status', value: profile.maritalStatus },
              ].filter(d => d.value).map((detail, i) => (
                <View key={i} style={styles.detailItem}>
                  <Ionicons name={detail.icon as any} size={18} color={Colors.primary} />
                  <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                    <Text style={styles.detailValue}>{detail.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Hobbies */}
          {profile.hobbies?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.hobbyRow}>
                {(Array.isArray(profile.hobbies) ? profile.hobbies : [profile.hobbies]).map((hobby: string, i: number) => (
                  <View key={i} style={styles.hobbyChip}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Kundali Match */}
          <TouchableOpacity
            style={styles.kundaliCard}
            onPress={() => navigation.navigate('Kundali', { userId })}
          >
            <LinearGradient
              colors={Colors.gradientPurple as any}
              style={styles.kundaliGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="planet" size={24} color={Colors.white} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.kundaliTitle}>Kundali Compatibility</Text>
                <Text style={styles.kundaliSub}>Check 36-point Guna Milan</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomAction} onPress={handleLike}>
          <View style={[styles.bottomIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="heart" size={22} color="#1B5E20" />
          </View>
          <Text style={styles.bottomActionLabel}>Super Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomAction} onPress={() => handleCall('AUDIO')}>
          <View style={[styles.bottomIconCircle, { backgroundColor: '#E0F2F1' }]}>
            <Ionicons name="call" size={22} color="#00695C" />
          </View>
          <Text style={styles.bottomActionLabel}>View Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomAction} onPress={handleChat}>
          <View style={[styles.bottomIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
          </View>
          <Text style={styles.bottomActionLabel}>Connect Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  photoSection: { width, height: height * 0.55, position: 'relative' },
  mainPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: { ...StyleSheet.absoluteFillObject },
  photoIndicators: {
    position: 'absolute', top: 60, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  indicator: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 2, maxWidth: 60,
  },
  indicatorActive: { backgroundColor: Colors.white },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  topActions: { flexDirection: 'row', gap: Spacing.sm },
  topActionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    marginTop: -24, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    backgroundColor: Colors.white, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl,
  },
  nameSection: { marginBottom: Spacing.xl },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { ...Typography.title1, color: Colors.textPrimary },
  verifiedBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.info, alignItems: 'center', justifyContent: 'center',
  },
  ageLocation: { ...Typography.callout, color: Colors.textSecondary, marginTop: 4 },
  professionText: { ...Typography.subhead, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.md },
  bioText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },
  detailsGrid: { gap: Spacing.md },
  detailItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  detailLabel: { ...Typography.caption1, color: Colors.textTertiary },
  detailValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '500' },
  hobbyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hobbyChip: {
    backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  hobbyText: { ...Typography.footnote, color: Colors.primary, fontWeight: '500' },
  kundaliCard: { marginBottom: Spacing.xl },
  kundaliGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadius.xl,
  },
  kundaliTitle: { ...Typography.bodyBold, color: Colors.white },
  kundaliSub: { ...Typography.caption1, color: 'rgba(255,255,255,0.8)' },
  // Bottom Action Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: Colors.white, paddingTop: 12, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  bottomAction: { alignItems: 'center', gap: 6 },
  bottomIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  bottomActionLabel: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '600' },
});
