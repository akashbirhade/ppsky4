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
import { Button } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

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
    try {
      const { data } = await matchService.likeProfile(userId);
      if (data.data?.isMatch) {
        Alert.alert('It\'s a Match! 🎉', 'You both liked each other!');
      } else {
        Alert.alert('Liked! ❤️', 'Interest sent successfully');
      }
    } catch {}
  };

  const handleChat = async () => {
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
              <TouchableOpacity style={styles.topActionBtn}>
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
              {profile.age} yrs • {profile.city}, {profile.state}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionCircle} onPress={() => handleCall('AUDIO')}>
              <Ionicons name="call" size={22} color={Colors.success} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCircle, styles.likeCircle]} onPress={handleLike}>
              <Ionicons name="heart" size={26} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCircle} onPress={handleChat}>
              <Ionicons name="chatbubble" size={22} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCircle} onPress={() => handleCall('VIDEO')}>
              <Ionicons name="videocam" size={22} color={Colors.info} />
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
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

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
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
  actionRow: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  actionCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    ...Shadows.small,
  },
  likeCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, ...Shadows.glow },
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
});
