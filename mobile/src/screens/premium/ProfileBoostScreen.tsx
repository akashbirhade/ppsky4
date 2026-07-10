import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

const { width } = Dimensions.get('window');

const BOOST_OPTIONS = [
  { duration: '30 min', price: '₹49', multiplier: '3x', description: '3x more profile views for 30 minutes' },
  { duration: '1 hour', price: '₹79', multiplier: '5x', description: '5x more profile views for 1 hour', popular: true },
  { duration: '3 hours', price: '₹149', multiplier: '10x', description: '10x more profile views for 3 hours' },
];

export const ProfileBoostScreen = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState(1); // popular by default
  const [loading, setLoading] = useState(false);

  const activateBoost = async () => {
    setLoading(true);
    Haptics.heavyTap();
    try {
      await subscriptionService.activateBoost();
      Haptics.success();
      Alert.alert('Boost Activated! 🚀', 'Your profile is now getting more visibility.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to activate boost. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          style={styles.heroIcon}
        >
          <Ionicons name="rocket" size={40} color={Colors.white} />
        </LinearGradient>
        <Text style={styles.heroTitle}>Boost Your Profile</Text>
        <Text style={styles.heroSub}>
          Get up to 10x more profile views and appear at the top of search results
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="eye" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>10x</Text>
          <Text style={styles.statLabel}>More Views</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={20} color={Colors.love} />
          <Text style={styles.statValue}>5x</Text>
          <Text style={styles.statLabel}>More Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubbles" size={20} color={Colors.success} />
          <Text style={styles.statValue}>3x</Text>
          <Text style={styles.statLabel}>More Messages</Text>
        </View>
      </View>

      {/* Boost Options */}
      <View style={styles.optionsContainer}>
        {BOOST_OPTIONS.map((option, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.optionCard, selected === i && styles.optionCardActive]}
            onPress={() => { Haptics.selectionChanged(); setSelected(i); }}
          >
            {option.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.optionHeader}>
              <Text style={[styles.multiplierText, selected === i && styles.multiplierActive]}>
                {option.multiplier}
              </Text>
              <Text style={[styles.durationText, selected === i && styles.durationActive]}>
                {option.duration}
              </Text>
            </View>
            <Text style={[styles.priceText, selected === i && styles.priceActive]}>{option.price}</Text>
            <Text style={styles.descText}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activate Button */}
      <TouchableOpacity style={styles.boostBtn} onPress={activateBoost} disabled={loading} activeOpacity={0.8}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.boostGradient}
        >
          <Ionicons name="flash" size={20} color={Colors.white} />
          <Text style={styles.boostBtnText}>
            {loading ? 'Activating...' : `Boost Now for ${BOOST_OPTIONS[selected].price}`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'flex-end', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: Spacing.xxxl, paddingTop: Spacing.lg },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, ...Shadows.glow,
  },
  heroTitle: { ...Typography.title1, color: Colors.textPrimary, textAlign: 'center' },
  heroSub: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: Spacing.xxl, marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg, backgroundColor: Colors.surface,
    marginTop: Spacing.xxl, ...Shadows.small,
  },
  statItem: { alignItems: 'center', gap: Spacing.xs },
  statValue: { ...Typography.title3, color: Colors.textPrimary },
  statLabel: { ...Typography.caption1, color: Colors.textTertiary },
  optionsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md, marginTop: Spacing.xxl },
  optionCard: {
    flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center',
  },
  optionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  popularBadge: {
    position: 'absolute', top: -10,
    backgroundColor: Colors.gold, paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  popularText: { ...Typography.caption2, color: Colors.white, fontWeight: '700' },
  optionHeader: { alignItems: 'center', marginBottom: Spacing.sm },
  multiplierText: { ...Typography.title2, color: Colors.textTertiary },
  multiplierActive: { color: Colors.primary },
  durationText: { ...Typography.caption1, color: Colors.textTertiary },
  durationActive: { color: Colors.primary },
  priceText: { ...Typography.title3, color: Colors.textPrimary },
  priceActive: { color: Colors.primary },
  descText: { ...Typography.caption2, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.xs },
  boostBtn: { marginHorizontal: Spacing.xl, marginTop: Spacing.xxxl },
  boostGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.full,
    ...Shadows.glow,
  },
  boostBtnText: { ...Typography.bodyBold, color: Colors.white },
});

export default ProfileBoostScreen;
