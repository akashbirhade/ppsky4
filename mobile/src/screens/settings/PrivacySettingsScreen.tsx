import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

export const PrivacySettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState({
    showOnline: true,
    showLastSeen: true,
    showProfilePhoto: 'everyone', // 'everyone', 'matches', 'premium'
    showPhone: false,
    showIncome: true,
    allowMessages: 'matches', // 'everyone', 'matches', 'none'
    showInSearch: true,
    hideFromContacts: false,
    readReceipts: true,
    activityStatus: true,
  });

  const toggleSetting = (key: string) => {
    Haptics.selectionChanged();
    setSettings((s: any) => ({ ...s, [key]: !s[key] }));
  };

  const saveSettings = async () => {
    try {
      await profileService.updateProfile({ privacySettings: settings });
      Haptics.success();
      Alert.alert('Saved', 'Privacy settings updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const SettingRow = ({ icon, title, subtitle, value, onToggle }: any) => (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: icon.color + '14' }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textTertiary}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <TouchableOpacity onPress={saveSettings}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Visibility</Text>
          <SettingRow
            icon={{ name: 'eye-outline', color: Colors.primary }}
            title="Show in Search Results"
            subtitle="Your profile will appear when others search"
            value={settings.showInSearch}
            onToggle={() => toggleSetting('showInSearch')}
          />
          <SettingRow
            icon={{ name: 'person-outline', color: Colors.info }}
            title="Hide from Contacts"
            subtitle="Your phone contacts won't see your profile"
            value={settings.hideFromContacts}
            onToggle={() => toggleSetting('hideFromContacts')}
          />
        </View>

        {/* Online Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity & Status</Text>
          <SettingRow
            icon={{ name: 'ellipse', color: Colors.success }}
            title="Show Online Status"
            subtitle="Others can see when you're active"
            value={settings.showOnline}
            onToggle={() => toggleSetting('showOnline')}
          />
          <SettingRow
            icon={{ name: 'time-outline', color: Colors.gold }}
            title="Show Last Seen"
            subtitle="Show when you were last active"
            value={settings.showLastSeen}
            onToggle={() => toggleSetting('showLastSeen')}
          />
          <SettingRow
            icon={{ name: 'pulse-outline', color: Colors.secondary }}
            title="Activity Status"
            subtitle="Show profile viewing activity"
            value={settings.activityStatus}
            onToggle={() => toggleSetting('activityStatus')}
          />
        </View>

        {/* Information Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Visibility</Text>
          <SettingRow
            icon={{ name: 'call-outline', color: Colors.success }}
            title="Show Phone Number"
            subtitle="Display your phone to matched users"
            value={settings.showPhone}
            onToggle={() => toggleSetting('showPhone')}
          />
          <SettingRow
            icon={{ name: 'cash-outline', color: Colors.gold }}
            title="Show Annual Income"
            subtitle="Display income on your profile"
            value={settings.showIncome}
            onToggle={() => toggleSetting('showIncome')}
          />
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <SettingRow
            icon={{ name: 'checkmark-done-outline', color: Colors.primary }}
            title="Read Receipts"
            subtitle="Let others know you've read their messages"
            value={settings.readReceipts}
            onToggle={() => toggleSetting('readReceipts')}
          />
        </View>

        {/* Photo Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Privacy</Text>
          <Text style={styles.sectionDesc}>Who can see your profile photos?</Text>
          {(['everyone', 'matches', 'premium'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioRow, settings.showProfilePhoto === opt && styles.radioRowActive]}
              onPress={() => {
                Haptics.selectionChanged();
                setSettings({ ...settings, showProfilePhoto: opt });
              }}
            >
              <View style={[styles.radio, settings.showProfilePhoto === opt && styles.radioActive]}>
                {settings.showProfilePhoto === opt && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>
                {opt === 'everyone' ? 'Everyone' : opt === 'matches' ? 'Only Matches' : 'Premium Members Only'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  saveText: { ...Typography.bodyBold, color: Colors.primary },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.md },
  sectionDesc: { ...Typography.subhead, color: Colors.textTertiary, marginBottom: Spacing.md },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  settingContent: { flex: 1, marginLeft: Spacing.md },
  settingTitle: { ...Typography.body, color: Colors.textPrimary },
  settingSubtitle: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 2 },
  radioRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  radioRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: Colors.borderDark, alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  radioText: { ...Typography.body, color: Colors.textPrimary, marginLeft: Spacing.md },
});

export default PrivacySettingsScreen;
