import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ScrollView, RefreshControl, Animated, TextInput, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { matchService, chatService } from '@/services';
import { SearchFilter, type FilterState } from '@/components/SearchFilter';
import { InterestButton } from '@/components/InterestButton';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

// ─── Types & config ───────────────────────────────────────────────────────────

type ChipKey = 'all' | 'new' | 'recommended' | 'preferences' | 'nearby' | 'recent' | 'verified' | 'premium';

const CHIPS: { key: ChipKey; label: string }[] = [
  { key: 'all', label: 'All Matches' },
  { key: 'new', label: 'New' },
  { key: 'recommended', label: 'Daily Picks' },
  { key: 'preferences', label: 'My Preferences' },
  { key: 'nearby', label: 'Near Me' },
  { key: 'recent', label: 'Recently Joined' },
  { key: 'verified', label: 'Verified' },
  { key: 'premium', label: 'Premium' },
];

const loaderFor = (key: ChipKey) => {
  switch (key) {
    case 'new': return matchService.getNewProfiles();
    case 'recommended': return matchService.getRecommended();
    case 'preferences': return matchService.getRecommended();
    case 'nearby': return matchService.getNearMe();
    case 'recent': return matchService.getRecentlyActive();
    case 'verified': return matchService.getVerified();
    case 'premium': return matchService.getPremiumMembers();
    case 'all':
    default: return matchService.getNewProfiles();
  }
};

// Deterministic display helpers (backend has no per-card score/online field yet)
const hash = (id: string, seed: number) => {
  let h = seed;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return h;
};
const scoreFor = (id: string) => 78 + (hash(id, 7) % 20); // 78–97%
const isOnlineFor = (id: string) => hash(id, 3) % 5 < 2; // ~40%

// FilterState imported from SearchFilter component

// ─── Skeleton shimmer card ──────────────────────────────────────────────────────

const SkeletonCard = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skelPhoto, { opacity: pulse }]} />
      <View style={styles.cardBody}>
        <Animated.View style={[styles.skelLine, { width: '55%', opacity: pulse }]} />
        <Animated.View style={[styles.skelLine, { width: '75%', height: 12, opacity: pulse }]} />
        <Animated.View style={[styles.skelLine, { width: '40%', height: 12, opacity: pulse }]} />
      </View>
    </View>
  );
};

// ─── Animated (fade + slide up) card wrapper ────────────────────────────────────

const AnimatedCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index, 6) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// ─── Matches (Discovery) Screen ─────────────────────────────────────────────────

export const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const [activeChip, setActiveChip] = useState<ChipKey>('all');
  const [cache, setCache] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const loadChip = useCallback(async (key: ChipKey, force = false) => {
    if (!force && cache[key]) return;
    setLoading(true);
    try {
      const { data } = await loaderFor(key);
      const profiles = data.data?.profiles || [];
      setCache((c) => ({ ...c, [key]: profiles }));
    } catch {
      setCache((c) => ({ ...c, [key]: c[key] || [] }));
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => { loadChip('all'); }, []);

  const onChipPress = (key: ChipKey) => {
    Haptics.selectionChanged();
    setActiveChip(key);
    loadChip(key);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChip(activeChip, true);
    setRefreshing(false);
  }, [activeChip, loadChip]);

  const rawList = cache[activeChip] || [];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rawList.filter((p: any) => {
      if (q) {
        const hay = `${p.firstName || ''} ${p.lastName || ''} ${p.city || ''} ${p.profession || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters) {
        if (filters.minAge && p.age && p.age < +filters.minAge) return false;
        if (filters.maxAge && p.age && p.age > +filters.maxAge) return false;
        if (filters.city && p.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.verifiedOnly && !p.isVerified) return false;
        if (filters.religion?.length && p.religion && !filters.religion.includes(p.religion)) return false;
        if (filters.education?.length && p.education && !filters.education.includes(p.education)) return false;
      }
      return true;
    });
  }, [rawList, query, filters]);

  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let n = 0;
    if (filters.verifiedOnly) n++;
    if (filters.city) n++;
    n += filters.religion?.length || 0;
    n += filters.education?.length || 0;
    n += filters.maritalStatus?.length || 0;
    n += filters.motherTongue?.length || 0;
    n += filters.income?.length || 0;
    n += filters.diet?.length || 0;
    return n;
  }, [filters]);

  const onSendInterest = async (userId: string): Promise<boolean> => {
    const { data } = await matchService.likeProfile(userId);
    setSentIds((prev) => new Set(prev).add(userId));
    return data.data?.isMatch || false;
  };

  const handleMessage = async (userId: string, name: string) => {
    Haptics.mediumTap();
    try {
      const { data } = await chatService.getOrCreateConversation(userId);
      const convId = data.data?.conversation?.id || data.data?.id;
      navigation.navigate('Chat', { conversationId: convId, userId, name });
    } catch {
      navigation.navigate('ProfileDetail', { userId });
    }
  };

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const userId = item.user?.id || item.id;
    const name = `${item.firstName || 'Member'}${item.lastName ? ' ' + item.lastName : ''}`;
    const photo = item.user?.photos?.find((p: any) => p.isMain)?.url || item.user?.photos?.[0]?.url;
    const score = scoreFor(userId);
    const online = isOnlineFor(userId);
    const summary = [item.profession, item.city, item.religion, item.education].filter(Boolean).join('  •  ');
    const status = sentIds.has(userId) ? 'sent' : 'none';

    const allIds = list.map((p: any) => p.user?.id || p.id).filter(Boolean);

    return (
      <AnimatedCard index={index}>
        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => { Haptics.lightTap(); navigation.navigate('ProfileDetail', { userId, profileIds: allIds, currentIndex: allIds.indexOf(userId) }); }}
          >
            <Image source={{ uri: photo || 'https://via.placeholder.com/600x700' }} style={styles.cardPhoto} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.cardPhotoGradient} />

            {/* Top badges */}
            <View style={styles.cardTopRow}>
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={Colors.white} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              <View style={styles.scorePill}>
                <Ionicons name="heart" size={12} color={Colors.white} />
                <Text style={styles.scoreText}>{score}% Match</Text>
              </View>
            </View>

            {/* Name overlay */}
            <View style={styles.cardNameOverlay}>
              {online && <View style={styles.onlineDot} />}
              <Text style={styles.cardName} numberOfLines={1}>
                {name}{item.age ? `, ${item.age}` : ''}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardBody}>
            {!!summary && <Text style={styles.cardSummary} numberOfLines={2}>{summary}</Text>}

            <View style={styles.cardActions}>
              <InterestButton
                variant="compact"
                status={status}
                onSend={() => onSendInterest(userId)}
                style={styles.interestFlex}
              />
              <TouchableOpacity style={styles.iconAction} onPress={() => handleMessage(userId, name)} activeOpacity={0.8}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconAction}
                onPress={() => { Haptics.lightTap(); navigation.navigate('ProfileDetail', { userId, profileIds: allIds, currentIndex: allIds.indexOf(userId) }); }}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, city, profession"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={20} color={Colors.white} />
          {activeFilterCount > 0 && (
            <View style={styles.filterCountDot}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CHIPS.map((chip) => {
            const isActive = activeChip === chip.key;
            const count = cache[chip.key]?.length;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => onChipPress(chip.key)}
                activeOpacity={0.8}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{chip.label}</Text>
                {typeof count === 'number' && count > 0 && (
                  <View style={[styles.chipCount, isActive && styles.chipCountActive]}>
                    <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading && !rawList.length ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={list}
          renderItem={renderCard}
          keyExtractor={(item: any, i) => (item.user?.id || item.id || i).toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={44} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptySubtitle}>
                {query || activeFilterCount ? 'Try adjusting your search or filters.' : 'Check back soon for new profiles!'}
              </Text>
            </View>
          }
        />
      )}

      <SearchFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(f) => setFilters(f)}
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
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', ...Shadows.small,
  },
  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg, height: 46, ...Shadows.small,
  },
  searchInput: { flex: 1, ...Typography.subhead, color: Colors.textPrimary, padding: 0 },
  filterBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', ...Shadows.small,
  },
  filterCountDot: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background, paddingHorizontal: 3,
  },
  filterCountText: { ...Typography.caption2, color: Colors.white, fontWeight: '800' },
  // Chips
  chipsWrap: { marginBottom: Spacing.md },
  chips: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: BorderRadius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  chipCount: {
    minWidth: 18, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 9,
    backgroundColor: Colors.primarySoft, alignItems: 'center',
  },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipCountText: { ...Typography.caption2, color: Colors.primary, fontWeight: '800' },
  chipCountTextActive: { color: Colors.white },
  // List
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 110 },
  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg, overflow: 'hidden', ...Shadows.medium,
  },
  cardPhoto: { width: '100%', height: 340, resizeMode: 'cover', backgroundColor: Colors.primarySoft },
  cardPhotoGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  cardTopRow: {
    position: 'absolute', top: Spacing.md, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(124,58,237,0.9)', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedText: { ...Typography.caption2, color: Colors.white, fontWeight: '700' },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.love, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  scoreText: { ...Typography.caption1, color: Colors.white, fontWeight: '800' },
  cardNameOverlay: {
    position: 'absolute', left: Spacing.lg, bottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 8, right: Spacing.lg,
  },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.online,
    borderWidth: 2, borderColor: Colors.white,
  },
  cardName: { ...Typography.title3, color: Colors.white, fontWeight: '700', flexShrink: 1 },
  cardBody: { padding: Spacing.lg },
  cardSummary: { ...Typography.subhead, color: Colors.textSecondary, marginBottom: Spacing.md },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  interestFlex: { flex: 1 },
  iconAction: {
    width: 46, height: 46, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.primaryMuted, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  // Skeleton
  skelPhoto: { width: '100%', height: 340, backgroundColor: Colors.border },
  skelLine: { height: 16, borderRadius: 8, backgroundColor: Colors.border, marginTop: 10 },
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
});

export default MatchesScreen;
