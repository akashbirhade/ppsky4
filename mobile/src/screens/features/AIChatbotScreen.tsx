import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
}

const QUICK_PROMPTS = [
  'How to write a good bio?',
  'Tips to get more matches',
  'What makes a good profile photo?',
  'How to start a conversation?',
  'Is my profile complete?',
  'Safety tips for meeting',
];

export const AIChatbotScreen = () => {
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your Soulmate Sync AI Coach 💫\n\nI can help you with:\n• Profile improvement tips\n• Conversation starters\n• Kundali & compatibility info\n• Safety guidelines\n• Premium features info\n\nHow can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    Haptics.lightTap();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data } = await aiService.sendMessage(text.trim());
      Haptics.softTap();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.data?.reply || 'I\'m here to help! Could you rephrase that?',
        isUser: false,
        timestamp: new Date(),
        intent: data.data?.intent,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t process that right now. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={Colors.white} />
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.userBubbleInner : styles.aiBubbleInner]}>
        <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.headerIcon}>
            <Ionicons name="sparkles" size={16} color={Colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Coach</Text>
            <Text style={styles.headerSubtitle}>Your relationship assistant</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isLoading ? (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={Colors.white} />
              </View>
              <View style={[styles.bubble, styles.aiBubbleInner, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Prompts (show when few messages) */}
      {messages.length <= 2 && (
        <View style={styles.quickPrompts}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.promptChip}
                onPress={() => sendMessage(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.promptText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  headerSubtitle: { ...Typography.caption2, color: Colors.textTertiary },
  // Messages
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  messageBubble: { flexDirection: 'row', marginBottom: Spacing.md, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, marginTop: 4,
  },
  bubble: { borderRadius: BorderRadius.xl, padding: Spacing.md, maxWidth: '90%' },
  userBubbleInner: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  aiBubbleInner: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadows.small },
  messageText: { ...Typography.body, color: Colors.textPrimary, lineHeight: 22 },
  userMessageText: { color: Colors.white },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  typingText: { ...Typography.caption1, color: Colors.textTertiary },
  // Quick Prompts
  quickPrompts: { paddingVertical: Spacing.sm },
  promptChip: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.primary,
  },
  promptText: { ...Typography.caption1, color: Colors.primary, fontWeight: '500' },
  // Input Bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1, ...Typography.body, color: Colors.textPrimary,
    backgroundColor: Colors.background, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    maxHeight: 100, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textTertiary, opacity: 0.5 },
});
