import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

// ─── Imperative toast API ─────────────────────────────────────────────────────
// Usage: import { toast } from '@/components/Toast'; toast.success('Interest sent successfully');
// Mount <ToastHost /> once near the app root.

type ToastType = 'success' | 'error' | 'info';
type ToastPayload = { message: string; type: ToastType };

let listener: ((p: ToastPayload) => void) | null = null;

const emit = (message: string, type: ToastType) => {
  listener?.({ message, type });
};

export const toast = {
  success: (message: string) => emit(message, 'success'),
  error: (message: string) => emit(message, 'error'),
  info: (message: string) => emit(message, 'info'),
};

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.error,
  info: Colors.primary,
};

export const ToastHost: React.FC = () => {
  const [payload, setPayload] = useState<ToastPayload | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => setPayload(null));
  }, [opacity, translateY]);

  useEffect(() => {
    listener = (p: ToastPayload) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setPayload(p);
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 80 }),
      ]).start();
      hideTimer.current = setTimeout(hide, 2600);
    };
    return () => {
      listener = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [hide, opacity, translateY]);

  if (!payload) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
        <Ionicons name={ICONS[payload.type]} size={20} color={ICON_COLORS[payload.type]} />
        <Text style={styles.text} numberOfLines={2}>{payload.message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: '90%',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  text: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600', flexShrink: 1 },
});

export default ToastHost;
