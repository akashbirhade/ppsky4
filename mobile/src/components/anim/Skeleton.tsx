import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';
import { useReducedMotion } from './useReducedMotion';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton (Section 5 & 11 — Loading states)
 * A shimmering placeholder block. Compose several to build skeleton cards.
 * Replaces spinners for content that takes more than a moment to load.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, radius = BorderRadius.sm, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      shimmer.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, reducedMotion]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: Colors.border, opacity },
        style,
      ]}
    />
  );
};

/** SkeletonCircle — for avatars / photo thumbnails */
export const SkeletonCircle: React.FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({ size = 48, style }) => (
  <Skeleton width={size} height={size} radius={size / 2} style={style} />
);

/** SkeletonCard — a ready-made list-card placeholder */
export const SkeletonCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Skeleton height={180} radius={BorderRadius.lg} />
    <View style={styles.cardBody}>
      <Skeleton width="55%" height={16} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBody: { padding: 14 },
});
