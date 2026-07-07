import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from '@/utils/haptics';

type MsgTab = 'accepted' | 'interests';

export const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { conversations, loadConversations } = useChatStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<MsgTab>('accepted');

  useEffect(() => {
    loadConversations();
  }, []);

  const renderConversation = ({ item }: any) => {
    const otherUser = item.otherUser;
    const photo = otherUser?.photos?.find((p: any) => p.isMain)?.url || otherUser?.photos?.[0]?.url;
    const name = otherUser?.profile
      ? `${otherUser.profile.firstName} ${otherUser.profile.lastName || ''}`
      : otherUser?.username || 'User';
    const isUnread = item.user1UnreadCount > 0 || item.user2UnreadCount > 0;
    const time = item.lastMessageAt
      ? formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: false })
      : '';

    return (
      <TouchableOpacity
        style={[styles.conversationCard, isUnread && styles.unreadCard]}
        onPress={() => { Haptics.lightTap(); navigation.navigate('Chat', {
          conversationId: item.id,
          userId: otherUser?.id,
          name,
        }); }}
        activeOpacity={0.7}
      >
        <Avatar
          uri={photo}
          name={name}
          size={52}
          isOnline={otherUser?.lastActive && new Date(otherUser.lastActive) > new Date(Date.now() - 5 * 60000)}
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, isUnread && styles.unreadText]}>{name}</Text>
            <Text style={styles.conversationTime}>{time}</Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Start a conversation'}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
            {!isUnread && item.lastMessageSenderId && item.lastMessageSenderId !== user?.id && (
              <View style={styles.yourTurnBadge}>
                <Text style={styles.yourTurnText}>Your Turn</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Online Matches */}
      <View style={styles.onlineSection}>
        <View style={styles.onlineHeader}>
          <Text style={styles.onlineTitle}>Online Matches <Text style={styles.onlineCount}>{conversations.length}</Text></Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.onlineSubtitle}>Initiate a chat with your matches to get faster response</Text>
        <FlatList
          data={conversations.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.sm }}
          keyExtractor={(item: any) => `online-${item.id}`}
          renderItem={({ item }: any) => {
            const otherUser = item.otherUser;
            const photo = otherUser?.photos?.[0]?.url;
            const name = otherUser?.profile?.firstName || otherUser?.username || '';
            return (
              <TouchableOpacity style={styles.onlineItem}>
                <Avatar uri={photo} name={name} size={56} showBorder isOnline />
                <Text style={styles.onlineName} numberOfLines={1}>{name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* My Conversations Section */}
      <View style={styles.conversationSection}>
        <Text style={styles.conversationSectionTitle}>My Conversations</Text>
        <View style={styles.msgTabs}>
          <TouchableOpacity
            style={[styles.msgTab, activeTab === 'accepted' && styles.msgTabActive]}
            onPress={() => { Haptics.selectionChanged(); setActiveTab('accepted'); }}
          >
            <Text style={[styles.msgTabText, activeTab === 'accepted' && styles.msgTabTextActive]}>
              Accepted ({conversations.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.msgTab, activeTab === 'interests' && styles.msgTabActive]}
            onPress={() => { Haptics.selectionChanged(); setActiveTab('interests'); }}
          >
            <Text style={[styles.msgTabText, activeTab === 'interests' && styles.msgTabTextActive]}>
              Interests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptySubtitle}>
              Match with someone to start chatting!
            </Text>
          </View>
        }
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
  searchBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.small,
  },
  // Online section
  onlineSection: { marginBottom: Spacing.md },
  onlineHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  onlineTitle: { ...Typography.headline, color: Colors.textPrimary },
  onlineCount: { color: Colors.textTertiary, fontWeight: '400' },
  onlineSubtitle: { ...Typography.caption1, color: Colors.textSecondary, paddingHorizontal: Spacing.xl, marginTop: 2 },
  viewAllText: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  onlineItem: { alignItems: 'center', marginRight: Spacing.lg, width: 64 },
  onlineName: { ...Typography.caption2, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  // Conversation section
  conversationSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  conversationSectionTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.sm },
  msgTabs: { flexDirection: 'row', gap: Spacing.lg },
  msgTab: { paddingBottom: Spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  msgTabActive: { borderBottomColor: Colors.primary },
  msgTabText: { ...Typography.subhead, color: Colors.textTertiary, fontWeight: '500' },
  msgTabTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  // List
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  conversationCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    ...Shadows.small,
  },
  unreadCard: { backgroundColor: Colors.primarySoft },
  conversationContent: { flex: 1, marginLeft: Spacing.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conversationName: { ...Typography.bodyBold, color: Colors.textPrimary },
  conversationTime: { ...Typography.caption2, color: Colors.textTertiary },
  conversationFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lastMessage: { ...Typography.subhead, color: Colors.textSecondary, flex: 1 },
  unreadText: { fontWeight: '700', color: Colors.textPrimary },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary, marginLeft: Spacing.sm,
  },
  yourTurnBadge: {
    backgroundColor: '#FFF0F0', borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: '#FECACA',
    paddingHorizontal: 8, paddingVertical: 2, marginLeft: Spacing.sm,
  },
  yourTurnText: { fontSize: 10, fontWeight: '600', color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.lg },
  emptySubtitle: { ...Typography.callout, color: Colors.textSecondary, marginTop: Spacing.sm },
});
