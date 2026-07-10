import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { callService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from '@/utils/haptics';

type CallTab = 'all' | 'missed' | 'video' | 'audio';

export const CallHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CallTab>('all');

  useEffect(() => { loadCalls(); }, []);

  const loadCalls = async () => {
    try {
      const { data } = await callService.getCallHistory();
      setCalls(data.data?.calls || []);
    } catch {} finally { setLoading(false); }
  };

  const filteredCalls = calls.filter(call => {
    if (tab === 'missed') return call.status === 'MISSED';
    if (tab === 'video') return call.type === 'VIDEO';
    if (tab === 'audio') return call.type === 'AUDIO';
    return true;
  });

  const renderCall = ({ item }: any) => {
    const otherUser = item.caller || item.receiver;
    const name = otherUser?.profile?.firstName || otherUser?.username || 'User';
    const photo = otherUser?.photos?.[0]?.url;
    const isMissed = item.status === 'MISSED';
    const isOutgoing = item.direction === 'outgoing';
    const time = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';
    const duration = item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : '';

    return (
      <TouchableOpacity
        style={styles.callCard}
        onPress={() => navigation.navigate('ProfileDetail', { userId: otherUser?.id })}
        activeOpacity={0.7}
      >
        <Avatar uri={photo} name={name} size={48} />
        <View style={styles.callInfo}>
          <Text style={[styles.callName, isMissed && styles.missedText]}>{name}</Text>
          <View style={styles.callMeta}>
            <Ionicons
              name={isOutgoing ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={isMissed ? Colors.error : Colors.success}
            />
            <Text style={styles.callMetaText}>
              {item.type === 'VIDEO' ? 'Video' : 'Audio'} • {time}
              {duration ? ` • ${duration}` : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            Haptics.lightTap();
            navigation.navigate('VideoCall', {
              receiverId: otherUser?.id,
              type: item.type,
              callId: '',
            });
          }}
        >
          <Ionicons
            name={item.type === 'VIDEO' ? 'videocam' : 'call'}
            size={18}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call History</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'all', label: 'All' },
          { key: 'missed', label: 'Missed' },
          { key: 'video', label: 'Video' },
          { key: 'audio', label: 'Audio' },
        ] as const).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredCalls}
        renderItem={renderCall}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCalls} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="call-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No calls yet</Text>
            <Text style={styles.emptyText}>Your call history will appear here</Text>
          </View>
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
  tabs: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.subhead, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  callCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  callInfo: { flex: 1, marginLeft: Spacing.md },
  callName: { ...Typography.bodyBold, color: Colors.textPrimary },
  missedText: { color: Colors.error },
  callMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  callMetaText: { ...Typography.caption1, color: Colors.textTertiary },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyTitle: { ...Typography.headline, color: Colors.textSecondary, marginTop: Spacing.md },
  emptyText: { ...Typography.subhead, color: Colors.textTertiary, marginTop: Spacing.xs },
});

export default CallHistoryScreen;
