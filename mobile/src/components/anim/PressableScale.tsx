import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from '@/utils/haptics';
import { useReducedMotion } from './useReducedMotion';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** How far the element compresses on press (0.96 = subtle, 0.90 = strong) */
  scaleTo?: number;
  /** Haptic feedback fired on press-in */
  haptic?: 'none' | 'light' | 'medium' | 'heavy' | 'selection';
  style?: StyleProp<ViewStyle>;
  /** Disable the scale animation (still fires onPress) */
  animationDisabled?: boolean;
}

const HAPTIC_MAP = {
  light: Haptics.lightTap,
  medium: Haptics.mediumTap,
  heavy: Haptics.heavyTap,
  selection: Haptics.selectionChanged,
  none: () => {},
};

/**
 * PressableScale (Section 4 & 10 — Micro-interactions)
 * A drop-in replacement for Pressable/TouchableOpacity that adds an
 * iOS-style spring compress-on-press with optional haptic feedback.
 * Respects the OS "Reduce Motion" accessibility setting.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  scaleTo = 0.96,
  haptic = 'light',
  style,
  animationDisabled,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();
  const skipAnim = animationDisabled || reducedMotion;

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    if (!disabled) {
      HAPTIC_MAP[haptic]?.();
      if (!skipAnim) {
        Animated.spring(scale, {
          toValue: scaleTo,
          useNativeDriver: true,
          friction: 8,
          tension: 220,
        }).start();
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    if (!skipAnim) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 180,
      }).start();
    }
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};
