import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { notificationService } from '../../services';
import * as Haptics from '../../utils/haptics';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
};

const ICON_MAP: Record<string, { name: string; color: string; bg: string }> = {
  MATCH: { name: 'heart', color: Colors.love, bg: Colors.loveSoft },
  LIKE: { name: 'heart-outline', color: '#EC4899', bg: '#FDF2F8' },
  SUPER_LIKE: { name: 'star', color: Colors.gold, bg: Colors.goldSoft },
  MESSAGE: { name: 'chatbubble', color: Colors.primary, bg: Colors.primarySoft },
  VIEW: { name: 'eye', color: Colors.accent, bg: Colors.accentSoft },
  VERIFICATION: { name: 'shield-checkmark', color: Colors.success, bg: Colors.successSoft },
  SYSTEM: { name: 'information-circle', color: Colors.textSecondary, bg: '#F3F4F6' },
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications();
      setNotifications(data?.data?.notifications || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const markAllRead = async () => {
    Haptics.lightTap();
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotificationPress = (item: Notification) => {
    Haptics.lightTap();
    // Navigate based on notification type
    if (item.type === 'MATCH' || item.type === 'LIKE' || item.type === 'SUPER_LIKE' || item.type === 'VIEW') {
      if (item.data?.userId) {
        navigation.navigate('ProfileDetail', { userId: item.data.userId });
      }
    } else if (item.type === 'MESSAGE') {
      if (item.data?.conversationId) {
        navigation.navigate('Chat', {
          conversationId: item.data.conversationId,
          userId: item.data.userId || '',
          name: item.data.name || 'Chat',
        });
      }
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconConfig = ICON_MAP[item.type] || ICON_MAP.SYSTEM;

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.isRead && styles.notifUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              When you get likes, matches, or messages, they'll show up here.
            </Text>
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
  markRead: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },
  list: { paddingVertical: Spacing.sm },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  notifUnread: { backgroundColor: Colors.primarySoft },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  notifContent: { flex: 1 },
  notifTitle: { ...Typography.subhead, color: Colors.textPrimary },
  notifTitleBold: { fontWeight: '700' },
  notifBody: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  notifTime: { ...Typography.caption2, color: Colors.textTertiary, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, marginLeft: Spacing.sm,
  },
  empty: {
    alignItems: 'center', paddingVertical: Spacing.xxl * 2, paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { ...Typography.headline, fontWeight: '600', marginTop: Spacing.md },
  emptySubtitle: {
    ...Typography.callout, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm,
  },
});
