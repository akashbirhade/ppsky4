import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface BadgeProps {
  type: 'verified' | 'premium' | 'new' | 'online' | 'compatibility';
  value?: string | number;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizes = { sm: 20, md: 26, lg: 32 };
  const fontSizes = { sm: 9, md: 11, lg: 13 };

  if (type === 'verified') {
    return (
      <View style={[styles.badge, styles.verifiedBadge, { height: sizes[size] }]}>
        <Ionicons name="shield-checkmark" size={fontSizes[size] + 2} color={Colors.white} />
        {size !== 'sm' && <Text style={[styles.badgeText, { fontSize: fontSizes[size] }]}>Verified</Text>}
      </View>
    );
  }

  if (type === 'premium') {
    return (
      <LinearGradient
        colors={Colors.gradientGold as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.badge, { height: sizes[size] }]}
      >
        <Ionicons name="diamond" size={fontSizes[size]} color={Colors.white} />
        {size !== 'sm' && <Text style={[styles.badgeText, { fontSize: fontSizes[size] }]}>Premium</Text>}
      </LinearGradient>
    );
  }

  if (type === 'compatibility') {
    const score = Number(value) || 0;
    const color = score >= 80 ? Colors.success : score >= 60 ? Colors.gold : Colors.textTertiary;
    return (
      <View style={[styles.badge, styles.compatBadge, { borderColor: color, height: sizes[size] }]}>
        <Text style={[styles.compatText, { fontSize: fontSizes[size], color }]}>{score}% Match</Text>
      </View>
    );
  }

  if (type === 'online') {
    return <View style={[styles.onlineDot, { width: sizes[size] * 0.5, height: sizes[size] * 0.5 }]} />;
  }

  if (type === 'new') {
    return (
      <View style={[styles.badge, styles.newBadge, { height: sizes[size] }]}>
        <Ionicons name="sparkles" size={fontSizes[size]} color={Colors.white} />
        <Text style={[styles.badgeText, { fontSize: fontSizes[size] }]}>New</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  verifiedBadge: {
    backgroundColor: Colors.success,
  },
  newBadge: {
    backgroundColor: Colors.primary,
  },
  compatBadge: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
  },
  badgeText: {
    color: Colors.white,
    fontWeight: '700',
  },
  compatText: {
    fontWeight: '700',
  },
  onlineDot: {
    backgroundColor: Colors.online,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
