import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileCard } from '@/components/ProfileCard';
import { useMatchStore } from '@/store/matchStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const feeds = [
  { key: 'new', label: 'New', icon: 'sparkles' },
  { key: 'recommended', label: 'For You', icon: 'heart' },
  { key: 'nearby', label: 'Near Me', icon: 'location' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
] as const;

export const DiscoverScreen = () => {
  const navigation = useNavigation<any>();
  const {
    newProfiles, recommendedProfiles, nearbyProfiles,
    loadNewProfiles, loadRecommended, loadNearby,
    likeProfile, superLikeProfile, skipProfile,
    currentFeed, setFeed, isLoading,
  } = useMatchStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadNewProfiles();
    loadRecommended();
  }, []);

  const getCurrentProfiles = () => {
    switch (currentFeed) {
      case 'recommended': return recommendedProfiles;
      case 'nearby': return nearbyProfiles;
      default: return newProfiles;
    }
  };

  const profiles = getCurrentProfiles();
  const currentProfile = profiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    const isMatch = await likeProfile(currentProfile.user.id);
    setCurrentIndex((i) => i + 1);
    // TODO: Show match animation if isMatch
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;
    await superLikeProfile(currentProfile.user.id);
    setCurrentIndex((i) => i + 1);
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    skipProfile(currentProfile.user.id);
    setCurrentIndex((i) => i + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Feed Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {feeds.map((feed) => (
          <TouchableOpacity
            key={feed.key}
            style={[styles.tab, currentFeed === feed.key && styles.tabActive]}
            onPress={() => {
              setFeed(feed.key);
              setCurrentIndex(0);
            }}
          >
            <Ionicons
              name={feed.icon as any}
              size={16}
              color={currentFeed === feed.key ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.tabText, currentFeed === feed.key && styles.tabTextActive]}>
              {feed.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Profile Cards */}
      <View style={styles.cardContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onSuperLike={handleSuperLike}
            onSkip={handleSkip}
            onPress={() => navigation.navigate('ProfileDetail', { userId: currentProfile.user.id })}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No More Profiles</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new matches or try a different feed
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  title: { ...Typography.title1, color: Colors.textPrimary },
  filterBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  tabText: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.white },
  cardContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center', paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.lg },
  emptySubtitle: {
    ...Typography.callout, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm,
  },
});
