import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socket';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';

export const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conversationId, userId, name } = route.params;
  const { user } = useAuthStore();
  const {
    currentMessages, loadMessages, sendMessage,
    markAsRead, isTyping, setTyping,
  } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages(conversationId);
    markAsRead(conversationId);

    // Socket listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('typing', () => setTyping(true, userId));
    socketService.on('stop_typing', () => setTyping(false));

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('typing', () => {});
      socketService.off('stop_typing', () => {});
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId]);

  const handleNewMessage = (message: any) => {
    useChatStore.getState().addIncomingMessage(message);
    markAsRead(conversationId);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(conversationId, content);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch {}
    setSending(false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (value) socketService.sendTyping(conversationId);
    else socketService.stopTyping(conversationId);
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
              {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: false }) : ''}
            </Text>
            {isMe && (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : item.isDelivered ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.isRead ? Colors.info : 'rgba(255,255,255,0.6)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => navigation.navigate('ProfileDetail', { userId })}
        >
          <Avatar name={name} size={40} isOnline />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'typing...' : 'Online'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('VideoCall', { receiverId: userId, type: 'AUDIO', callId: '' })}
          >
            <Ionicons name="call" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('VideoCall', { receiverId: userId, type: 'VIDEO', callId: '' })}
          >
            <Ionicons name="videocam" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={currentMessages}
          renderItem={renderMessage}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Say hello to {name?.split(' ')[0]}! 👋
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>typing</Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, { animationDelay: '0ms' }]} />
              <View style={[styles.dot, { animationDelay: '200ms' }]} />
              <View style={[styles.dot, { animationDelay: '400ms' }]} />
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={text}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <Ionicons name="happy-outline" size={22} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Ionicons name="send" size={20} color={text.trim() ? Colors.white : Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.md },
  headerInfo: { marginLeft: Spacing.md },
  headerName: { ...Typography.bodyBold, color: Colors.textPrimary },
  headerStatus: { ...Typography.caption1, color: Colors.success },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  headerActionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  messageList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  messageRow: { marginBottom: Spacing.md, flexDirection: 'row' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: {
    maxWidth: '75%', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.xl,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.xs,
  },
  bubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.xs,
    ...Shadows.small,
  },
  messageText: { ...Typography.body, color: Colors.textPrimary },
  messageTextMe: { color: Colors.white },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'flex-end' },
  messageTime: { ...Typography.caption2, color: Colors.textTertiary },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
  },
  typingText: { ...Typography.caption1, color: Colors.textTertiary },
  typingDots: { flexDirection: 'row', marginLeft: 4, gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textTertiary },
  emptyChat: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyChatText: { ...Typography.callout, color: Colors.textSecondary },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  attachBtn: { padding: Spacing.xs, marginBottom: 4 },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: Colors.background, borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.sm, paddingHorizontal: Spacing.md,
    minHeight: 42, maxHeight: 120,
  },
  textInput: {
    flex: 1, ...Typography.body, color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  emojiBtn: { padding: Spacing.xs, marginBottom: 4 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    marginBottom: 1,
  },
  sendBtnActive: { backgroundColor: Colors.primary },
});
