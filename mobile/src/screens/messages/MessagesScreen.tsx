import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ScrollView, RefreshControl, Animated, Linking, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { matchService, chatService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from '@/utils/haptics';
import { toast } from '@/components/Toast';

type InboxTab = 'chats' | 'received' | 'accepted' | 'sent';

const TABS: { key: InboxTab; label: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }[] = [
  { key: 'chats', label: 'Chats', icon: 'chatbubbles-outline' },
  { key: 'received', label: 'Received', icon: 'heart-outline' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
  { key: 'sent', label: 'Sent', icon: 'paper-plane-outline' },
];

// ─── Defensive profile extractor (backend shapes vary) ──────────────────────────

const extract = (item: any) => {
  const u = item.fromUser || item.toUser || item.user || item;
  const p = u?.profile || u || {};
  const photos = u?.user?.photos || u?.photos || p?.photos || [];
  return {
    userId: u?.user?.id || u?.id || item.userId || item.id,
    name: `${p.firstName || 'Member'}${p.lastName ? ' ' + p.lastName : ''}`,
    age: p.age,
    city: p.city,
    profession: p.profession,
    photo: photos.find((x: any) => x.isMain)?.url || photos[0]?.url,
    isVerified: p.isVerified,
    phone: p.phone,
    email: p.email,
    status: (item.status || 'pending') as string,
    isMatch: item.isMatch,
  };
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: Colors.gold, bg: Colors.goldSoft },
  viewed: { label: 'Viewed', color: Colors.info, bg: Colors.primarySoft },
  accepted: { label: 'Accepted', color: Colors.success, bg: Colors.successSoft },
  declined: { label: 'Declined', color: Colors.error, bg: Colors.loveSoft },
  expired: { label: 'Expired', color: Colors.textTertiary, bg: Colors.border },
};

// ─── Animated dismissible row ───────────────────────────────────────────────────

const DismissibleRow: React.FC<{ children: React.ReactNode; onDismissed?: () => void; registerDismiss?: (fn: () => void) => void }> = ({ children, onDismissed, registerDismiss }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const dismiss = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start(() => onDismissed?.());
  }, [anim, onDismissed]);
  useEffect(() => { registerDismiss?.(dismiss); }, [registerDismiss, dismiss]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
        maxHeight: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 320] }),
        marginBottom: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Spacing.md] }),
      }}
    >
      {children}
    </Animated.View>
  );
};

// ─── Inbox Screen ───────────────────────────────────────────────────────────────

export const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { conversations, loadConversations } = useChatStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<InboxTab>('chats');
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadConversations(),
      matchService.getReceivedLikes().then(({ data }) => setReceived(data.data?.profiles || [])).catch(() => {}),
      matchService.getSentLikes().then(({ data }) => setSent(data.data?.likes || data.data?.profiles || [])).catch(() => {}),
    ]);
  }, [loadConversations]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const accepted = received.filter((r) => extract(r).isMatch);
  const pendingReceived = received.filter((r) => !extract(r).isMatch);

  const openChat = async (userId: string, name: string) => {
    Haptics.mediumTap();
    try {
      const { data } = await chatService.getOrCreateConversation(userId);
      const convId = data.data?.conversation?.id || data.data?.id;
      navigation.navigate('Chat', { conversationId: convId, userId, name });
    } catch {
      navigation.navigate('ProfileDetail', { userId });
    }
  };

  const callUser = (phone?: string, userId?: string) => {
    Haptics.mediumTap();
    if (phone) Linking.openURL(`tel:${phone}`);
    else if (userId) navigation.navigate('VideoCall', { receiverId: userId, type: 'AUDIO', callId: '' });
  };

  const whatsappUser = (phone?: string) => {
    Haptics.mediumTap();
    if (phone) Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`);
    else toast.info('Contact unlocks after your interest is accepted');
  };

  const acceptInterest = async (userId: string, dismiss: () => void) => {
    Haptics.success();
    try {
      await matchService.likeProfile(userId);
      toast.success('Interest accepted 💚');
    } catch {
      toast.error('Could not accept. Try again.');
    }
    dismiss();
    setTimeout(() => setReceived((prev) => prev.filter((r) => extract(r).userId !== userId)), 280);
  };

  const declineInterest = (userId: string, dismiss: () => void) => {
    Haptics.lightTap();
    dismiss();
    setTimeout(() => setReceived((prev) => prev.filter((r) => extract(r).userId !== userId)), 280);
    toast.info('Interest declined');
  };

  const cancelSent = async (userId: string, dismiss: () => void) => {
    Haptics.lightTap();
    try { await matchService.unlikeProfile(userId); } catch {}
    dismiss();
    setTimeout(() => setSent((prev) => prev.filter((s) => extract(s).userId !== userId)), 280);
    toast.info('Request cancelled');
  };

  // ─── Renderers ────────────────────────────────────────────────────────────────

  const renderConversation = ({ item }: any) => {
    const otherUser = item.otherUser;
    const photo = otherUser?.photos?.find((p: any) => p.isMain)?.url || otherUser?.photos?.[0]?.url;
    const name = otherUser?.profile ? `${otherUser.profile.firstName} ${otherUser.profile.lastName || ''}` : otherUser?.username || 'User';
    const unread = item.unreadCount || 0;
    const isUnread = unread > 0;
    const time = item.lastMessageAt ? formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false }) : '';
    const theirTurn = !isUnread && item.lastMessageBy && item.lastMessageBy !== user?.id;
    return (
      <TouchableOpacity
        style={[styles.convCard, isUnread && styles.unreadCard]}
        onPress={() => { Haptics.lightTap(); navigation.navigate('Chat', { conversationId: item.id, userId: otherUser?.id, name }); }}
        activeOpacity={0.7}
      >
        <Avatar uri={photo} name={name} size={52} isOnline={otherUser?.lastActive && new Date(otherUser.lastActive) > new Date(Date.now() - 5 * 60000)} />
        <View style={styles.convContent}>
          <View style={styles.convHeader}>
            <Text style={[styles.convName, isUnread && styles.unreadText]}>{name}</Text>
            <Text style={[styles.convTime, isUnread && styles.unreadTime]}>{time}</Text>
          </View>
          <View style={styles.convFooter}>
            <Text style={[styles.lastMessage, isUnread && styles.unreadText]} numberOfLines={1}>
              {item.lastMessageBy === user?.id ? 'You: ' : ''}{item.lastMessage || 'Start a conversation'}
            </Text>
            {isUnread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            ) : theirTurn ? (
              <View style={styles.yourTurnBadge}><Text style={styles.yourTurnText}>Your Turn</Text></View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderReceived = ({ item }: any) => {
    const p = extract(item);
    let dismissFn: () => void = () => {};
    return (
      <DismissibleRow registerDismiss={(fn) => { dismissFn = fn; }}>
        <View style={styles.interestCard}>
          <TouchableOpacity style={styles.interestTop} activeOpacity={0.8} onPress={() => navigation.navigate('ProfileDetail', { userId: p.userId })}>
            <Image source={{ uri: p.photo || 'https://via.placeholder.com/120' }} style={styles.interestPhoto} />
            <View style={styles.interestInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.interestName} numberOfLines={1}>{p.name}{p.age ? `, ${p.age}` : ''}</Text>
                {p.isVerified && <Ionicons name="shield-checkmark" size={14} color={Colors.success} />}
              </View>
              {!!p.profession && <Text style={styles.interestSub} numberOfLines={1}>{p.profession}</Text>}
              {!!p.city && <Text style={styles.interestSub} numberOfLines={1}>{p.city}</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.interestActions}>
            <TouchableOpacity style={styles.declineBtn} onPress={() => declineInterest(p.userId, dismissFn)} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={Colors.error} />
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptInterest(p.userId, dismissFn)} activeOpacity={0.8}>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DismissibleRow>
    );
  };

  const renderAccepted = ({ item }: any) => {
    const p = extract(item);
    return (
      <View style={styles.interestCard}>
        <TouchableOpacity style={styles.interestTop} activeOpacity={0.8} onPress={() => navigation.navigate('ProfileDetail', { userId: p.userId })}>
          <Image source={{ uri: p.photo || 'https://via.placeholder.com/120' }} style={styles.interestPhoto} />
          <View style={styles.interestInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.interestName} numberOfLines={1}>{p.name}{p.age ? `, ${p.age}` : ''}</Text>
              {p.isVerified && <Ionicons name="shield-checkmark" size={14} color={Colors.success} />}
            </View>
            {!!p.profession && <Text style={styles.interestSub} numberOfLines={1}>{p.profession}</Text>}
            {!!p.phone && <Text style={styles.contactLine}><Ionicons name="call-outline" size={12} color={Colors.textSecondary} /> {p.phone}</Text>}
            {!!p.email && <Text style={styles.contactLine} numberOfLines={1}><Ionicons name="mail-outline" size={12} color={Colors.textSecondary} /> {p.email}</Text>}
          </View>
        </TouchableOpacity>
        <View style={styles.acceptedActions}>
          <TouchableOpacity style={styles.roundAction} onPress={() => openChat(p.userId, p.name)}>
            <Ionicons name="chatbubble-ellipses" size={18} color={Colors.primary} />
            <Text style={styles.roundActionLabel}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundAction} onPress={() => whatsappUser(p.phone)}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.roundActionLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundAction} onPress={() => callUser(p.phone, p.userId)}>
            <Ionicons name="call" size={18} color={Colors.accent} />
            <Text style={styles.roundActionLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundAction} onPress={() => navigation.navigate('ProfileDetail', { userId: p.userId })}>
            <Ionicons name="person" size={18} color={Colors.textSecondary} />
            <Text style={styles.roundActionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSent = ({ item }: any) => {
    const p = extract(item);
    const meta = STATUS_META[p.status] || STATUS_META.pending;
    const canCancel = p.status === 'pending' || p.status === 'viewed';
    let dismissFn: () => void = () => {};
    return (
      <DismissibleRow registerDismiss={(fn) => { dismissFn = fn; }}>
        <View style={styles.interestCard}>
          <TouchableOpacity style={styles.interestTop} activeOpacity={0.8} onPress={() => navigation.navigate('ProfileDetail', { userId: p.userId })}>
            <Image source={{ uri: p.photo || 'https://via.placeholder.com/120' }} style={styles.interestPhoto} />
            <View style={styles.interestInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.interestName} numberOfLines={1}>{p.name}{p.age ? `, ${p.age}` : ''}</Text>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
              {!!p.profession && <Text style={styles.interestSub} numberOfLines={1}>{p.profession}</Text>}
              {!!p.city && <Text style={styles.interestSub} numberOfLines={1}>{p.city}</Text>}
            </View>
          </TouchableOpacity>
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelSent(p.userId, dismissFn)} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.textTertiary} />
              <Text style={styles.cancelText}>Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </DismissibleRow>
    );
  };

  const emptyFor = (tab: InboxTab) => {
    const map: Record<InboxTab, { icon: any; title: string; sub: string }> = {
      chats: { icon: 'chatbubbles-outline', title: 'No messages yet', sub: 'Accept an interest to start chatting!' },
      received: { icon: 'heart-outline', title: 'No interests received', sub: 'Complete your profile to attract more people.' },
      accepted: { icon: 'checkmark-circle-outline', title: 'No connections yet', sub: 'Accepted interests will appear here.' },
      sent: { icon: 'paper-plane-outline', title: 'No requests sent', sub: 'Send interests from the Matches tab.' },
    };
    const e = map[tab];
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}><Ionicons name={e.icon} size={44} color={Colors.primary} /></View>
        <Text style={styles.emptyTitle}>{e.title}</Text>
        <Text style={styles.emptySubtitle}>{e.sub}</Text>
      </View>
    );
  };

  const dataFor = (): any[] => {
    switch (activeTab) {
      case 'chats': return conversations;
      case 'received': return pendingReceived;
      case 'accepted': return accepted;
      case 'sent': return sent;
    }
  };

  const rendererFor = (): any => {
    switch (activeTab) {
      case 'chats': return renderConversation;
      case 'received': return renderReceived;
      case 'accepted': return renderAccepted;
      case 'sent': return renderSent;
    }
  };

  const countFor = (tab: InboxTab): number => {
    switch (tab) {
      case 'chats': return conversations.length;
      case 'received': return pendingReceived.length;
      case 'accepted': return accepted.length;
      case 'sent': return sent.length;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => {
            const active = activeTab === t.key;
            const count = countFor(t.key);
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => { Haptics.selectionChanged(); setActiveTab(t.key); }}
                activeOpacity={0.8}
              >
                <Ionicons name={t.icon} size={16} color={active ? Colors.white : Colors.textTertiary} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                {count > 0 && (
                  <View style={[styles.tabCount, active && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={dataFor()}
        renderItem={rendererFor()}
        keyExtractor={(item: any, i) => (item.id || extract(item).userId || i).toString() + '-' + activeTab}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={emptyFor(activeTab)}
      />
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
  // Tabs
  tabsWrap: { marginBottom: Spacing.md },
  tabs: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: BorderRadius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.white },
  tabCount: {
    minWidth: 18, paddingHorizontal: 5, borderRadius: 9,
    backgroundColor: Colors.primarySoft, alignItems: 'center',
  },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountText: { ...Typography.caption2, color: Colors.primary, fontWeight: '800' },
  tabCountTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 110 },
  // Conversation card
  convCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.small,
  },
  unreadCard: { backgroundColor: Colors.primarySoft },
  convContent: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { ...Typography.bodyBold, color: Colors.textPrimary },
  convTime: { ...Typography.caption1, color: Colors.textTertiary },
  convFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 },
  lastMessage: { ...Typography.subhead, color: Colors.textSecondary, flex: 1 },
  unreadText: { color: Colors.textPrimary, fontWeight: '600' },
  unreadTime: { color: Colors.secondaryDark, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: Colors.secondaryDark,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  unreadBadgeText: { ...Typography.caption2, color: Colors.white, fontWeight: '800' },
  yourTurnBadge: { backgroundColor: Colors.goldSoft, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  yourTurnText: { ...Typography.caption2, color: Colors.goldDark, fontWeight: '700' },
  // Interest card (received / accepted / sent)
  interestCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.md, ...Shadows.small,
  },
  interestTop: { flexDirection: 'row', gap: Spacing.md },
  interestPhoto: { width: 72, height: 72, borderRadius: BorderRadius.lg, backgroundColor: Colors.primarySoft },
  interestInfo: { flex: 1, justifyContent: 'center', gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  interestName: { ...Typography.bodyBold, color: Colors.textPrimary, flexShrink: 1 },
  interestSub: { ...Typography.footnote, color: Colors.textSecondary },
  contactLine: { ...Typography.footnote, color: Colors.textSecondary, marginTop: 2 },
  // Received actions
  interestActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  declineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.loveSoft,
    backgroundColor: Colors.loveSoft,
  },
  declineText: { ...Typography.subhead, color: Colors.error, fontWeight: '700' },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: BorderRadius.lg, backgroundColor: Colors.success,
  },
  acceptText: { ...Typography.subhead, color: Colors.white, fontWeight: '700' },
  // Accepted actions
  acceptedActions: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md,
  },
  roundAction: { alignItems: 'center', gap: 4 },
  roundActionLabel: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '600' },
  // Sent
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusBadgeText: { ...Typography.caption2, fontWeight: '800' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary },
  emptySubtitle: { ...Typography.callout, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
});

export default MessagesScreen;
