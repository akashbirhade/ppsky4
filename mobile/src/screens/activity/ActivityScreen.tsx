import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchService, profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from '@/utils/haptics';

const { width } = Dimensions.get('window');

type Tab = 'viewedMe' | 'viewedByMe' | 'shortlisted' | 'shortlistedMe';

const TABS: { key: Tab; label: string; icon: string; premiumOnly?: boolean }[] = [
  { key: 'viewedMe', label: 'Viewed Me', icon: 'eye' },
  { key: 'viewedByMe', label: 'I Viewed', icon: 'eye-outline' },
  { key: 'shortlisted', label: 'Shortlisted', icon: 'star' },
  { key: 'shortlistedMe', label: 'Shortlisted Me', icon: 'star-outline', premiumOnly: true },
];

export const ActivityScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('viewedMe');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'viewedMe':
          res = await profileService.getProfileViews();
          break;
        case 'viewedByMe':
          res = await matchService.getViewedByMe();
          break;
        case 'shortlisted':
          res = await matchService.getFavorites();
          break;
        case 'shortlistedMe':
          res = await matchService.getReceivedLikes();
          break;
      }
      setData(res?.data?.data?.profiles || res?.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [activeTab]);

  const renderItem = ({ item }: any) => {
    const profile = item.viewer || item.viewed || item.fromUser || item.favoriteUser || item;
    const profileData = profile?.profile || profile;
    const photos = profile?.photos || [];
    const photo = photos.find((p: any) => p.isMain)?.url || photos[0]?.url;
    const name = profileData?.firstName || profile?.username || 'User';
    const age = profileData?.age;
    const city = profileData?.city;
    const profession = profileData?.profession;
    const time = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.lightTap();
          navigation.navigate('ProfileDetail', { userId: profile?.id || item.userId });
        }}
      >
        <Image
          source={{ uri: photo || 'https://via.placeholder.com/100' }}
          style={styles.cardPhoto}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={1}>
              {name}{age ? `, ${age}` : ''}
            </Text>
            {profileData?.isVerified && <Badge type="verified" size="sm" />}
          </View>
          {profession && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.infoText}>{profession}</Text>
            </View>
          )}
          {city && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.infoText}>{city}</Text>
            </View>
          )}
          {time && <Text style={styles.timeText}>{time}</Text>}
        </View>
        <TouchableOpacity style={styles.interestBtn} onPress={() => {
          Haptics.heavyTap();
          matchService.likeProfile(profile?.id || item.userId);
        }}>
          <Ionicons name="heart-outline" size={20} color={Colors.love} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => { Haptics.selectionChanged(); setActiveTab(tab.key); }}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.premiumOnly && (
                <Ionicons name="diamond" size={10} color={isActive ? Colors.goldLight : Colors.gold} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{data.length} profiles</Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.id || i.toString()}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: Spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="eye-outline"
              title={activeTab === 'viewedMe' ? 'No one viewed yet' : 'No activity yet'}
              subtitle="Complete your profile to attract more visitors"
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { ...Typography.caption1, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  countRow: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  countText: { ...Typography.caption1, color: Colors.textTertiary },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  cardPhoto: { width: 64, height: 64, borderRadius: BorderRadius.md },
  cardContent: { flex: 1, marginLeft: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardName: { ...Typography.bodyBold, color: Colors.textPrimary, flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  infoText: { ...Typography.caption1, color: Colors.textTertiary },
  timeText: { ...Typography.caption2, color: Colors.textLight, marginTop: 4 },
  interestBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.loveSoft, alignItems: 'center', justifyContent: 'center',
  },
});

export default ActivityScreen;
