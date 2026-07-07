import React, { useEffect } from 'react';
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

export const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { conversations, loadConversations } = useChatStore();
  const { user } = useAuthStore();

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
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          userId: otherUser?.id,
          name,
        })}
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

      {/* Online Users Row */}
      <View style={styles.onlineSection}>
        <FlatList
          data={conversations.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
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
  onlineSection: { marginBottom: Spacing.lg },
  onlineItem: { alignItems: 'center', marginRight: Spacing.lg, width: 64 },
  onlineName: { ...Typography.caption2, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
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
  empty: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.lg },
  emptySubtitle: { ...Typography.callout, color: Colors.textSecondary, marginTop: Spacing.sm },
});
