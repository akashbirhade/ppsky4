import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Colors, Typography } from '@/constants/theme';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
}

export const Logo = ({ size = 40, showText = true, textSize = 24 }: LogoProps) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="50%" stopColor="#38bdf8" />
            <Stop offset="50%" stopColor="#a855f7" />
          </LinearGradient>
        </Defs>
        <Path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="url(#heartGrad)"
        />
      </Svg>
      {showText && (
        <Text style={[styles.text, { fontSize: textSize }]}>Soulmate Sync</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
});
