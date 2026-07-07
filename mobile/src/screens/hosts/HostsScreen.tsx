import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { hostService } from '../../services';
import * as Haptics from '../../utils/haptics';

type Host = {
  id: string;
  name: string;
  profilePhoto?: string;
  region: string;
  district: string;
  city: string;
  community: string;
  status: string;
  _count?: { members: number; events: number };
};

export default function HostsScreen() {
  const navigation = useNavigation<any>();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadHosts(); }, []);

  const loadHosts = async () => {
    try {
      const { data } = await hostService.getAll();
      setHosts(data?.data?.hosts || data?.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHosts();
    setRefreshing(false);
  }, []);

  const renderHost = ({ item }: { item: Host }) => (
    <TouchableOpacity
      style={styles.hostCard}
      activeOpacity={0.7}
      onPress={() => {
        Haptics.lightTap();
        navigation.navigate('HostDetail', { hostId: item.id });
      }}
    >
      <View style={styles.hostAvatar}>
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{item.name}</Text>
        <Text style={styles.hostLocation}>
          <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
          {' '}{item.city}, {item.region}
        </Text>
        <Text style={styles.hostCommunity}>{item.community}</Text>
      </View>
      <View style={styles.hostStats}>
        <View style={styles.statChip}>
          <Ionicons name="people-outline" size={12} color={Colors.primary} />
          <Text style={styles.statChipText}>{item._count?.members || 0}</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="calendar-outline" size={12} color={Colors.secondary} />
          <Text style={styles.statChipText}>{item._count?.events || 0}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Hosts</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={styles.infoText}>
          Hosts are verified community matchmakers who manage profiles and organize matrimonial events in your area.
        </Text>
      </View>

      <FlatList
        data={hosts}
        renderItem={renderHost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Hosts Available</Text>
            <Text style={styles.emptySubtitle}>Community hosts will appear here once registered.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...Typography.headline, fontWeight: '700' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    margin: Spacing.md, padding: Spacing.md,
    backgroundColor: Colors.primarySoft, borderRadius: BorderRadius.md,
  },
  infoText: { ...Typography.caption1, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 20 },
  hostCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  hostAvatar: { marginRight: Spacing.md },
  avatarImage: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  hostInfo: { flex: 1 },
  hostName: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  hostLocation: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 2 },
  hostCommunity: { ...Typography.caption2, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  hostStats: { flexDirection: 'column', gap: 4, marginRight: Spacing.sm },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primarySoft, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  statChipText: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl * 2, paddingHorizontal: Spacing.xl },
  emptyTitle: { ...Typography.headline, fontWeight: '600', marginTop: Spacing.md },
  emptySubtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
