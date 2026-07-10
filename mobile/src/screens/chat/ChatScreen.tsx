import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard, Modal, Animated, Easing,
  Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent,
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
import * as Haptics from '@/utils/haptics';
import { getSmartReplies } from '@/utils/smartReplies';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Animated typing dots ──────────────────────────────────────────────────────

const TypingDots = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const animations = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);
  return (
    <View style={styles.typingDots}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
};

// ─── Attachment options ────────────────────────────────────────────────────────

const ATTACH_OPTIONS: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; bg: string }[] = [
  { icon: 'camera', label: 'Camera', color: '#E53935', bg: '#FFEBEE' },
  { icon: 'images', label: 'Gallery', color: '#8E24AA', bg: '#F3E5F5' },
  { icon: 'document-text', label: 'Document', color: '#3949AB', bg: '#E8EAF6' },
  { icon: 'videocam', label: 'Video', color: '#00897B', bg: '#E0F2F1' },
  { icon: 'musical-notes', label: 'Audio', color: '#F4511E', bg: '#FBE9E7' },
  { icon: 'location', label: 'Location', color: '#43A047', bg: '#E8F5E9' },
  { icon: 'person', label: 'Contact', color: '#1E88E5', bg: '#E3F2FD' },
  { icon: 'happy', label: 'Sticker', color: '#FDD835', bg: '#FFFDE7' },
];

// ─── Chat Screen ──────────────────────────────────────────────────────────────

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
  const [attachOpen, setAttachOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const typingEmitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadMessages(conversationId);
    markAsRead(conversationId);

    const onTyping = () => {
      setTyping(true, userId);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      typingClearRef.current = setTimeout(() => setTyping(false), 3500);
    };
    const onStopTyping = () => {
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      setTyping(false);
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('typing', onTyping);
    socketService.on('stop_typing', onStopTyping);
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('typing', onTyping);
      socketService.off('stop_typing', onStopTyping);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
      setTyping(false);
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId]);

  // Auto-scroll on new messages or keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => showSub.remove();
  }, []);

  const handleNewMessage = useCallback((message: any) => {
    useChatStore.getState().addIncomingMessage(message);
    markAsRead(conversationId);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, [conversationId, markAsRead]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendContent(text);
  };

  const sendContent = async (raw: string) => {
    const content = raw.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    Haptics.lightTap();
    if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
    socketService.stopTyping(conversationId);
    try {
      await sendMessage(conversationId, content);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {}
    setSending(false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (value) {
      socketService.sendTyping(conversationId);
      if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
      typingEmitRef.current = setTimeout(() => socketService.stopTyping(conversationId), 1500);
    } else {
      if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
      socketService.stopTyping(conversationId);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setShowScrollBtn(distanceFromBottom > 240);
  };

  // ─── Attachment sheet ─────────────────────────────────────────────────────────

  const openAttach = () => {
    setAttachOpen(true);
    Haptics.mediumTap();
    sheetAnim.setValue(0);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
  };

  const closeAttach = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() => {
      setAttachOpen(false);
    });
  };

  const handleAttachOption = (label: string) => {
    closeAttach();
    Haptics.selectionChanged();
    // Placeholder: future feature implementation per option
  };

  // ─── Smart reply suggestions ──────────────────────────────────────────────────

  const firstName = name?.split(' ')[0];
  const lastIncoming = [...currentMessages].reverse().find((m: any) => m.senderId !== user?.id);
  const suggestions = getSmartReplies(lastIncoming?.content, firstName);
  const showSuggestions = !text.trim() && currentMessages.length > 0 && !sending;

  const applySuggestion = (s: string) => {
    Haptics.selectionChanged();
    sendContent(s);
  };

  const scrollToBottom = () => {
    Haptics.lightTap();
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollBtn(false);
  };

  // ─── Render message ─────────────────────────────────────────────────────────

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
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
            <Text style={styles.headerStatus}>{isTyping ? 'typing...' : 'Online'}</Text>
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

      {/* Messages + Input — properly keyboard-avoiding */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <FlatList
          ref={flatListRef}
          data={currentMessages}
          renderItem={renderMessage}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>Say hello to {name?.split(' ')[0]}! 👋</Text>
              <Text style={styles.emptyChatSub}>Use a template to start the conversation</Text>
              <View style={styles.templateList}>
                {[
                  `Hi ${name?.split(' ')[0]}, I found your profile interesting and would like to connect.`,
                  `Hello! We seem to have a lot in common. Would you like to chat?`,
                  `Hi, I liked your profile. Tell me more about yourself!`,
                ].map((tmpl, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.templateCard}
                    onPress={() => { setText(tmpl); inputRef.current?.focus(); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} />
                    <Text style={styles.templateText} numberOfLines={2}>{tmpl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <TouchableOpacity style={styles.scrollBtn} onPress={scrollToBottom} activeOpacity={0.85}>
            <Ionicons name="chevron-down" size={22} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
            <Text style={styles.typingText}>{firstName || name} is typing…</Text>
          </View>
        )}

        {/* Smart reply suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.suggestHint}>
                <Ionicons name="sparkles" size={13} color={Colors.primary} />
              </View>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionChip}
                  onPress={() => applySuggestion(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText} numberOfLines={1}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={openAttach} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={text}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <Ionicons name="happy-outline" size={22} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !!text.trim() && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color={text.trim() ? Colors.white : Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Bottom Sheet */}
      <Modal visible={attachOpen} transparent animationType="none" onRequestClose={closeAttach}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={closeAttach}>
          <Animated.View
            style={[
              styles.attachSheet,
              {
                transform: [{
                  translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }),
                }],
                opacity: sheetAnim,
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.attachGrid}>
              {ATTACH_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.attachItem}
                  onPress={() => handleAttachOption(opt.label)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.attachIconCircle, { backgroundColor: opt.bg }]}>
                    <Ionicons name={opt.icon} size={24} color={opt.color} />
                  </View>
                  <Text style={styles.attachLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  messageList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexGrow: 1 },
  messageRow: { marginBottom: Spacing.md, flexDirection: 'row' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: {
    maxWidth: '75%', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.xl,
  },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: BorderRadius.xs },
  bubbleOther: { backgroundColor: Colors.white, borderBottomLeftRadius: BorderRadius.xs, ...Shadows.small },
  messageText: { ...Typography.body, color: Colors.textPrimary },
  messageTextMe: { color: Colors.white },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'flex-end' },
  messageTime: { ...Typography.caption2, color: Colors.textTertiary },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
  },
  typingBubble: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xs,
    paddingHorizontal: 12, paddingVertical: 10, ...Shadows.small,
  },
  typingText: { ...Typography.caption1, color: Colors.textTertiary },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  // Smart replies
  suggestionsWrap: { paddingBottom: Spacing.xs },
  suggestionsRow: { paddingHorizontal: Spacing.md, alignItems: 'center', gap: Spacing.sm },
  suggestHint: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 2,
  },
  suggestionChip: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.primarySoft,
    paddingHorizontal: Spacing.md, paddingVertical: 8, maxWidth: SCREEN_W * 0.6,
    ...Shadows.small,
  },
  suggestionText: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },
  // Scroll-to-bottom
  scrollBtn: {
    position: 'absolute', right: Spacing.lg, bottom: 82, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
    ...Shadows.medium,
  },
  emptyChat: { alignItems: 'center', paddingTop: Spacing.huge, paddingHorizontal: Spacing.xl },
  emptyChatText: { ...Typography.callout, color: Colors.textSecondary },
  emptyChatSub: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 4, marginBottom: Spacing.lg },
  templateList: { width: '100%', gap: Spacing.sm },
  templateCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.primarySoft,
  },
  templateText: { ...Typography.caption1, color: Colors.textPrimary, flex: 1, lineHeight: 18 },
  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  attachBtn: { padding: Spacing.xs, marginBottom: 6 },
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
  emojiBtn: { padding: Spacing.xs, marginBottom: 6 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    marginBottom: 3,
  },
  sendBtnActive: { backgroundColor: Colors.primary },
  // Attachment sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.md, paddingBottom: Spacing.huge, paddingHorizontal: Spacing.lg,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  attachGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  attachItem: { width: '25%', alignItems: 'center', marginBottom: Spacing.xl },
  attachIconCircle: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  attachLabel: { ...Typography.caption1, color: Colors.textSecondary, fontWeight: '600' },
});

export default ChatScreen;
