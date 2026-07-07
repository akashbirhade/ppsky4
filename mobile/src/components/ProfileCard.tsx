import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 28;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.56;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;

interface ProfileCardProps {
  profile: {
    firstName: string;
    lastName?: string;
    age?: number;
    city?: string;
    profession?: string;
    isVerified?: boolean;
    bio?: string;
    religion?: string;
    education?: string;
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
  const position = useRef(new Animated.ValueXY()).current;
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile.user?.photos || [];
  const currentPhoto = photos[photoIndex] || photos[0];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.2 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeOut('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeOut('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 100,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const swipeOut = (direction: 'left' | 'right') => {
    Haptics.mediumTap();
    const x = direction === 'right' ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      direction === 'right' ? onLike() : onSkip();
      position.setValue({ x: 0, y: 0 });
      setPhotoIndex(0);
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.7],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD * 0.7, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextPhoto = () => {
    if (photoIndex < photos.length - 1) { Haptics.softTap(); setPhotoIndex(photoIndex + 1); }
  };
  const prevPhoto = () => {
    if (photoIndex > 0) { Haptics.softTap(); setPhotoIndex(photoIndex - 1); }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.imageWrap}>
        {/* Photo */}
        <Image
          source={{ uri: currentPhoto?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }}
          style={styles.image}
        />

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <TouchableOpacity style={styles.tapLeft} onPress={prevPhoto} activeOpacity={1} />
            <TouchableOpacity style={styles.tapRight} onPress={nextPhoto} activeOpacity={1} />
          </>
        )}

        {/* Photo dots */}
        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dotBar, i === photoIndex && styles.dotBarActive]} />
            ))}
          </View>
        )}

        {/* LIKE overlay */}
        <Animated.View style={[styles.overlay, styles.overlayLike, { opacity: likeOpacity }]}>
          <View style={styles.overlayBadge}>
            <Text style={styles.overlayLikeText}>LIKE</Text>
          </View>
        </Animated.View>

        {/* NOPE overlay */}
        <Animated.View style={[styles.overlay, styles.overlayNope, { opacity: nopeOpacity }]}>
          <View style={[styles.overlayBadge, styles.overlayBadgeNope]}>
            <Text style={styles.overlayNopeText}>NOPE</Text>
          </View>
        </Animated.View>

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.88)']}
          locations={[0, 0.4, 0.72, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* Verified badge */}
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}

        {/* Info section */}
        <View style={styles.infoSection}>
          {/* Name & Age */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.firstName}{profile.lastName ? ` ${profile.lastName[0]}.` : ''}
            </Text>
            {profile.age ? <Text style={styles.age}> {profile.age}</Text> : null}
          </View>

          {/* Details */}
          <View style={styles.detailsRow}>
            {profile.profession && (
              <View style={styles.detail}>
                <Ionicons name="briefcase" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.detailText}>{profile.profession}</Text>
              </View>
            )}
            {profile.city && (
              <View style={styles.detail}>
                <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.detailText}>{profile.city}</Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  imageWrap: { flex: 1 },
  image: {
    width: '100%', height: '100%', resizeMode: 'cover',
  },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 100, width: '30%' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 100, width: '30%' },

  // Photo dots
  dots: {
    position: 'absolute', top: 12, left: 16, right: 16,
    flexDirection: 'row', gap: 3,
  },
  dotBar: {
    flex: 1, height: 3, borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotBarActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  // Swipe overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  overlayLike: {},
  overlayNope: {},
  overlayBadge: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 4, borderColor: '#4CD964', borderRadius: 12,
    transform: [{ rotate: '-15deg' }],
    position: 'absolute', top: 60, right: 30,
  },
  overlayBadgeNope: {
    borderColor: '#FF4458', right: undefined, left: 30,
    transform: [{ rotate: '15deg' }],
  },
  overlayLikeText: {
    fontSize: 36, fontWeight: '900', color: '#4CD964', letterSpacing: 2,
  },
  overlayNopeText: {
    fontSize: 36, fontWeight: '900', color: '#FF4458', letterSpacing: 2,
  },

  // Gradient
  gradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
  },

  // Verified
  verifiedBadge: {
    position: 'absolute', top: 40, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(124,58,237,0.85)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
  },
  verifiedText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Info
  infoSection: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
  },
  nameRow: {
    flexDirection: 'row', alignItems: 'baseline',
  },
  name: {
    fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.3,
  },
  age: {
    fontSize: 20, fontWeight: '400', color: 'rgba(255,255,255,0.85)',
  },
  detailsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6,
  },
  detail: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  detailText: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500',
  },
  bio: {
    fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 18,
  },
});
