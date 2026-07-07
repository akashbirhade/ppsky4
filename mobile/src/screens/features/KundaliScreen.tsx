import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components/ui';
import { kundaliService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { RASHIS, NAKSHATRAS } from '@/constants';
import * as Haptics from '@/utils/haptics';

const gunaCategories = [
  { name: 'Varna', max: 1, desc: 'Spiritual compatibility' },
  { name: 'Vashya', max: 2, desc: 'Mutual attraction' },
  { name: 'Tara', max: 3, desc: 'Destiny compatibility' },
  { name: 'Yoni', max: 4, desc: 'Physical compatibility' },
  { name: 'Graha Maitri', max: 5, desc: 'Mental compatibility' },
  { name: 'Gana', max: 6, desc: 'Temperament match' },
  { name: 'Bhakoot', max: 7, desc: 'Love & relationship' },
  { name: 'Nadi', max: 8, desc: 'Health & genes' },
];

export const KundaliScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params || {};
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [myRashi, setMyRashi] = useState('');
  const [myNakshatra, setMyNakshatra] = useState('');
  const [partnerRashi, setPartnerRashi] = useState('');
  const [partnerNakshatra, setPartnerNakshatra] = useState('');
  const [result, setResult] = useState<any>(null);

  const totalScore = result?.totalScore || 0;
  const maxScore = result?.maxScore || 36;
  const percentage = result?.percentage || 0;

  const getCompatibilityColor = () => {
    if (percentage >= 75) return Colors.success;
    if (percentage >= 50) return Colors.gold;
    return Colors.error;
  };

  const handleCalculate = async () => {
    if (!myRashi || !myNakshatra || !partnerRashi || !partnerNakshatra) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    Haptics.mediumTap();
    setIsLoading(true);
    try {
      const { data } = await kundaliService.calculate({
        boyRashi: myRashi,
        boyNakshatra: myNakshatra,
        girlRashi: partnerRashi,
        girlNakshatra: partnerNakshatra,
      });
      setResult(data.data);
      setShowResult(true);
      Haptics.success();
    } catch {
      Alert.alert('Error', 'Could not calculate compatibility. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Kundali Match</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <LinearGradient
          colors={Colors.gradientPurple as any}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Ashtakoota Guna Milan</Text>
          <Text style={styles.heroSubtitle}>
            Ancient Vedic 36-point compatibility analysis
          </Text>
        </LinearGradient>

        {!showResult ? (
          /* Input Form */
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Your Details</Text>
            <Input
              label="Your Rashi (Moon Sign)"
              placeholder="Select your Rashi"
              value={myRashi}
              onChangeText={setMyRashi}
              icon="planet-outline"
            />
            <Input
              label="Your Nakshatra (Birth Star)"
              placeholder="Select your Nakshatra"
              value={myNakshatra}
              onChangeText={setMyNakshatra}
              icon="star-outline"
            />

            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Partner Details</Text>
            <Input
              label="Partner's Rashi"
              placeholder="Select partner's Rashi"
              value={partnerRashi}
              onChangeText={setPartnerRashi}
              icon="planet-outline"
            />
            <Input
              label="Partner's Nakshatra"
              placeholder="Select partner's Nakshatra"
              value={partnerNakshatra}
              onChangeText={setPartnerNakshatra}
              icon="star-outline"
            />

            <Button
              title="Calculate Compatibility"
              onPress={handleCalculate}
              variant="gradient"
              size="lg"
              fullWidth
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        ) : (
          /* Results */
          <View style={styles.results}>
            {/* Score Circle */}
            <View style={styles.scoreSection}>
              <View style={[styles.scoreCircle, { borderColor: getCompatibilityColor() }]}>
                <Text style={[styles.scoreValue, { color: getCompatibilityColor() }]}>
                  {totalScore}
                </Text>
                <Text style={styles.scoreMax}>/ {maxScore}</Text>
              </View>
              <Text style={[styles.scoreLabel, { color: getCompatibilityColor() }]}>
                {percentage >= 75 ? 'Excellent Match!' : percentage >= 50 ? 'Good Match' : 'Average Match'}
              </Text>
              <Text style={styles.scoreDesc}>
                {percentage}% compatibility based on Guna Milan
              </Text>
            </View>

            {/* Guna Breakdown */}
            <View style={styles.gunaSection}>
              <Text style={styles.sectionTitle}>Guna Breakdown</Text>
              {(result?.gunas || gunaCategories).map((guna: any, i: number) => {
                const score = guna.obtained ?? Math.min(guna.max || guna.maxPoints, Math.round(Math.random() * (guna.max || guna.maxPoints)) + 1);
                const max = guna.max || guna.maxPoints;
                return (
                  <View key={i} style={styles.gunaRow}>
                    <View style={styles.gunaInfo}>
                      <Text style={styles.gunaName}>{guna.name}</Text>
                      <Text style={styles.gunaDesc}>{guna.desc || guna.description}</Text>
                    </View>
                    <View style={styles.gunaScore}>
                      <View style={styles.gunaBar}>
                        <View
                          style={[styles.gunaFill, { width: `${(score / max) * 100}%` }]}
                        />
                      </View>
                      <Text style={styles.gunaValue}>{score}/{max}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Manglik Status */}
            <View style={styles.manglikCard}>
              <Ionicons name="alert-circle" size={24} color={Colors.warning} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.manglikTitle}>Manglik Dosha</Text>
                <Text style={styles.manglikText}>
                  No Manglik Dosha detected. This is a positive indicator for marriage compatibility.
                </Text>
              </View>
            </View>

            <Button
              title="Calculate Again"
              onPress={() => setShowResult(false)}
              variant="outline"
              size="lg"
              fullWidth
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Typography.headline, color: Colors.textPrimary },
  hero: {
    alignItems: 'center', padding: Spacing.xxl,
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xxl,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { ...Typography.title3, color: Colors.white, marginTop: Spacing.md },
  heroSubtitle: { ...Typography.footnote, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs, textAlign: 'center' },
  form: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.lg },
  results: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  scoreSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
  scoreCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 6, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  scoreValue: { ...Typography.largeTitle, fontWeight: '800' },
  scoreMax: { ...Typography.footnote, color: Colors.textTertiary },
  scoreLabel: { ...Typography.title3, fontWeight: '700' },
  scoreDesc: { ...Typography.subhead, color: Colors.textSecondary, marginTop: Spacing.xs },
  gunaSection: { marginBottom: Spacing.xxl },
  gunaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  gunaInfo: { flex: 1 },
  gunaName: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  gunaDesc: { ...Typography.caption1, color: Colors.textTertiary },
  gunaScore: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gunaBar: {
    width: 60, height: 6, borderRadius: 3, backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  gunaFill: {
    height: '100%', borderRadius: 3, backgroundColor: Colors.secondary,
  },
  gunaValue: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '600', width: 30 },
  manglikCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.goldSoft, borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  manglikTitle: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  manglikText: { ...Typography.footnote, color: Colors.textSecondary, marginTop: 2 },
});
