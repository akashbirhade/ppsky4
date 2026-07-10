import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RELIGIONS, EDUCATION_LEVELS, INCOME_RANGES,
  MARITAL_STATUS, MOTHER_TONGUE, DIET, FAMILY_TYPE,
  FAMILY_STATUS,
} from '@/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  // Quick Filters (frequently used)
  city: string;
  country: string;
  minAge: string;
  maxAge: string;
  minHeight: string;
  maxHeight: string;
  education: string[];
  profession: string;
  industry: string;
  income: string[];
  maritalStatus: string[];
  diet: string[];
  onlineNow: boolean;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  recentlyJoined: boolean;
  withPhotoOnly: boolean;
  hasChildren: string;
  // Partner Preferences (stable, less commonly changed)
  religion: string[];
  community: string;
  subCommunity: string;
  motherTongue: string[];
  familyType: string[];
  familyStatus: string[];
}

const DEFAULT_FILTERS: FilterState = {
  city: '', country: '', minAge: '18', maxAge: '40',
  minHeight: '', maxHeight: '', education: [], profession: '',
  industry: '', income: [], maritalStatus: [], diet: [],
  onlineNow: false, verifiedOnly: false, premiumOnly: false,
  recentlyJoined: false, withPhotoOnly: true, hasChildren: 'any',
  religion: [], community: '', subCommunity: '', motherTongue: [],
  familyType: [], familyStatus: [],
};

const FILTERS_STORAGE_KEY = '@search_filters_v2';

interface SearchFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  matchCount?: number;
}

const PROFESSIONS = [
  'Software Engineer', 'Doctor', 'Chartered Accountant', 'Business Owner',
  'Teacher/Professor', 'Government Job', 'Lawyer', 'Manager', 'Banking',
  'Civil Services', 'Armed Forces', 'Architect', 'Scientist', 'Other',
] as const;

const INDUSTRIES = [
  'IT/Software', 'Healthcare', 'Finance/Banking', 'Education', 'Government',
  'Manufacturing', 'Real Estate', 'Media', 'Consulting', 'Other',
] as const;

export const SearchFilter: React.FC<SearchFilterProps> = ({ visible, onClose, onApply, matchCount }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [moreExpanded, setMoreExpanded] = useState(false);

  // Load saved filters on mount
  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(FILTERS_STORAGE_KEY).then((saved) => {
        if (saved) {
          try { setFilters({ ...DEFAULT_FILTERS, ...JSON.parse(saved) }); } catch {}
        }
      });
    }
  }, [visible]);

  const toggleMulti = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters((f) => ({ ...f, [key]: updated }));
  };

  const handleApply = () => {
    AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters)).catch(() => {});
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    AsyncStorage.removeItem(FILTERS_STORAGE_KEY).catch(() => {});
  };

  const activeCount = [
    filters.religion.length, filters.education.length, filters.maritalStatus.length,
    filters.motherTongue.length, filters.income.length, filters.diet.length,
    filters.familyType.length, filters.familyStatus.length,
    filters.city ? 1 : 0, filters.country ? 1 : 0, filters.profession ? 1 : 0,
    filters.industry ? 1 : 0, filters.community ? 1 : 0, filters.subCommunity ? 1 : 0,
    filters.verifiedOnly ? 1 : 0, filters.premiumOnly ? 1 : 0,
    filters.onlineNow ? 1 : 0, filters.recentlyJoined ? 1 : 0,
    filters.hasChildren !== 'any' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Active filter chips for removal display
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filters.city) activeChips.push({ label: `📍 ${filters.city}`, onRemove: () => setFilters(f => ({ ...f, city: '' })) });
  if (filters.country) activeChips.push({ label: `🌎 ${filters.country}`, onRemove: () => setFilters(f => ({ ...f, country: '' })) });
  if (filters.verifiedOnly) activeChips.push({ label: '✅ Verified', onRemove: () => setFilters(f => ({ ...f, verifiedOnly: false })) });
  if (filters.premiumOnly) activeChips.push({ label: '⭐ Premium', onRemove: () => setFilters(f => ({ ...f, premiumOnly: false })) });
  if (filters.onlineNow) activeChips.push({ label: '🟢 Online', onRemove: () => setFilters(f => ({ ...f, onlineNow: false })) });
  if (filters.recentlyJoined) activeChips.push({ label: '🆕 New', onRemove: () => setFilters(f => ({ ...f, recentlyJoined: false })) });
  filters.religion.forEach(r => activeChips.push({ label: `🕌 ${r}`, onRemove: () => toggleMulti('religion', r) }));
  filters.education.forEach(e => activeChips.push({ label: `🎓 ${e}`, onRemove: () => toggleMulti('education', e) }));
  filters.motherTongue.forEach(m => activeChips.push({ label: `🗣 ${m}`, onRemove: () => toggleMulti('motherTongue', m) }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Search Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Active chips (removable) */}
        {activeChips.length > 0 && (
          <View style={styles.activeChipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipsRow}>
              {activeChips.map((chip, i) => (
                <TouchableOpacity key={i} style={styles.activeChip} onPress={chip.onRemove}>
                  <Text style={styles.activeChipText}>{chip.label}</Text>
                  <Ionicons name="close-circle" size={14} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ═══════════ QUICK FILTERS ═══════════ */}
          <Text style={styles.sectionHeader}>⚡ Quick Filters</Text>

          {/* Toggle chips */}
          <View style={styles.toggleGrid}>
            <ToggleChip label="🟢 Online Now" active={filters.onlineNow} onToggle={() => setFilters(f => ({ ...f, onlineNow: !f.onlineNow }))} />
            <ToggleChip label="✅ Verified" active={filters.verifiedOnly} onToggle={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))} />
            <ToggleChip label="⭐ Premium" active={filters.premiumOnly} onToggle={() => setFilters(f => ({ ...f, premiumOnly: !f.premiumOnly }))} />
            <ToggleChip label="🆕 New" active={filters.recentlyJoined} onToggle={() => setFilters(f => ({ ...f, recentlyJoined: !f.recentlyJoined }))} />
            <ToggleChip label="🖼 Photo" active={filters.withPhotoOnly} onToggle={() => setFilters(f => ({ ...f, withPhotoOnly: !f.withPhotoOnly }))} />
          </View>

          {/* Location */}
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="City" value={filters.city} onChangeText={(v) => setFilters(f => ({ ...f, city: v }))} icon="location-outline" placeholder="Any city" />
            </View>
            <View style={styles.halfInput}>
              <Input label="Country" value={filters.country} onChangeText={(v) => setFilters(f => ({ ...f, country: v }))} icon="globe-outline" placeholder="India" />
            </View>
          </View>

          {/* Age Range */}
          <Text style={styles.sectionTitle}>👤 Age Range</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="From" value={filters.minAge} onChangeText={(v) => setFilters(f => ({ ...f, minAge: v }))} keyboardType="numeric" />
            </View>
            <View style={styles.halfInput}>
              <Input label="To" value={filters.maxAge} onChangeText={(v) => setFilters(f => ({ ...f, maxAge: v }))} keyboardType="numeric" />
            </View>
          </View>

          {/* Height */}
          <Text style={styles.sectionTitle}>📏 Height (cm)</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="Min" value={filters.minHeight} onChangeText={(v) => setFilters(f => ({ ...f, minHeight: v }))} keyboardType="numeric" placeholder="150" />
            </View>
            <View style={styles.halfInput}>
              <Input label="Max" value={filters.maxHeight} onChangeText={(v) => setFilters(f => ({ ...f, maxHeight: v }))} keyboardType="numeric" placeholder="190" />
            </View>
          </View>

          {/* Education */}
          <Text style={styles.sectionTitle}>🎓 Education</Text>
          <View style={styles.chipRow}>
            {EDUCATION_LEVELS.map((e) => (
              <TouchableOpacity key={e} style={[styles.chip, filters.education.includes(e) && styles.chipActive]} onPress={() => toggleMulti('education', e)}>
                <Text style={[styles.chipText, filters.education.includes(e) && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Profession */}
          <Text style={styles.sectionTitle}>💼 Profession</Text>
          <View style={styles.chipRow}>
            {PROFESSIONS.map((p) => (
              <TouchableOpacity key={p} style={[styles.chip, filters.profession === p && styles.chipActive]} onPress={() => setFilters(f => ({ ...f, profession: f.profession === p ? '' : p }))}>
                <Text style={[styles.chipText, filters.profession === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Industry */}
          <Text style={styles.sectionTitle}>🏢 Industry</Text>
          <View style={styles.chipRow}>
            {INDUSTRIES.map((ind) => (
              <TouchableOpacity key={ind} style={[styles.chip, filters.industry === ind && styles.chipActive]} onPress={() => setFilters(f => ({ ...f, industry: f.industry === ind ? '' : ind }))}>
                <Text style={[styles.chipText, filters.industry === ind && styles.chipTextActive]}>{ind}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Income */}
          <Text style={styles.sectionTitle}>💰 Annual Income</Text>
          <View style={styles.chipRow}>
            {INCOME_RANGES.map((inc) => (
              <TouchableOpacity key={inc} style={[styles.chip, filters.income.includes(inc) && styles.chipActive]} onPress={() => toggleMulti('income', inc)}>
                <Text style={[styles.chipText, filters.income.includes(inc) && styles.chipTextActive]}>{inc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Marital Status */}
          <Text style={styles.sectionTitle}>❤️ Marital Status</Text>
          <View style={styles.chipRow}>
            {MARITAL_STATUS.map((s) => (
              <TouchableOpacity key={s} style={[styles.chip, filters.maritalStatus.includes(s) && styles.chipActive]} onPress={() => toggleMulti('maritalStatus', s)}>
                <Text style={[styles.chipText, filters.maritalStatus.includes(s) && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Diet */}
          <Text style={styles.sectionTitle}>🍽 Diet</Text>
          <View style={styles.chipRow}>
            {DIET.map((d) => (
              <TouchableOpacity key={d} style={[styles.chip, filters.diet.includes(d) && styles.chipActive]} onPress={() => toggleMulti('diet', d)}>
                <Text style={[styles.chipText, filters.diet.includes(d) && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ═══════════ PARTNER PREFERENCES (Collapsible) ═══════════ */}
          <TouchableOpacity style={styles.moreHeader} onPress={() => setMoreExpanded(!moreExpanded)}>
            <Text style={styles.sectionHeader}>🔒 Partner Preferences</Text>
            <View style={styles.moreToggle}>
              <Text style={styles.moreToggleText}>{moreExpanded ? 'Hide' : 'Show'}</Text>
              <Ionicons name={moreExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.moreSubtitle}>Stable criteria — configure once for long-term matching</Text>

          {moreExpanded && (
            <View style={styles.moreSection}>
              {/* Religion */}
              <Text style={styles.sectionTitle}>🕌 Religion</Text>
              <View style={styles.chipRow}>
                {RELIGIONS.map((r) => (
                  <TouchableOpacity key={r} style={[styles.chip, filters.religion.includes(r) && styles.chipActive]} onPress={() => toggleMulti('religion', r)}>
                    <Text style={[styles.chipText, filters.religion.includes(r) && styles.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Community */}
              <Text style={styles.sectionTitle}>👥 Community / Caste</Text>
              <Input value={filters.community} onChangeText={(v) => setFilters(f => ({ ...f, community: v }))} placeholder="Enter community" icon="people-outline" />

              {/* Sub-community */}
              <Text style={styles.sectionTitle}>🧬 Sub-Community</Text>
              <Input value={filters.subCommunity} onChangeText={(v) => setFilters(f => ({ ...f, subCommunity: v }))} placeholder="Enter sub-community" icon="git-branch-outline" />

              {/* Mother Tongue */}
              <Text style={styles.sectionTitle}>🗣 Mother Tongue</Text>
              <View style={styles.chipRow}>
                {MOTHER_TONGUE.map((m) => (
                  <TouchableOpacity key={m} style={[styles.chip, filters.motherTongue.includes(m) && styles.chipActive]} onPress={() => toggleMulti('motherTongue', m)}>
                    <Text style={[styles.chipText, filters.motherTongue.includes(m) && styles.chipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Family Type */}
              <Text style={styles.sectionTitle}>👨‍👩‍👧 Family Type</Text>
              <View style={styles.chipRow}>
                {FAMILY_TYPE.map((ft) => (
                  <TouchableOpacity key={ft} style={[styles.chip, filters.familyType.includes(ft) && styles.chipActive]} onPress={() => toggleMulti('familyType', ft)}>
                    <Text style={[styles.chipText, filters.familyType.includes(ft) && styles.chipTextActive]}>{ft}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Family Status */}
              <Text style={styles.sectionTitle}>🏠 Family Status</Text>
              <View style={styles.chipRow}>
                {FAMILY_STATUS.map((fs) => (
                  <TouchableOpacity key={fs} style={[styles.chip, filters.familyStatus.includes(fs) && styles.chipActive]} onPress={() => toggleMulti('familyStatus', fs)}>
                    <Text style={[styles.chipText, filters.familyStatus.includes(fs) && styles.chipTextActive]}>{fs}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {matchCount !== undefined && (
            <Text style={styles.matchCountText}>{matchCount} profile{matchCount !== 1 ? 's' : ''} match</Text>
          )}
          <Button
            title={`Apply Filters${activeCount > 0 ? ` (${activeCount})` : ''}`}
            onPress={handleApply}
            variant="gradient"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Toggle Chip ──────────────────────────────────────────────────────────────

const ToggleChip: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <TouchableOpacity style={[styles.toggleChip, active && styles.toggleChipActive]} onPress={onToggle}>
    <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Typography.headline, color: Colors.textPrimary },
  resetText: { ...Typography.subhead, color: Colors.error, fontWeight: '600' },

  // Active chips
  activeChipsWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.sm },
  activeChipsRow: { paddingHorizontal: 20, gap: 8, flexDirection: 'row' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primaryMuted,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  activeChipText: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  sectionHeader: { ...Typography.bodyBold, color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: 4 },
  sectionTitle: {
    ...Typography.footnote, color: Colors.textPrimary,
    marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700',
  },

  toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  toggleChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  toggleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleChipText: { ...Typography.caption1, color: Colors.textSecondary, fontWeight: '600' },
  toggleChipTextActive: { color: Colors.white },

  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  chipText: { ...Typography.caption1, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },

  moreHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.xxl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  moreToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moreToggleText: { ...Typography.footnote, color: Colors.primary, fontWeight: '700' },
  moreSubtitle: { ...Typography.caption1, color: Colors.textTertiary, marginBottom: Spacing.md },
  moreSection: { marginTop: Spacing.sm },

  footer: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: Colors.border },
  matchCountText: { ...Typography.footnote, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
});
