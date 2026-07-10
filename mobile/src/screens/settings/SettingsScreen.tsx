import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuthStore();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
        { icon: 'images-outline', label: 'Manage Photos', action: () => navigation.navigate('EditProfile') },
        { icon: 'heart-outline', label: 'Partner Preferences', action: () => navigation.navigate('PartnerPreferences') },
        { icon: 'shield-checkmark-outline', label: 'Verification', action: () => navigation.navigate('Verification') },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: 'lock-closed-outline', label: 'Privacy Settings', action: () => navigation.navigate('PrivacySettings') },
        { icon: 'eye-off-outline', label: 'Profile Visibility', toggle: true },
        { icon: 'hand-left-outline', label: 'Blocked Users', action: () => {} },
        { icon: 'location-outline', label: 'Location Sharing', toggle: true },
        { icon: 'notifications-outline', label: 'Push Notifications', toggle: true },
        { icon: 'chatbubble-outline', label: 'WhatsApp Visibility', toggle: true },
      ],
    },
    {
      title: 'Premium',
      items: [
        { icon: 'diamond-outline', label: 'Subscription Plans', action: () => navigation.navigate('Premium') },
        { icon: 'rocket-outline', label: 'Boost Profile', action: () => navigation.navigate('ProfileBoost') },
        { icon: 'call-outline', label: 'Call History', action: () => {} },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { icon: 'globe-outline', label: 'Language', value: 'English' },
        { icon: 'moon-outline', label: 'Dark Mode', toggle: true },
        { icon: 'phone-portrait-outline', label: 'App Icon', action: () => {} },
        { icon: 'trash-outline', label: 'Clear Cache', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & FAQ', action: () => {} },
        { icon: 'chatbox-outline', label: 'Contact Support', action: () => {} },
        { icon: 'flag-outline', label: 'Report a Problem', action: () => {} },
        { icon: 'document-text-outline', label: 'Terms & Privacy', action: () => {} },
        { icon: 'heart-circle-outline', label: 'Success Stories', action: () => navigation.navigate('SuccessStories') },
      ],
    },
  ];

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Sections */}
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.item, ii < section.items.length - 1 && styles.itemBorder]}
                  onPress={item.action}
                  disabled={!!item.toggle}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                      thumbColor={Colors.white}
                      value={true}
                    />
                  ) : item.value ? (
                    <View style={styles.itemRight}>
                      <Text style={styles.itemValue}>{item.value}</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Soulmate Sync v1.0.0 • Build 1</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Typography.headline, color: Colors.textPrimary },
  section: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  sectionTitle: {
    ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: Spacing.sm, marginLeft: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    ...Shadows.small, overflow: 'hidden',
  },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemLabel: { ...Typography.body, color: Colors.textPrimary },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  itemValue: { ...Typography.subhead, color: Colors.textTertiary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  logoutText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
  deleteBtn: { alignItems: 'center', marginTop: Spacing.lg },
  deleteText: { ...Typography.subhead, color: Colors.textTertiary, textDecorationLine: 'underline' },
  version: {
    ...Typography.caption2, color: Colors.textTertiary,
    textAlign: 'center', marginVertical: Spacing.xxl,
  },
});
