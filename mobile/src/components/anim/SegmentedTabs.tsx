import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';
import { useReducedMotion } from './useReducedMotion';

export interface SegmentTab {
  key: string;
  label: string;
  badge?: number;
}

interface SegmentedTabsProps {
  tabs: SegmentTab[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * SegmentedTabs (Section 4 — Micro-interactions)
 * A horizontal tab bar with a spring-animated underline that glides
 * between the active tab. Fires a light haptic on switch.
 */
export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ tabs, activeKey, onChange, style }) => {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [xs, setXs] = useState<Record<string, number>>({});
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineW = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  useEffect(() => {
    const x = xs[activeKey];
    const w = widths[activeKey];
    if (x == null || w == null) return;
    if (reducedMotion) {
      underlineX.setValue(x);
      underlineW.setValue(w);
      return;
    }
    Animated.parallel([
      Animated.spring(underlineX, { toValue: x, useNativeDriver: false, friction: 12, tension: 90 }),
      Animated.spring(underlineW, { toValue: w, useNativeDriver: false, friction: 12, tension: 90 }),
    ]).start();
  }, [activeKey, xs, widths, reducedMotion]);

  const onTabLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setXs((prev) => ({ ...prev, [key]: x }));
    setWidths((prev) => ({ ...prev, [key]: width }));
  };

  const handlePress = (key: string) => {
    if (key !== activeKey) Haptics.lightTap();
    onChange(key);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <Pressable key={tab.key} onLayout={onTabLayout(tab.key)} onPress={() => handlePress(tab.key)} style={styles.tab}>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
              {tab.badge ? (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {activeIndex >= 0 && (
        <Animated.View style={[styles.underline, { width: underlineW, transform: [{ translateX: underlineX }] }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  row: { flexDirection: 'row' },
  tab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  label: { ...Typography.subhead, color: Colors.textTertiary, fontWeight: '600' },
  labelActive: { color: Colors.primary, fontWeight: '700' },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.border,
  },
  badgeActive: { backgroundColor: Colors.primary },
  badgeText: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '700', fontSize: 10 },
  badgeTextActive: { color: Colors.white },
  underline: {
    height: 3, borderRadius: 2, backgroundColor: Colors.primary,
    position: 'absolute', bottom: -1, left: 0,
  },
});
