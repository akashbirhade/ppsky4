import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useTicketStore, type Booking, type BookingStatus } from '@/store/ticketStore';
import { getEventById, formatEventDate, formatEventTime, formatPrice } from '@/data/eventTickets';
import { QRCode } from '@/components/QRCode';
import * as Haptics from '@/utils/haptics';

const STATUS_META: Record<BookingStatus, { label: string; color: string; soft: string }> = {
  upcoming: { label: 'Upcoming', color: Colors.successDark, soft: Colors.successSoft },
  used: { label: 'Used', color: Colors.textTertiary, soft: Colors.divider },
  expired: { label: 'Expired', color: Colors.warning, soft: Colors.goldSoft },
  cancelled: { label: 'Cancelled', color: Colors.loveDark, soft: Colors.loveSoft },
};

// Derive a display status (event in the past becomes "used").
const displayStatus = (b: Booking): BookingStatus => {
  if (b.status === 'cancelled') return 'cancelled';
  if (new Date(b.eventDate).getTime() < Date.now()) return 'used';
  return b.status;
};

export const MyTicketsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const bookings = useTicketStore((s) => s.bookings);
  const cancelBooking = useTicketStore((s) => s.cancelBooking);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  const confirmCancel = (b: Booking) => {
    Alert.alert('Cancel Ticket', `Cancel your ${b.ticketTypeName} for "${b.eventTitle}"?`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel Ticket', style: 'destructive', onPress: () => { Haptics.warning?.(); cancelBooking(b.id); } },
    ]);
  };

  const renderTicket = ({ item }: { item: Booking }) => {
    const status = displayStatus(item);
    const meta = STATUS_META[status];
    const event = getEventById(item.eventId);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.eventTitle}</Text>
            <Text style={styles.ticketType}>{item.ticketTypeName} · {formatPrice(item.price)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: meta.soft }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.miniQr}>
            <QRCode value={item.qrData} size={72} padding={6} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.metaRow}>
              <Ionicons name="pricetag-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{item.ticketNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{formatEventDate(item.eventDate)} · {formatEventTime(item.eventDate)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.showQrBtn}
            activeOpacity={0.85}
            onPress={() => { Haptics.lightTap(); setQrBooking(item); }}
          >
            <Ionicons name="qr-code-outline" size={16} color={Colors.white} />
            <Text style={styles.showQrText}>Show QR</Text>
          </TouchableOpacity>
          {status === 'upcoming' && (
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={() => confirmCancel(item)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {!!event && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EventTicketDetail', { eventId: item.eventId })}
            >
              <Text style={styles.cancelText}>Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="ticket-outline" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptySub}>Browse events and book your pass to see tickets here.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('EventTickets')}>
              <Text style={styles.browseBtnText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* QR modal */}
      <Modal visible={!!qrBooking} transparent animationType="fade" onRequestClose={() => setQrBooking(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setQrBooking(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{qrBooking?.eventTitle}</Text>
            <Text style={styles.modalType}>{qrBooking?.ticketTypeName}</Text>
            {qrBooking && (
              <View style={styles.modalQr}>
                <QRCode value={qrBooking.qrData} size={230} />
              </View>
            )}
            <Text style={styles.modalTicketNo}>{qrBooking?.ticketNumber}</Text>
            <Text style={styles.modalHint}>Show this code at the event entrance</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setQrBooking(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  list: { padding: Spacing.lg, paddingBottom: 40, flexGrow: 1 },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.small },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  eventTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  ticketType: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { ...Typography.caption1, fontWeight: '700' },
  cardRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, alignItems: 'center' },
  miniQr: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, overflow: 'hidden' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...Typography.caption1, color: Colors.textSecondary, flex: 1 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  showQrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  showQrText: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },
  cancelBtn: {
    borderRadius: BorderRadius.full, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.borderDark,
  },
  cancelText: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.huge },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, fontWeight: '700' },
  emptySub: { ...Typography.subhead, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: Spacing.xxl },
  browseBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xxl, paddingVertical: 13 },
  browseBtnText: { ...Typography.bodyBold, color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.xxl, alignItems: 'center', width: '100%', maxWidth: 340 },
  modalTitle: { ...Typography.headline, color: Colors.textPrimary, textAlign: 'center' },
  modalType: { ...Typography.subhead, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.lg },
  modalQr: { padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg },
  modalTicketNo: { ...Typography.bodyBold, color: Colors.textPrimary, letterSpacing: 1, marginTop: Spacing.lg },
  modalHint: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 4 },
  modalClose: { marginTop: Spacing.xl, backgroundColor: Colors.background, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xxl, paddingVertical: 12 },
  modalCloseText: { ...Typography.footnote, color: Colors.textPrimary, fontWeight: '700' },
});

export default MyTicketsScreen;
