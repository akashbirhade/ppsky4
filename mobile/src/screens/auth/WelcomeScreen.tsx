import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Your\nSoulmate',
    subtitle: 'Discover meaningful connections with AI-powered matchmaking',
    icon: '💕',
    gradient: ['#7C3AED', '#EC4899'] as const,
  },
  {
    id: '2',
    title: 'Verified\nProfiles',
    subtitle: 'Every profile is verified with Aadhaar, selfie & govt ID for your safety',
    icon: '🛡️',
    gradient: ['#6366F1', '#06B6D4'] as const,
  },
  {
    id: '3',
    title: 'Kundali\nMatching',
    subtitle: '36-point Ashtakoota compatibility analysis for perfect matches',
    icon: '⭐',
    gradient: ['#F59E0B', '#EF4444'] as const,
  },
  {
    id: '4',
    title: 'Video Calls\n& Chat',
    subtitle: 'Connect safely with voice calls, video calls, and secure messaging',
    icon: '📱',
    gradient: ['#10B981', '#6366F1'] as const,
  },
];

export const WelcomeScreen = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const renderSlide = ({ item, index }: any) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{item.icon}</Text>
      </LinearGradient>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.header}>
        <Logo size={32} showText={true} textSize={22} />
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Dots */}
      {renderDots()}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('Register')}
          variant="gradient"
          size="lg"
          fullWidth
        />
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoText: {
    ...Typography.title2,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    ...Typography.callout,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  actions: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  loginBtn: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  loginBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
