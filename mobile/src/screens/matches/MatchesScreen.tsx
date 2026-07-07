import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMatchStore } from '@/store/matchStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

type Tab = 'likes' | 'favorites' | 'matches';

export const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const { receivedLikes, favorites, loadReceivedLikes, loadFavorites } = useMatchStore();
  const [activeTab, setActiveTab] = useState<Tab>('likes');

  useEffect(() => {
    loadReceivedLikes();
    loadFavorites();
  }, []);

  const getTabData = () => {
    switch (activeTab) {
      case 'likes': return receivedLikes;
      case 'favorites': return favorites;
      case 'matches': return receivedLikes.filter((p: any) => p.isMatch);
      default: return [];
    }
  };

  const renderProfile = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProfileDetail', { userId: item.user?.id || item.id })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.user?.photos?.[0]?.url || 'https://via.placeholder.com/200' }}
        style={styles.cardImage}
      />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardGradient} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.firstName}, {item.age}</Text>
        <Text style={styles.cardCity}>{item.city || item.profession}</Text>
      </View>
      {item.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'likes', label: 'Likes', icon: 'heart', count: receivedLikes.length },
          { key: 'matches', label: 'Matches', icon: 'people', count: 0 },
          { key: 'favorites', label: 'Favorites', icon: 'star', count: favorites.length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as Tab)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? Colors.primary : Colors.textTertiary}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={getTabData()}
        renderItem={renderProfile}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No {activeTab} yet</Text>
            <Text style={styles.emptySubtitle}>
              Start discovering profiles to get matches!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  title: { ...Typography.title1, color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white, ...Shadows.small,
  },
  tabActive: { backgroundColor: Colors.primarySoft },
  tabLabel: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '500' },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
  badge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center',
  },
  badgeText: { ...Typography.caption2, color: Colors.white, fontWeight: '700' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    flex: 1, height: 220, borderRadius: BorderRadius.xl,
    overflow: 'hidden', ...Shadows.small,
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  cardInfo: { position: 'absolute', bottom: Spacing.md, left: Spacing.md },
  cardName: { ...Typography.subhead, color: Colors.white, fontWeight: '700' },
  cardCity: { ...Typography.caption1, color: 'rgba(255,255,255,0.8)' },
  verifiedBadge: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.info, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.lg },
  emptySubtitle: { ...Typography.callout, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
});
