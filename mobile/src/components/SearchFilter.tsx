import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface FilterState {
  minAge: string;
  maxAge: string;
  religion: string;
  city: string;
  education: string;
  minHeight: string;
  maxHeight: string;
}

interface SearchFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ visible, onClose, onApply }) => {
  const [filters, setFilters] = useState<FilterState>({
    minAge: '18',
    maxAge: '35',
    religion: '',
    city: '',
    education: '',
    minHeight: '',
    maxHeight: '',
  });

  const update = (key: keyof FilterState, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({ minAge: '18', maxAge: '35', religion: '', city: '', education: '', minHeight: '', maxHeight: '' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Preferences</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Age Range */}
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="From" value={filters.minAge} onChangeText={(v) => update('minAge', v)} keyboardType="numeric" />
            </View>
            <View style={styles.halfInput}>
              <Input label="To" value={filters.maxAge} onChangeText={(v) => update('maxAge', v)} keyboardType="numeric" />
            </View>
          </View>

          {/* Religion */}
          <Text style={styles.sectionTitle}>Religion</Text>
          <View style={styles.chipRow}>
            {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Any'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, filters.religion === r && styles.chipActive]}
                onPress={() => update('religion', filters.religion === r ? '' : r)}
              >
                <Text style={[styles.chipText, filters.religion === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* City */}
          <Input
            label="Preferred City"
            value={filters.city}
            onChangeText={(v) => update('city', v)}
            icon="location-outline"
            placeholder="Any city"
          />

          {/* Education */}
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.chipRow}>
            {['B.Tech', 'MBBS', 'MBA', 'CA', 'PhD', 'M.Tech', 'Other'].map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.chip, filters.education === e && styles.chipActive]}
                onPress={() => update('education', filters.education === e ? '' : e)}
              >
                <Text style={[styles.chipText, filters.education === e && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Height Range */}
          <Text style={styles.sectionTitle}>Height (cm)</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="Min" value={filters.minHeight} onChangeText={(v) => update('minHeight', v)} keyboardType="numeric" placeholder="150" />
            </View>
            <View style={styles.halfInput}>
              <Input label="Max" value={filters.maxHeight} onChangeText={(v) => update('maxHeight', v)} keyboardType="numeric" placeholder="190" />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <Button title="Apply Filters" onPress={handleApply} variant="gradient" size="lg" fullWidth />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

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
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  resetText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: Colors.textPrimary,
    marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryMuted,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30 },
});
