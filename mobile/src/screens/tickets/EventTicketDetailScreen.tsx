import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import {
  getEventById,
  formatEventDate,
  formatEventTime,
  formatPrice,
  seatsLeft,
  type TicketType,
} from '@/data/eventTickets';
import * as Haptics from '@/utils/haptics';

const InfoRow: React.FC<{ icon: string; label: string; value: string; onPress?: () => void }> = ({
  icon, label, value, onPress,
}) => (
  <TouchableOpacity
    style={styles.infoRow}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
  >
    <View style={styles.infoIcon}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, onPress && { color: Colors.primary }]}>{value}</Text>
    </View>
    {onPress && <Ionicons name="open-outline" size={16} color={Colors.primary} />}
  </TouchableOpacity>
);

export const EventTicketDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;
  const event = getEventById(eventId);
  const [selected, setSelected] = useState<TicketType | null>(event?.ticketTypes[0] || null);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: Spacing.xl }}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const left = seatsLeft(event);

  const proceed = () => {
    if (!selected || selected.remaining <= 0) return;
    Haptics.mediumTap();
    navigation.navigate('TicketCheckout', { eventId: event.id, ticketId: selected.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Event Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Banner */}
        <LinearGradient colors={event.bannerColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <Ionicons name={event.bannerIcon as any} size={56} color="rgba(255,255,255,0.95)" />
          <Text style={styles.bannerTitle}>{event.title}</Text>
        </LinearGradient>

        {/* Seats indicator */}
        <View style={styles.seatsCard}>
          <View>
            <Text style={styles.seatsLeftNum}>{left} / {event.capacity}</Text>
            <Text style={styles.seatsLeftLabel}>Seats left</Text>
          </View>
          <View style={styles.seatsBarTrack}>
            <View style={[styles.seatsBarFill, { width: `${Math.max(4, (left / event.capacity) * 100)}%` }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.section}>
          <InfoRow icon="calendar-outline" label="Date" value={formatEventDate(event.date)} />
          <InfoRow icon="time-outline" label="Time" value={formatEventTime(event.date)} />
          <InfoRow icon="business-outline" label="Venue" value={event.venue} />
          <InfoRow icon="navigate-outline" label="Location" value={event.address} onPress={() => Linking.openURL(event.mapUrl)} />
          <InfoRow icon="person-outline" label="Organizer" value={event.organizer} />
          {!!event.dressCode && <InfoRow icon="shirt-outline" label="Dress Code" value={event.dressCode} />}
          {!!event.parking && <InfoRow icon="car-outline" label="Parking" value={event.parking} />}
          <InfoRow icon="refresh-outline" label="Refund Policy" value={event.refundPolicy} />
        </View>

        {/* Ticket types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a ticket</Text>
          {event.ticketTypes.map((t) => {
            const active = selected?.id === t.id;
            const soldOut = t.remaining <= 0;
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.9}
                disabled={soldOut}
                onPress={() => { Haptics.selectionChanged(); setSelected(t); }}
                style={[styles.ticketCard, active && styles.ticketCardActive, soldOut && styles.ticketCardDisabled]}
              >
                <View style={styles.ticketHead}>
                  <LinearGradient colors={t.gradient as any} style={styles.ticketIcon}>
                    <Ionicons name={t.icon as any} size={20} color={Colors.white} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <View style={styles.ticketNameRow}>
                      <Text style={styles.ticketName}>{t.name}</Text>
                      {!!t.badge && (
                        <View style={styles.ticketBadge}>
                          <Text style={styles.ticketBadgeText}>{t.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.ticketRemaining}>
                      {soldOut ? 'Sold out' : `${t.remaining} left`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.ticketPrice}>{formatPrice(t.price)}</Text>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                    </View>
                  </View>
                </View>
                <View style={styles.benefits}>
                  {t.benefits.map((b, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky buy bar */}
      <View style={styles.buyBar}>
        <View>
          <Text style={styles.buyBarLabel}>{selected?.name || 'Select a ticket'}</Text>
          <Text style={styles.buyBarPrice}>{selected ? formatPrice(selected.price) : '—'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.buyBtn, (!selected || selected.remaining <= 0) && styles.buyBtnDisabled]}
          activeOpacity={0.9}
          disabled={!selected || selected.remaining <= 0}
          onPress={proceed}
        >
          <Ionicons name="ticket" size={18} color={Colors.white} />
          <Text style={styles.buyBtnText}>Buy Ticket</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  banner: { height: 180, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  bannerTitle: { ...Typography.title3, color: Colors.white, fontWeight: '800', textAlign: 'center', marginTop: Spacing.md },
  seatsCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    backgroundColor: Colors.white, margin: Spacing.lg, marginBottom: 0,
    padding: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.small,
  },
  seatsLeftNum: { ...Typography.title3, color: Colors.textPrimary, fontWeight: '800' },
  seatsLeftLabel: { ...Typography.caption1, color: Colors.textTertiary },
  seatsBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden' },
  seatsBarFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.success },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.md },
  description: { ...Typography.body, color: Colors.textSecondary, lineHeight: 23 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { ...Typography.caption1, color: Colors.textTertiary },
  infoValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
  ticketCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, borderWidth: 2, borderColor: Colors.border,
  },
  ticketCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  ticketCardDisabled: { opacity: 0.5 },
  ticketHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ticketIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ticketNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketName: { ...Typography.bodyBold, color: Colors.textPrimary },
  ticketBadge: { backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ticketBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  ticketRemaining: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 2 },
  ticketPrice: { ...Typography.title3, color: Colors.textPrimary, fontWeight: '800' },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderDark,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  benefits: { marginTop: Spacing.md, gap: 6 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { ...Typography.subhead, color: Colors.textSecondary },
  buyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  buyBarLabel: { ...Typography.caption1, color: Colors.textTertiary },
  buyBarPrice: { ...Typography.title3, color: Colors.textPrimary, fontWeight: '800' },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 26, paddingVertical: 14, ...Shadows.small,
  },
  buyBtnDisabled: { backgroundColor: Colors.textTertiary },
  buyBtnText: { ...Typography.bodyBold, color: Colors.white },
});

export default EventTicketDetailScreen;
