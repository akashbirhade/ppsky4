import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '@/constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  isOnline,
  isVerified,
  showBorder = false,
}) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showBorder ? (
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          style={[styles.gradientBorder, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}
        >
          <View style={[styles.innerBorder, { width: size, height: size, borderRadius: size / 2 }]}>
            {uri ? (
              <Image source={{ uri }} style={[styles.image, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]} />
            ) : (
              <View style={[styles.placeholder, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}>
                <Text style={[styles.initials, { fontSize: size / 3 }]}>{initials}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <>
          {uri ? (
            <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
          ) : (
            <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
              <Text style={[styles.initials, { fontSize: size / 3 }]}>{initials}</Text>
            </View>
          )}
        </>
      )}

      {isOnline !== undefined && (
        <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.online : Colors.offline }]} />
      )}

      {isVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradientBorder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBorder: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.primary,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verifiedIcon: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
