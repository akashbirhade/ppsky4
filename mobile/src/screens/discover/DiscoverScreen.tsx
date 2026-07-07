import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileCard } from '@/components/ProfileCard';
import { SearchFilter } from '@/components/SearchFilter';
import { useMatchStore } from '@/store/matchStore';
import { Colors, Spacing } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

const { width } = Dimensions.get('window');

const feeds = [
  { key: 'new', label: 'New', icon: 'sparkles-outline' },
  { key: 'recommended', label: 'For You', icon: 'heart-outline' },
  { key: 'nearby', label: 'Nearby', icon: 'navigate-outline' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark-outline' },
  { key: 'premium', label: 'Premium', icon: 'diamond-outline' },
] as const;

export const DiscoverScreen = () => {
  const navigation = useNavigation<any>();
  const {
    newProfiles, recommendedProfiles, nearbyProfiles,
    loadNewProfiles, loadRecommended, loadNearby,
    likeProfile, superLikeProfile, skipProfile,
    currentFeed, setFeed, isLoading,
  } = useMatchStore();
  const [filterVisible, setFilterVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(null);
    try {
      await Promise.all([loadNewProfiles(), loadRecommended()]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load profiles');
    }
  };

  const getCurrentProfiles = () => {
    switch (currentFeed) {
      case 'recommended': return recommendedProfiles;
      case 'nearby': return nearbyProfiles;
      default: return newProfiles;
    }
  };

  const profiles = getCurrentProfiles();
  const currentProfile = profiles[0];

  const handleLike = async () => {
    if (!currentProfile) return;
    Haptics.heavyTap();
    try { await likeProfile(currentProfile.user.id); } catch {}
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;
    Haptics.success();
    try { await superLikeProfile(currentProfile.user.id); } catch {}
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    Haptics.lightTap();
    skipProfile(currentProfile.user.id);
  };

  const handleFeedChange = (key: string) => {
    Haptics.selectionChanged();
    setFeed(key as any);
    if (key === 'nearby') loadNearby();
  };

  return (
    <View style={styles.container}>
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#F8F7FF', '#FAFAFA', '#FFF5F9']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Discover</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
              <Ionicons name="options-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed Tabs */}
        <View style={styles.tabsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {feeds.map((feed) => {
              const isActive = currentFeed === feed.key;
              return (
                <TouchableOpacity
                  key={feed.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => handleFeedChange(feed.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={(isActive ? feed.icon.replace('-outline', '') : feed.icon) as any}
                    size={15}
                    color={isActive ? '#fff' : Colors.textSecondary}
                  />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {feed.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Modal */}
        <SearchFilter
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={() => loadNewProfiles()}
        />

        {/* Main Card Area */}
        <View style={styles.cardArea}>
          {isLoading ? (
            <View style={styles.stateContainer}>
              <View style={styles.loadingPulse}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
              <Text style={styles.stateTitle}>Finding matches...</Text>
              <Text style={styles.stateSubtitle}>This won't take long</Text>
            </View>
          ) : error ? (
            <View style={styles.stateContainer}>
              <View style={styles.stateIconWrap}>
                <Ionicons name="wifi-outline" size={32} color={Colors.textTertiary} />
              </View>
              <Text style={styles.stateTitle}>No Connection</Text>
              <Text style={styles.stateSubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadData} activeOpacity={0.8}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : currentProfile ? (
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onSuperLike={handleSuperLike}
              onSkip={handleSkip}
              onPress={() => navigation.navigate('ProfileDetail', { userId: currentProfile.user.id })}
            />
          ) : (
            <View style={styles.stateContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="heart" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stateTitle}>All caught up!</Text>
              <Text style={styles.stateSubtitle}>
                You've seen all available profiles.{'\n'}Check back soon for new ones.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadData} activeOpacity={0.8}>
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Action Bar - only when card showing */}
        {currentProfile && !isLoading && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={[styles.actionBtn, styles.skipAction]} onPress={() => handleSkip()}>
              <Ionicons name="close" size={26} color="#FF4458" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.superAction]} onPress={handleSuperLike}>
              <Ionicons name="star" size={20} color="#7C3AED" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.likeAction]} onPress={() => handleLike()}>
              <Ionicons name="heart" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
  headerLeft: {},
  headerRight: { flexDirection: 'row', gap: 10 },
  title: {
    fontSize: 26, fontWeight: '700', color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },

  // Tabs
  tabsWrap: { paddingBottom: 12 },
  tabs: { paddingHorizontal: 16, gap: 6 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 0.25,
    shadowRadius: 8, elevation: 4,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  // Card area
  cardArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingBottom: 8,
  },

  // States
  stateContainer: { alignItems: 'center', paddingHorizontal: 48 },
  loadingPulse: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  stateIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6,
  },
  stateSubtitle: {
    fontSize: 14, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20, paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 24, backgroundColor: Colors.primary,
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Bottom action bar
  bottomBar: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 20, paddingVertical: 12, paddingBottom: 8,
  },
  actionBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  skipAction: {
    borderWidth: 2, borderColor: '#FF445815',
  },
  superAction: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: '#7C3AED15',
  },
  likeAction: {
    backgroundColor: Colors.primary,
    shadowColor: '#7C3AED', shadowOpacity: 0.35,
    shadowRadius: 12,
  },
});
