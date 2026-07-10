import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useReducedMotion } from './useReducedMotion';

interface AnimatedBadgeProps {
  count: number;
  /** Hide entirely when count is 0 */
  hideWhenZero?: boolean;
  max?: number;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * AnimatedBadge (Section 4 — Micro-interactions)
 * A count badge that "pops" with a spring bounce whenever the number changes —
 * perfect for unread messages, new interests, notification counts.
 */
export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  count,
  hideWhenZero = true,
  max = 99,
  color = Colors.love,
  textColor = Colors.white,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(count > 0 ? 1 : 0)).current;
  const prevCount = useRef(count);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wasVisible = prevCount.current > 0;
    const isVisible = count > 0;
    prevCount.current = count;

    if (!isVisible) {
      Animated.timing(scale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      return;
    }

    if (reducedMotion) {
      scale.setValue(1);
      return;
    }

    // Pop from the current state — appear from 0, or bounce if already showing
    scale.setValue(wasVisible ? 0.6 : 0);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 200 }).start();
  }, [count, reducedMotion]);

  if (hideWhenZero && count <= 0) return null;

  const display = count > max ? `${max}+` : `${count}`;

  return (
    <Animated.View style={[styles.badge, { backgroundColor: color, transform: [{ scale }] }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>{display}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...Typography.caption2, fontWeight: '700', fontSize: 11 },
});
