import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMatchStore } from '@/store/matchStore';
import { matchService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

type Tab = 'matches' | 'sent' | 'received' | 'viewed' | 'favorites';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'matches', label: 'My Matches', icon: 'people' },
  { key: 'sent', label: 'Sent Interests', icon: 'paper-plane' },
  { key: 'received', label: 'Received', icon: 'heart' },
  { key: 'viewed', label: 'Viewed', icon: 'eye' },
  { key: 'favorites', label: 'Favorites', icon: 'star' },
];

export const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const {
    receivedLikes, sentLikes, viewedByMe, favorites,
    loadReceivedLikes, loadSentLikes, loadViewedByMe, loadFavorites,
  } = useMatchStore();
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReceivedLikes();
    loadSentLikes();
    loadViewedByMe();
    loadFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadReceivedLikes(), loadSentLikes(), loadViewedByMe(), loadFavorites()]);
    setRefreshing(false);
  }, []);

  const getTabData = (): any[] => {
    switch (activeTab) {
      case 'matches': return receivedLikes.filter((p: any) => p.isMatch);
      case 'sent': return sentLikes;
      case 'received': return receivedLikes;
      case 'viewed': return viewedByMe;
      case 'favorites': return favorites;
      default: return [];
    }
  };

  const getTabCount = (key: Tab): number => {
    switch (key) {
      case 'matches': return receivedLikes.filter((p: any) => p.isMatch).length;
      case 'sent': return sentLikes.length;
      case 'received': return receivedLikes.length;
      case 'viewed': return viewedByMe.length;
      case 'favorites': return favorites.length;
      default: return 0;
    }
  };

  const getEmptyMessage = (): { icon: string; title: string; subtitle: string } => {
    switch (activeTab) {
      case 'matches': return { icon: 'people-outline', title: 'No matches yet', subtitle: 'When someone you like also likes you back, they\'ll appear here!' };
      case 'sent': return { icon: 'paper-plane-outline', title: 'No interests sent', subtitle: 'Start exploring profiles and send interests to people you like!' };
      case 'received': return { icon: 'heart-outline', title: 'No likes received', subtitle: 'Complete your profile to attract more visitors!' };
      case 'viewed': return { icon: 'eye-outline', title: 'No profiles viewed', subtitle: 'Start discovering profiles in the Discover tab!' };
      case 'favorites': return { icon: 'star-outline', title: 'No favorites', subtitle: 'Save profiles you\'re interested in for quick access!' };
      default: return { icon: 'heart-outline', title: 'Nothing here', subtitle: '' };
    }
  };

  const handleSendInterest = async (userId: string) => {
    Haptics.heavyTap();
    try {
      const { data } = await matchService.likeProfile(userId);
      if (data.data?.isMatch) {
        Haptics.success();
        Alert.alert('It\'s a Match! 🎉', 'You both liked each other!');
      } else {
        Alert.alert('Interest Sent ❤️', 'Your interest has been sent successfully');
      }
    } catch {}
  };

  const renderProfile = ({ item }: any) => {
    const profile = item.toUser || item.fromUser || item.viewed || item.favoriteUser || item;
    const profileData = profile?.profile || item;
    const photos = profile?.photos || item.user?.photos || [];
    const userId = profile?.id || item.user?.id || item.id;
    const name = profileData?.firstName || 'User';
    const age = profileData?.age;
    const city = profileData?.city;
    const profession = profileData?.profession;
    const height = profileData?.height;
    const isVerified = profileData?.isVerified || item.isVerified;

    return (
      <View style={styles.profileCard}>
        {/* Photo */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { Haptics.lightTap(); navigation.navigate('ProfileDetail', { userId }); }}
        >
          <Image
            source={{ uri: photos[0]?.url || 'https://via.placeholder.com/400x300' }}
            style={styles.profilePhoto}
          />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color={Colors.white} />
              <Text style={styles.verifiedLabel}>Verified</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.profileInfo}>
          {/* Name & Age */}
          <View style={styles.nameAgeRow}>
            <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
            {age && <Text style={styles.profileAge}>, {age} yrs</Text>}
          </View>

          {/* Details */}
          <View style={styles.detailsList}>
            {profession && (
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.detailText}>{profession}</Text>
              </View>
            )}
            {city && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.detailText}>{city}</Text>
              </View>
            )}
            {height && (
              <View style={styles.detailRow}>
                <Ionicons name="resize-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.detailText}>{height} cm</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => { Haptics.mediumTap(); navigation.navigate('ProfileDetail', { userId }); }}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>

            {activeTab !== 'sent' ? (
              <TouchableOpacity
                style={styles.sendInterestBtn}
                onPress={() => handleSendInterest(userId)}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={16} color={Colors.white} />
                <Text style={styles.sendInterestText}>Send Interest</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.sentBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.sentBadgeText}>Interest Sent</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const empty = getEmptyMessage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statCount}>{viewedByMe.length}</Text>
          <Text style={styles.statLabel}>Profile{'\n'}Visits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statCount, { color: Colors.secondary }]}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Shortlisted{'\n'}Profiles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statCount, { color: Colors.success }]}>{sentLikes.length}</Text>
          <Text style={styles.statLabel}>Contact{'\n'}Views</Text>
        </View>
      </View>

      {/* Interests Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScroll}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = getTabCount(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => { Haptics.lightTap(); setActiveTab(tab.key); }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? Colors.white : Colors.textTertiary}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Profile List */}
      <FlatList
        data={getTabData()}
        renderItem={renderProfile}
        keyExtractor={(item: any, index) => item.id || `${activeTab}-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name={empty.icon as any} size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptySubtitle}>{empty.subtitle}</Text>
          </View>
        }
        ListFooterComponent={
          getTabData().length > 0 ? (
            <TouchableOpacity style={styles.declinedSection} activeOpacity={0.7}>
              <View style={styles.declinedLeft}>
                <Text style={styles.declinedTitle}>Declined/Cancelled Interests</Text>
                <Text style={styles.declinedSub}>These include declined by you/by others</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { ...Typography.title1, color: Colors.textPrimary },
  // Stats
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
  },
  statCount: {
    fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 4,
  },
  statLabel: { ...Typography.caption2, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary },
  viewAll: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  // Tabs
  tabsScroll: { maxHeight: 48, marginBottom: Spacing.md },
  tabsContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  tabLabel: { ...Typography.caption1, color: Colors.textTertiary, fontWeight: '600' },
  tabLabelActive: { color: Colors.white },
  badge: {
    backgroundColor: Colors.primarySoft, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center',
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  badgeText: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '700' },
  badgeTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  // Profile Card
  profileCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md, overflow: 'hidden',
    ...Shadows.small,
  },
  profilePhoto: {
    width: '100%', height: 200, resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(124,58,237,0.85)', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedLabel: { ...Typography.caption2, color: Colors.white, fontWeight: '700' },
  profileInfo: { padding: Spacing.lg },
  nameAgeRow: { flexDirection: 'row', alignItems: 'baseline' },
  profileName: { ...Typography.headline, color: Colors.textPrimary },
  profileAge: { ...Typography.body, color: Colors.textSecondary },
  detailsList: { marginTop: Spacing.sm, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { ...Typography.subhead, color: Colors.textSecondary },
  // Action Buttons
  actionRow: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md,
  },
  viewProfileBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.white,
  },
  viewProfileText: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  sendInterestBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
  },
  sendInterestText: { ...Typography.subhead, color: Colors.white, fontWeight: '600' },
  sentBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.lg,
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5',
  },
  sentBadgeText: { ...Typography.subhead, color: Colors.success, fontWeight: '600' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary },
  emptySubtitle: {
    ...Typography.callout, color: Colors.textSecondary,
    marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl,
  },
  declinedSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginTop: Spacing.lg, marginHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  declinedLeft: { flex: 1 },
  declinedTitle: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  declinedSub: { ...Typography.caption2, color: Colors.textTertiary, marginTop: 2 },
});
