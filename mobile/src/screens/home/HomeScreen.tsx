import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useMatchStore } from '@/store/matchStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { newProfiles, recommendedProfiles, loadNewProfiles, loadRecommended } = useMatchStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNewProfiles();
    loadRecommended();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNewProfiles(), loadRecommended()]);
    setRefreshing(false);
  };

  const firstName = user?.profile?.firstName || user?.username || 'User';
  const mainPhoto = user?.photos?.find((p) => p.isMain)?.url;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Find your perfect match today</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar uri={mainPhoto} name={firstName} size={42} showBorder />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Completion Card */}
        {(user?.profile?.profileCompletionPercentage || 0) < 80 && (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <LinearGradient
              colors={Colors.gradientSunset as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completionCard}
            >
              <View style={styles.completionContent}>
                <Ionicons name="sparkles" size={24} color={Colors.white} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.completionTitle}>Complete Your Profile</Text>
                  <Text style={styles.completionSub}>
                    {user?.profile?.profileCompletionPercentage || 0}% complete • Get 5x more views
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </View>
              <View style={styles.completionBar}>
                <View style={[styles.completionFill, { width: `${user?.profile?.profileCompletionPercentage || 0}%` }]} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'heart', label: 'Likes', color: Colors.love, screen: 'Matches' },
            { icon: 'diamond', label: 'Premium', color: Colors.gold, screen: 'Premium' },
            { icon: 'planet', label: 'Kundali', color: Colors.primary, screen: 'Kundali' },
            { icon: 'sparkles', label: 'AI Coach', color: '#EC4899', screen: 'AICoach' },
            { icon: 'shield-checkmark', label: 'Verify', color: Colors.success, screen: 'Verification' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} onPress={() => navigation.navigate(item.screen)}>
              <View style={[styles.quickActionIcon, { backgroundColor: item.color + '12' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature Row */}
        <View style={styles.quickActions}>
          {[
            { icon: 'eye', label: 'Activity', color: Colors.info, screen: 'Activity' },
            { icon: 'rocket', label: 'Boost', color: Colors.secondary, screen: 'ProfileBoost' },
            { icon: 'options', label: 'Preferences', color: Colors.accent, screen: 'PartnerPreferences' },
            { icon: 'heart-circle', label: 'Stories', color: Colors.love, screen: 'SuccessStories' },
            { icon: 'gift', label: 'Vendors', color: Colors.gold, screen: 'WeddingVendors' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} onPress={() => navigation.navigate(item.screen)}>
              <View style={[styles.quickActionIcon, { backgroundColor: item.color + '12' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feature Row 3 */}
        <View style={styles.quickActions}>
          {[
            { icon: 'people-circle', label: 'Community', color: Colors.primary, screen: 'Community' },
            { icon: 'calendar', label: 'Events', color: Colors.gold, screen: 'Events' },
            { icon: 'home', label: 'Family', color: Colors.secondary, screen: 'Family' },
            { icon: 'call', label: 'Contacts', color: Colors.success, screen: 'ContactDirectory' },
            { icon: 'people', label: 'Hosts', color: Colors.accent, screen: 'Hosts' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} onPress={() => navigation.navigate(item.screen)}>
              <View style={[styles.quickActionIcon, { backgroundColor: item.color + '12' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Community Hosts Banner */}
        <TouchableOpacity
          style={styles.hostBanner}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Hosts')}
        >
          <View style={styles.hostBannerLeft}>
            <View style={styles.hostBannerIcon}>
              <Ionicons name="people" size={22} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.hostBannerTitle}>Community Hosts</Text>
              <Text style={styles.hostBannerSub}>Browse local matchmakers & events</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* New Profiles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Profiles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: Spacing.xl }}>
            {newProfiles.slice(0, 8).map((profile, i) => (
              <TouchableOpacity
                key={profile.id || i}
                style={styles.profileMini}
                onPress={() => navigation.navigate('ProfileDetail', { userId: profile.user.id })}
              >
                <Image
                  source={{ uri: profile.user.photos[0]?.url || 'https://via.placeholder.com/150' }}
                  style={styles.profileMiniImage}
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.profileMiniGradient} />
                <View style={styles.profileMiniInfo}>
                  <Text style={styles.profileMiniName}>{profile.firstName}, {profile.age}</Text>
                  <Text style={styles.profileMiniCity}>{profile.city}</Text>
                </View>
                {profile.isVerified && (
                  <View style={styles.miniVerified}>
                    <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: Spacing.xl }}>
            {recommendedProfiles.slice(0, 6).map((profile, i) => (
              <TouchableOpacity
                key={profile.id || i}
                style={styles.recommendCard}
                onPress={() => navigation.navigate('ProfileDetail', { userId: profile.user.id })}
              >
                <Image
                  source={{ uri: profile.user.photos[0]?.url || 'https://via.placeholder.com/200' }}
                  style={styles.recommendImage}
                />
                <View style={styles.recommendInfo}>
                  <Text style={styles.recommendName}>{profile.firstName} {profile.lastName?.[0]}.</Text>
                  <Text style={styles.recommendDetail}>{profile.profession}</Text>
                  <Text style={styles.recommendDetail}>{profile.city} • {profile.age} yrs</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Tips */}
        <View style={[styles.section, { paddingHorizontal: Spacing.xl }]}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={24} color={Colors.gold} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipText}>
                Profiles with 4+ photos receive 70% more interests. Add more photos to boost your visibility!
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Picks - Premium Feature */}
        <View style={[styles.section, { paddingHorizontal: Spacing.xl }]}>
          <TouchableOpacity
            style={styles.todayPicksBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Premium')}
          >
            <LinearGradient
              colors={Colors.gradientGold as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.todayPicksGradient}
            >
              <View style={styles.todayPicksContent}>
                <Ionicons name="diamond" size={24} color={Colors.white} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.todayPicksTitle}>Today's Premium Picks</Text>
                  <Text style={styles.todayPicksSub}>
                    3 hand-picked matches selected just for you daily
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={28} color={Colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Success Stories CTA */}
        <View style={[styles.section, { paddingHorizontal: Spacing.xl }]}>
          <TouchableOpacity
            style={styles.storiesCta}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SuccessStories')}
          >
            <View style={styles.storiesCtaIcon}>
              <Ionicons name="heart-circle" size={24} color={Colors.love} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.storiesCtaTitle}>Success Stories</Text>
              <Text style={styles.storiesCtaSub}>Read how couples found their soulmate</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
  },
  greeting: { ...Typography.title2, color: Colors.textPrimary },
  subGreeting: { ...Typography.subhead, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.small,
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
  },
  completionCard: {
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  completionContent: { flexDirection: 'row', alignItems: 'center' },
  completionTitle: { ...Typography.bodyBold, color: Colors.white },
  completionSub: { ...Typography.caption1, color: 'rgba(255,255,255,0.8)' },
  completionBar: {
    height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: Spacing.md,
  },
  completionFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.white },
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl,
  },
  quickActionItem: { alignItems: 'center' },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  quickActionLabel: { ...Typography.caption1, color: Colors.textSecondary, fontWeight: '500' },
  hostBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, padding: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primaryLight + '40',
    ...Shadows.small,
  },
  hostBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostBannerIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  hostBannerTitle: { ...Typography.subhead, fontWeight: '700', color: Colors.textPrimary },
  hostBannerSub: { ...Typography.caption2, color: Colors.textTertiary },
  section: { marginBottom: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg,
  },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary },
  seeAll: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  profileMini: {
    width: 140, height: 200, borderRadius: BorderRadius.xl,
    marginRight: Spacing.md, overflow: 'hidden', ...Shadows.small,
  },
  profileMiniImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  profileMiniGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  profileMiniInfo: { position: 'absolute', bottom: Spacing.md, left: Spacing.md },
  profileMiniName: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },
  profileMiniCity: { ...Typography.caption2, color: 'rgba(255,255,255,0.8)' },
  miniVerified: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.info, alignItems: 'center', justifyContent: 'center',
  },
  recommendCard: {
    width: 180, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white, marginRight: Spacing.md,
    overflow: 'hidden', ...Shadows.small,
  },
  recommendImage: { width: '100%', height: 160, resizeMode: 'cover' },
  recommendInfo: { padding: Spacing.md },
  recommendName: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  recommendDetail: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.goldSoft, borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  tipTitle: { ...Typography.footnote, fontWeight: '600', color: Colors.goldDark },
  tipText: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  todayPicksBanner: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  todayPicksGradient: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  todayPicksContent: { flexDirection: 'row', alignItems: 'center' },
  todayPicksTitle: { ...Typography.bodyBold, color: Colors.white },
  todayPicksSub: { ...Typography.caption1, color: Colors.white, opacity: 0.85, marginTop: 2 },
  storiesCta: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  storiesCtaIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.loveSoft, alignItems: 'center', justifyContent: 'center',
  },
  storiesCtaTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  storiesCtaSub: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 2 },
});
