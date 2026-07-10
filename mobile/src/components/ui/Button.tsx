import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';
import { useReducedMotion } from '@/components/anim/useReducedMotion';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  /** Haptic feedback fired on press-in */
  haptic?: 'none' | 'light' | 'medium' | 'heavy' | 'selection';
}

const HAPTIC_MAP = {
  light: Haptics.lightTap,
  medium: Haptics.mediumTap,
  heavy: Haptics.heavyTap,
  selection: Haptics.selectionChanged,
  none: () => {},
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  haptic = 'light',
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  const handlePressIn = () => {
    if (disabled || loading) return;
    HAPTIC_MAP[haptic]?.();
    if (!reducedMotion) {
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 220 }).start();
    }
  };

  const handlePressOut = () => {
    if (!reducedMotion) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 180 }).start();
    }
  };

  const handlePress = (_e: GestureResponderEvent) => {
    if (disabled || loading) return;
    onPress();
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: Typography.footnote,
    md: Typography.bodyBold,
    lg: Typography.headline,
  };

  if (variant === 'gradient') {
    return (
      <Animated.View style={[fullWidth && { width: '100%' }, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={fullWidth ? { width: '100%' } : undefined}
      >
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            sizeStyles[size],
            Shadows.glow,
            disabled && styles.disabled,
            fullWidth && { width: '100%' },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              {icon}
              <Text style={[textSizes[size], { color: Colors.white, marginLeft: icon ? 8 : 0 }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      </Animated.View>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: Colors.primary, ...Shadows.medium },
    secondary: { backgroundColor: Colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors: Record<string, string> = {
    primary: Colors.white,
    secondary: Colors.white,
    outline: Colors.primary,
    ghost: Colors.primary,
  };

  return (
    <Animated.View style={[fullWidth && { width: '100%' }, { transform: [{ scale }] }]}>
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text style={[textSizes[size], { color: textColors[variant], marginLeft: icon ? 8 : 0 }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  disabled: {
    opacity: 0.5,
  },
});
