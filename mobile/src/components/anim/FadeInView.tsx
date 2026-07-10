import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Stagger index — multiplies the base delay for list entrances */
  index?: number;
  /** Base delay per index (ms) */
  staggerMs?: number;
  /** Extra fixed delay before the animation starts (ms) */
  delay?: number;
  duration?: number;
  /** Slide direction as the element fades in */
  from?: Direction;
  /** Slide distance in px */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * FadeInView (Section 5 — Card animations)
 * Fades + slides content into view. Pass `index` inside a list to create a
 * staggered entrance. Cards should never appear abruptly.
 * Respects the OS "Reduce Motion" setting (fades only, no slide).
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  index = 0,
  staggerMs = 55,
  delay = 0,
  duration = 380,
  from = 'up',
  distance = 22,
  style,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const totalDelay = delay + Math.min(index, 8) * staggerMs;
    Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 180 : duration,
      delay: reducedMotion ? 0 : totalDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, index, staggerMs, delay, duration, reducedMotion]);

  const translateStyle = () => {
    if (reducedMotion || from === 'none') return {};
    const range = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
    switch (from) {
      case 'up': return { transform: [{ translateY: range }] };
      case 'down': return { transform: [{ translateY: Animated.multiply(range, -1) }] };
      case 'left': return { transform: [{ translateX: range }] };
      case 'right': return { transform: [{ translateX: Animated.multiply(range, -1) }] };
      default: return {};
    }
  };

  return (
    <Animated.View style={[style, { opacity: progress }, translateStyle()]}>
      {children}
    </Animated.View>
  );
};
