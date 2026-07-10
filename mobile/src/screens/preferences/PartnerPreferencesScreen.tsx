import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OptionSelector } from '@/components/ui/FilterChips';
import { profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import {
  RELIGIONS, EDUCATION_LEVELS, INCOME_RANGES,
  MOTHER_TONGUE, MARITAL_STATUS, DIET, MANGLIK_STATUS,
  BODY_TYPES, COMPLEXION, FAMILY_VALUES, FAMILY_STATUS,
} from '@/constants';
import * as Haptics from '@/utils/haptics';

interface Preferences {
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  maritalStatus: string[];
  religion: string[];
  motherTongue: string[];
  education: string[];
  income: string[];
  diet: string[];
  manglik: string;
  bodyType: string[];
  complexion: string[];
  familyValues: string[];
  familyStatus: string[];
  cities: string[];
  states: string[];
}

export const PartnerPreferencesScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    ageMin: 21, ageMax: 35,
    heightMin: 150, heightMax: 190,
    maritalStatus: [], religion: [], motherTongue: [],
    education: [], income: [], diet: [],
    manglik: '', bodyType: [], complexion: [],
    familyValues: [], familyStatus: [], cities: [], states: [],
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data } = await profileService.getPreferences();
      if (data.data) {
        setPrefs({ ...prefs, ...data.data });
      }
    } catch {} finally { setLoading(false); }
  };

  const savePreferences = async () => {
    setSaving(true);
    Haptics.lightTap();
    try {
      await profileService.updatePreferences(prefs);
      Haptics.success();
      Alert.alert('Saved!', 'Your partner preferences have been updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally { setSaving(false); }
  };

  const toggleMulti = (key: keyof Preferences, value: string) => {
    const current = prefs[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setPrefs({ ...prefs, [key]: updated });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Preferences</Text>
        <TouchableOpacity onPress={savePreferences} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Match Insight */}
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.insightCard}
        >
          <Ionicons name="sparkles" size={20} color={Colors.white} />
          <Text style={styles.insightText}>
            Setting clear preferences helps us find better matches for you
          </Text>
        </LinearGradient>

        {/* Age Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Preferences</Text>

          <View style={styles.rangeRow}>
            <Text style={styles.label}>Age Range</Text>
            <View style={styles.rangeValues}>
              <TouchableOpacity style={styles.rangeBtn}
                onPress={() => setPrefs({ ...prefs, ageMin: Math.max(18, prefs.ageMin - 1) })}>
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.rangeText}>{prefs.ageMin} - {prefs.ageMax} years</Text>
              <TouchableOpacity style={styles.rangeBtn}
                onPress={() => setPrefs({ ...prefs, ageMax: Math.min(60, prefs.ageMax + 1) })}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rangeRow}>
            <Text style={styles.label}>Height Range</Text>
            <View style={styles.rangeValues}>
              <TouchableOpacity style={styles.rangeBtn}
                onPress={() => setPrefs({ ...prefs, heightMin: Math.max(120, prefs.heightMin - 2) })}>
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.rangeText}>
                {Math.floor(prefs.heightMin / 30.48)}'{Math.round((prefs.heightMin % 30.48) / 2.54)}" - {Math.floor(prefs.heightMax / 30.48)}'{Math.round((prefs.heightMax % 30.48) / 2.54)}"
              </Text>
              <TouchableOpacity style={styles.rangeBtn}
                onPress={() => setPrefs({ ...prefs, heightMax: Math.min(220, prefs.heightMax + 2) })}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Marital Status */}
        <View style={styles.section}>
          <OptionSelector
            label="Marital Status"
            options={MARITAL_STATUS}
            selected={prefs.maritalStatus}
            onSelect={(v) => toggleMulti('maritalStatus', v)}
            multiSelect
          />
        </View>

        {/* Religion & Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Religion & Community</Text>
          <OptionSelector
            label="Religion"
            options={RELIGIONS}
            selected={prefs.religion}
            onSelect={(v) => toggleMulti('religion', v)}
            multiSelect
          />
          <OptionSelector
            label="Mother Tongue"
            options={MOTHER_TONGUE}
            selected={prefs.motherTongue}
            onSelect={(v) => toggleMulti('motherTongue', v)}
            multiSelect
          />
          <OptionSelector
            label="Manglik"
            options={MANGLIK_STATUS}
            selected={prefs.manglik}
            onSelect={(v) => setPrefs({ ...prefs, manglik: v })}
          />
        </View>

        {/* Education & Career */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Career</Text>
          <OptionSelector
            label="Education"
            options={EDUCATION_LEVELS}
            selected={prefs.education}
            onSelect={(v) => toggleMulti('education', v)}
            multiSelect
          />
          <OptionSelector
            label="Annual Income"
            options={INCOME_RANGES}
            selected={prefs.income}
            onSelect={(v) => toggleMulti('income', v)}
            multiSelect
          />
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <OptionSelector
            label="Diet"
            options={DIET}
            selected={prefs.diet}
            onSelect={(v) => toggleMulti('diet', v)}
            multiSelect
          />
          <OptionSelector
            label="Body Type"
            options={BODY_TYPES}
            selected={prefs.bodyType}
            onSelect={(v) => toggleMulti('bodyType', v)}
            multiSelect
          />
        </View>

        {/* Family */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Background</Text>
          <OptionSelector
            label="Family Values"
            options={FAMILY_VALUES}
            selected={prefs.familyValues}
            onSelect={(v) => toggleMulti('familyValues', v)}
            multiSelect
          />
          <OptionSelector
            label="Family Status"
            options={FAMILY_STATUS}
            selected={prefs.familyStatus}
            onSelect={(v) => toggleMulti('familyStatus', v)}
            multiSelect
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  saveText: { ...Typography.bodyBold, color: Colors.primary },
  insightCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  insightText: { ...Typography.subhead, color: Colors.white, flex: 1 },
  section: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl,
  },
  sectionTitle: { ...Typography.title3, color: Colors.textPrimary, marginBottom: Spacing.lg },
  rangeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  label: { ...Typography.body, color: Colors.textPrimary },
  rangeValues: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rangeBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rangeText: { ...Typography.bodyBold, color: Colors.primary, minWidth: 90, textAlign: 'center' },
});

export default PartnerPreferencesScreen;
