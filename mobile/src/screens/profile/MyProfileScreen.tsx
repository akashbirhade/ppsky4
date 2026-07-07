import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const MyProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const profile = user?.profile;
  const mainPhoto = user?.photos?.find((p) => p.isMain)?.url;
  const subscription = user?.subscription;

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile', color: Colors.primary },
    { icon: 'diamond-outline', label: 'Premium Plans', screen: 'Premium', color: Colors.gold },
    { icon: 'planet-outline', label: 'Kundali Match', screen: 'Kundali', color: Colors.secondary },
    { icon: 'eye-outline', label: 'Who Viewed Me', screen: 'ProfileViews', color: Colors.info },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings', color: Colors.textSecondary },
    { icon: 'shield-checkmark-outline', label: 'Verification', screen: 'Verification', color: Colors.success },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help', color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            {mainPhoto ? (
              <Image source={{ uri: mainPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={Colors.textTertiary} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {profile?.firstName || user?.username} {profile?.lastName || ''}
          </Text>
          <Text style={styles.location}>
            {profile?.city ? `${profile.city}, ${profile?.state || ''}` : 'Add your location'}
          </Text>

          {/* Subscription Badge */}
          {subscription?.plan && subscription.plan !== 'FREE' && (
            <LinearGradient
              colors={Colors.gradientGold as any}
              style={styles.subscriptionBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="diamond" size={14} color={Colors.white} />
              <Text style={styles.subscriptionText}>{subscription.plan} Member</Text>
            </LinearGradient>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(profile as any)?.profileViews || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(profile as any)?.likesReceived || 0}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.photos?.length || 0}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
          </View>
        </View>

        {/* Profile Completion */}
        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Profile Completion</Text>
            <Text style={styles.completionPercent}>{profile?.profileCompletionPercentage || 0}%</Text>
          </View>
          <View style={styles.completionBar}>
            <LinearGradient
              colors={Colors.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.completionFill, { width: `${profile?.profileCompletionPercentage || 0}%` }]}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Soulmate Sync v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: Colors.white },
  settingsBtn: {
    position: 'absolute', top: Spacing.lg, right: Spacing.xl,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.lg },
  avatar: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
  },
  name: { ...Typography.title2, color: Colors.textPrimary },
  location: { ...Typography.subhead, color: Colors.textSecondary, marginTop: 4 },
  subscriptionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, marginTop: Spacing.md,
  },
  subscriptionText: { ...Typography.caption1, color: Colors.white, fontWeight: '700' },
  stats: {
    flexDirection: 'row', marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xxxl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.title3, color: Colors.textPrimary },
  statLabel: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  completionSection: {
    backgroundColor: Colors.white, marginTop: Spacing.md,
    padding: Spacing.xl, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  completionTitle: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  completionPercent: { ...Typography.subhead, fontWeight: '700', color: Colors.primary },
  completionBar: {
    height: 8, borderRadius: 4, backgroundColor: Colors.background, overflow: 'hidden',
  },
  completionFill: { height: '100%', borderRadius: 4 },
  menu: {
    backgroundColor: Colors.white, marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
    ...Shadows.small, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1, marginLeft: Spacing.md },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  logoutText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
  version: { ...Typography.caption2, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.md },
});
