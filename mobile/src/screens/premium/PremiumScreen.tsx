import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

const plans = [
  {
    id: 'SILVER',
    name: 'Silver',
    price: '₹499',
    period: '/month',
    color: '#C0C0C0',
    gradient: ['#E8E8E8', '#C0C0C0'],
    popular: false,
    features: [
      '50 profile views/day',
      '10 interests/day',
      'Basic chat',
      'View verified badges',
    ],
  },
  {
    id: 'GOLD',
    name: 'Gold',
    price: '₹999',
    period: '/month',
    color: '#FFB347',
    gradient: ['#FFD194', '#FFB347'],
    popular: true,
    features: [
      'Unlimited profile views',
      '30 interests/day',
      'Video calling',
      'AI match recommendations',
      'See who viewed you',
      'Advanced filters',
      'Read receipts',
    ],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum',
    price: '₹1,999',
    period: '/month',
    color: '#6C63FF',
    gradient: ['#8B85FF', '#6C63FF'],
    popular: false,
    features: [
      'Everything in Gold',
      'Unlimited interests',
      'Personal matchmaking advisor',
      'Background verification',
      'Featured profile',
      'Premium events access',
      'Priority customer support',
      'Kundali matching',
    ],
  },
];

export const PremiumScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState('GOLD');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={Colors.gradientGold as any}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="diamond" size={48} color={Colors.white} />
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>
            Get 3x more matches and unlock all features
          </Text>
        </LinearGradient>

        {/* Plans */}
        <View style={styles.plansSection}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                selectedPlan === plan.id && { borderColor: plan.color },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <LinearGradient
                  colors={plan.gradient as any}
                  style={styles.planIcon}
                >
                  <Ionicons name="diamond" size={20} color={Colors.white} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                <View style={[styles.radio, selectedPlan === plan.id && { borderColor: plan.color }]}>
                  {selectedPlan === plan.id && (
                    <View style={[styles.radioInner, { backgroundColor: plan.color }]} />
                  )}
                </View>
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.features}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            title={`Get ${plans.find(p => p.id === selectedPlan)?.name} Plan`}
            onPress={() => {}}
            variant="gradient"
            size="lg"
            fullWidth
          />
          <Text style={styles.guarantee}>
            7-day money back guarantee • Cancel anytime
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Why Go Premium?</Text>
          {[
            { icon: 'trending-up', text: '3x more profile visibility' },
            { icon: 'heart-circle', text: 'See who liked your profile' },
            { icon: 'videocam', text: 'Unlimited video calls' },
            { icon: 'shield-checkmark', text: 'Verified matches only' },
            { icon: 'sparkles', text: 'AI-powered recommendations' },
          ].map((item, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={item.icon as any} size={20} color={Colors.gold} />
              </View>
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { padding: Spacing.lg, alignItems: 'flex-end' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    alignItems: 'center', padding: Spacing.xxxl,
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xxl,
  },
  heroTitle: { ...Typography.title1, color: Colors.white, marginTop: Spacing.lg },
  heroSubtitle: { ...Typography.callout, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.sm, textAlign: 'center' },
  plansSection: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  planCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    borderWidth: 2, borderColor: Colors.border, padding: Spacing.lg,
    ...Shadows.small, position: 'relative', overflow: 'hidden',
  },
  planCardSelected: { ...Shadows.medium },
  popularBadge: {
    position: 'absolute', top: 0, right: 16,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  popularText: { ...Typography.caption2, color: Colors.white, fontWeight: '800', letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  planIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  planName: { ...Typography.headline, color: Colors.textPrimary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { ...Typography.title3, color: Colors.textPrimary },
  planPeriod: { ...Typography.footnote, color: Colors.textSecondary, marginLeft: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  features: { marginTop: Spacing.lg, gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { ...Typography.subhead, color: Colors.textSecondary },
  cta: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl },
  guarantee: { ...Typography.caption1, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.md },
  benefits: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  benefitsTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.goldSoft, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitText: { ...Typography.body, color: Colors.textPrimary },
});
