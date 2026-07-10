import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface FilterChipsProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options, selected, onToggle, multiSelect = true
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {options.map((opt) => {
      const isActive = selected.includes(opt);
      return (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onToggle(opt)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

interface OptionSelectorProps {
  label: string;
  options: readonly string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  label, options, selected, onSelect, multiSelect = false
}) => {
  const isSelected = (opt: string) =>
    multiSelect ? (selected as string[]).includes(opt) : selected === opt;

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.optionsGrid}>
        {options.map((opt) => {
          const active = isSelected(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectorContainer: {
    marginBottom: Spacing.xl,
  },
  selectorLabel: {
    ...Typography.headline,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  optionActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
