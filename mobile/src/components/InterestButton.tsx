import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';
import { toast } from '@/components/Toast';

export type InterestStatus = 'none' | 'sent' | 'connected';

interface Props {
  status: InterestStatus;
  onSend: () => Promise<boolean | void> | boolean | void;
  /** compact = smaller card variant, full = profile-detail variant */
  variant?: 'full' | 'compact';
  style?: ViewStyle;
  disabled?: boolean;
}

// Confetti pieces radiating outward on success
const CONFETTI = Array.from({ length: 10 }).map((_, i) => ({
  angle: (Math.PI * 2 * i) / 10,
  color: [Colors.secondary, Colors.gold, Colors.primary, Colors.success, Colors.love][i % 5],
  size: 5 + (i % 3) * 2,
}));

const LABELS: Record<InterestStatus, string> = {
  none: 'Connect Now',
  sent: 'Interested',
  connected: 'Connected',
};

export const InterestButton: React.FC<Props> = ({ status, onSend, variant = 'full', style, disabled }) => {
  const [internal, setInternal] = useState<InterestStatus>(status);
  const [busy, setBusy] = useState(false);

  // Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(status === 'none' ? 0 : 1)).current; // heart fill + color
  const check = useRef(new Animated.Value(status === 'sent' ? 1 : 0)).current;
  const confetti = useRef(new Animated.Value(0)).current;

  // Sync when parent status changes externally (e.g. accepted -> connected)
  useEffect(() => {
    setInternal(status);
    Animated.timing(fill, {
      toValue: status === 'none' ? 0 : 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [status, fill]);

  const runSuccessAnimation = () => {
    ripple.setValue(0);
    check.setValue(0);
    confetti.setValue(0);
    Animated.parallel([
      // spring press feedback (instant tap feel)
      Animated.sequence([
        Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 6, tension: 160 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }),
      ]),
      // ripple expand + fade (fast)
      Animated.timing(ripple, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      // heart fill + color transition (300ms)
      Animated.timing(fill, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      // checkmark pop (after brief delay)
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(check, { toValue: 1, useNativeDriver: true, friction: 5, tension: 160 }),
      ]),
      // confetti burst (fast)
      Animated.timing(confetti, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const handlePress = async () => {
    if (busy || disabled || internal !== 'none') return;
    setBusy(true);
    Haptics.heavyTap();
    // Optimistic morph
    setInternal('sent');
    runSuccessAnimation();
    try {
      const isMatch = await onSend();
      Haptics.success();
      if (isMatch === true) {
        toast.success("It's a match! You both connected 💚");
      } else {
        toast.success('Interest sent successfully');
      }
    } catch {
      // Revert on failure
      setInternal('none');
      Animated.timing(fill, { toValue: 0, duration: 250, useNativeDriver: false }).start();
      check.setValue(0);
      toast.error('Could not send interest. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const isCompact = variant === 'compact';
  const showConnected = internal === 'connected';

  const bgColor = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.primary, showConnected ? Colors.success : Colors.love],
  });

  const label = LABELS[internal];
  const heartName = internal === 'none' ? 'heart-outline' : 'heart';
  const heartColor = internal === 'connected' ? Colors.white : Colors.white;

  const pieces = useMemo(() => CONFETTI, []);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || internal !== 'none'}
        style={({ pressed }) => [pressed && internal === 'none' && { opacity: 0.95 }]}
      >
        <Animated.View
          style={[
            styles.btn,
            isCompact ? styles.btnCompact : styles.btnFull,
            { backgroundColor: bgColor },
          ]}
        >
          {/* Ripple overlay */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                opacity: ripple.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.35, 0] }),
                transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2.4] }) }],
              },
            ]}
          />

          {internal === 'sent' ? (
            <Animated.View
              style={{
                transform: [{ scale: check.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
                opacity: check,
              }}
            >
              <Ionicons name="checkmark-circle" size={isCompact ? 18 : 22} color={Colors.white} />
            </Animated.View>
          ) : (
            <Ionicons name={heartName} size={isCompact ? 16 : 20} color={heartColor} />
          )}

          <Text style={[isCompact ? styles.labelCompact : styles.labelFull]}>{label}</Text>

          {/* Confetti burst */}
          <View pointerEvents="none" style={styles.confettiAnchor}>
            {pieces.map((p, i) => {
              const dist = isCompact ? 34 : 52;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.confetti,
                    {
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      opacity: confetti.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] }),
                      transform: [
                        { translateX: confetti.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * dist] }) },
                        { translateY: confetti.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * dist] }) },
                        { scale: confetti.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1.1, 0.4] }) },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'visible',
  },
  btnFull: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  btnCompact: {
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
  },
  labelFull: { ...Typography.bodyBold, color: Colors.white },
  labelCompact: { ...Typography.subhead, color: Colors.white, fontWeight: '700' },
  confettiAnchor: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default InterestButton;
