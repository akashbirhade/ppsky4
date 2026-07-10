import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { communityService } from '@/services';
import * as Haptics from '@/utils/haptics';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  icon: string;
  color: string;
  joined?: boolean;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'regional', label: 'Regional' },
  { key: 'professional', label: 'Professional' },
  { key: 'nri', label: 'NRI' },
  { key: 'support', label: 'Support' },
  { key: 'lifestyle', label: 'Lifestyle' },
];

const MOCK_GROUPS: Group[] = [
  { id: '1', name: 'Maharashtra Matches', description: 'Connect with singles from Maharashtra', category: 'regional', memberCount: 12400, icon: 'location', color: Colors.primary },
  { id: '2', name: 'Software Professionals', description: 'For IT & tech professionals seeking partners', category: 'professional', memberCount: 8900, icon: 'laptop', color: Colors.accent },
  { id: '3', name: 'NRI Connect', description: 'Indians abroad looking for life partners', category: 'nri', memberCount: 6700, icon: 'airplane', color: Colors.gold },
  { id: '4', name: 'Doctors & Healthcare', description: 'Medical professionals community', category: 'professional', memberCount: 5200, icon: 'medkit', color: Colors.love },
  { id: '5', name: 'Second Marriage Support', description: 'Supportive space for second innings', category: 'support', memberCount: 3400, icon: 'heart-circle', color: Colors.secondary },
  { id: '6', name: 'Fitness & Wellness', description: 'For health-conscious singles', category: 'lifestyle', memberCount: 4100, icon: 'barbell', color: Colors.success },
  { id: '7', name: 'South India Singles', description: 'Tamil, Telugu, Kannada, Malayalam community', category: 'regional', memberCount: 15600, icon: 'location', color: Colors.primaryDark },
  { id: '8', name: 'Entrepreneurs Circle', description: 'Business owners & founders', category: 'professional', memberCount: 2800, icon: 'briefcase', color: Colors.accentDark },
];

export const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await communityService.getGroups();
      const data = res.data?.groups;
      setGroups(data && data.length ? data : MOCK_GROUPS);
    } catch {
      setGroups(MOCK_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  const toggleJoin = (id: string) => {
    Haptics.selectionChanged();
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = category === 'all' ? groups : groups.filter((g) => g.category === category);

  const renderGroup = ({ item }: { item: Group }) => {
    const joined = joinedIds.has(item.id);
    return (
      <View style={styles.groupCard}>
        <View style={[styles.groupIcon, { backgroundColor: item.color + '18' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDesc} numberOfLines={1}>{item.description}</Text>
          <View style={styles.memberRow}>
            <Ionicons name="people" size={13} color={Colors.textTertiary} />
            <Text style={styles.memberCount}>
              {item.memberCount >= 1000 ? `${(item.memberCount / 1000).toFixed(1)}k` : item.memberCount} members
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.joinBtn, joined && styles.joinedBtn]}
          onPress={() => toggleJoin(item.id)}
        >
          <Text style={[styles.joinText, joined && styles.joinedText]}>
            {joined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Groups</Text>
        <View style={{ width: 40 }} />
      </View>

      <LinearGradient
        colors={Colors.gradientPrimary as any}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Ionicons name="people-circle" size={32} color={Colors.white} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.bannerTitle}>Find Your Community</Text>
          <Text style={styles.bannerSub}>Connect with like-minded singles who share your background & interests</Text>
        </View>
      </LinearGradient>

      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.chip, category === c.key && styles.chipActive]}
              onPress={() => { Haptics.selectionChanged(); setCategory(c.key); }}
            >
              <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  banner: {
    flexDirection: 'row', alignItems: 'center', margin: Spacing.xl,
    padding: Spacing.lg, borderRadius: BorderRadius.lg,
  },
  bannerTitle: { ...Typography.bodyBold, color: Colors.white },
  bannerSub: { ...Typography.caption1, color: Colors.white, opacity: 0.9, marginTop: 2 },
  filterWrap: { marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.footnote, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  groupIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  groupInfo: { flex: 1, marginLeft: Spacing.md },
  groupName: { ...Typography.bodyBold, color: Colors.textPrimary },
  groupDesc: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 1 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  memberCount: { ...Typography.caption2, color: Colors.textTertiary },
  joinBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primarySoft,
  },
  joinedBtn: { backgroundColor: Colors.successSoft },
  joinText: { ...Typography.footnote, color: Colors.primary, fontWeight: '700' },
  joinedText: { color: Colors.success },
});
