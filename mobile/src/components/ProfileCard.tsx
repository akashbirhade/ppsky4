import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

interface ProfileCardProps {
  profile: {
    firstName: string;
    lastName?: string;
    age?: number;
    city?: string;
    profession?: string;
    isVerified?: boolean;
    bio?: string;
    user: {
      id: string;
      photos: Array<{ url: string; isMain: boolean }>;
    };
  };
  onLike: () => void;
  onSuperLike: () => void;
  onSkip: () => void;
  onPress: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onSuperLike,
  onSkip,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const mainPhoto = profile.user.photos.find((p) => p.isMain) || profile.user.photos[0];

  const animatePress = (callback: () => void) => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    callback();
  };

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {/* Profile Image */}
        <Image
          source={{ uri: mainPhoto?.url || 'https://via.placeholder.com/400x600' }}
          style={styles.image}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* Verified Badge */}
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.firstName}{profile.lastName ? ` ${profile.lastName[0]}.` : ''}
            </Text>
            {profile.age && <Text style={styles.age}>, {profile.age}</Text>}
          </View>

          {profile.profession && (
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.white} />
              <Text style={styles.detailText}>{profile.profession}</Text>
            </View>
          )}

          {profile.city && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={Colors.white} />
              <Text style={styles.detailText}>{profile.city}</Text>
            </View>
          )}

          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.skipBtn]}
            onPress={() => animatePress(onSkip)}
          >
            <Ionicons name="close" size={28} color={Colors.error} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.superLikeBtn]}
            onPress={() => animatePress(onSuperLike)}
          >
            <Ionicons name="star" size={24} color={Colors.gold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn]}
            onPress={() => animatePress(onLike)}
          >
            <Ionicons name="heart" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    ...Typography.caption1,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    ...Typography.title2,
    color: Colors.white,
    fontWeight: '700',
  },
  age: {
    ...Typography.title3,
    color: Colors.white,
    fontWeight: '400',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  detailText: {
    ...Typography.subhead,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: Spacing.sm,
  },
  bio: {
    ...Typography.footnote,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.sm,
  },
  actions: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  skipBtn: {
    backgroundColor: Colors.white,
  },
  superLikeBtn: {
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  likeBtn: {
    backgroundColor: Colors.primary,
    ...Shadows.glow,
  },
});
