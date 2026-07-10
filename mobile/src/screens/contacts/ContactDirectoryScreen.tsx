import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { matchService } from '@/services';
import { useAuthStore } from '@/store/authStore';

interface ContactItem {
  id: string;
  name: string;
  age: number;
  city: string;
  photo: string;
  phone?: string;
  whatsapp?: string;
  matchDate: string;
}

export const ContactDirectoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = user?.subscription?.plan !== 'free';

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await matchService.getReceivedLikes();
      const items = (res.data?.profiles || []).map((m: any) => ({
        id: m.id,
        name: `${m.profile?.firstName || ''} ${m.profile?.lastName?.[0] || ''}.`,
        age: m.profile?.age || 0,
        city: m.profile?.city || '',
        photo: m.user?.photos?.[0]?.url || 'https://via.placeholder.com/80',
        phone: m.profile?.whatsappNumber,
        whatsapp: m.profile?.whatsappVisible ? m.profile?.whatsappNumber : undefined,
        matchDate: m.matchedAt || '',
      }));
      setContacts(items);
    } catch {
      // Use empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Hi ${name}, I found your profile on SoulMate Sync!`);
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
  };

  const renderContact = ({ item }: { item: ContactItem }) => (
    <View style={styles.contactCard}>
      <TouchableOpacity
        style={styles.contactInfo}
        onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })}
      >
        <Image source={{ uri: item.photo }} style={styles.contactPhoto} />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactSub}>{item.age} yrs • {item.city}</Text>
          {isPremium && item.phone && (
            <Text style={styles.contactPhone}>{item.phone}</Text>
          )}
        </View>
      </TouchableOpacity>
      {isPremium && item.phone ? (
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(item.phone!)}>
            <Ionicons name="call" size={18} color={Colors.success} />
          </TouchableOpacity>
          {item.whatsapp && (
            <TouchableOpacity style={[styles.actionBtn, styles.waBtn]} onPress={() => handleWhatsApp(item.whatsapp!, item.name)}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.lockedBadge}>
          <Ionicons name="lock-closed" size={14} color={Colors.gold} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Directory</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isPremium && (
        <View style={styles.premiumBanner}>
          <Ionicons name="diamond" size={20} color={Colors.gold} />
          <Text style={styles.premiumText}>Upgrade to Premium to view phone numbers</Text>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Contacts Yet</Text>
            <Text style={styles.emptySub}>
              Match with profiles to see their contact details here
            </Text>
          </View>
        }
      />
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
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.goldSoft, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  premiumText: { ...Typography.caption1, color: Colors.goldDark, flex: 1, marginLeft: Spacing.sm },
  upgradeBtn: {
    backgroundColor: Colors.gold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  upgradeBtnText: { ...Typography.caption1, color: Colors.white, fontWeight: '700' },
  list: { padding: Spacing.xl },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  contactInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  contactPhoto: { width: 52, height: 52, borderRadius: 26 },
  contactDetails: { marginLeft: Spacing.md, flex: 1 },
  contactName: { ...Typography.bodyBold, color: Colors.textPrimary },
  contactSub: { ...Typography.caption1, color: Colors.textSecondary },
  contactPhone: { ...Typography.caption1, color: Colors.primary, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.successSoft, alignItems: 'center', justifyContent: 'center',
  },
  waBtn: { backgroundColor: '#E8F5E9' },
  lockedBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.goldSoft, alignItems: 'center', justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { ...Typography.bodyBold, color: Colors.textPrimary, marginTop: Spacing.md },
  emptySub: { ...Typography.caption1, color: Colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' },
});
