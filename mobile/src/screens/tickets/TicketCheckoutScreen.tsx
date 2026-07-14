import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { getEventById, formatEventDate, formatEventTime, formatPrice } from '@/data/eventTickets';
import { useTicketStore, type Booking } from '@/store/ticketStore';
import { QRCode } from '@/components/QRCode';
import * as Haptics from '@/utils/haptics';

const TAX_RATE = 0.05; // demo 5% booking fee

type Phase = 'summary' | 'processing' | 'success';

export const TicketCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId, ticketId } = route.params;
  const event = getEventById(eventId);
  const ticket = event?.ticketTypes.find((t) => t.id === ticketId) || null;
  const createBooking = useTicketStore((s) => s.createBooking);

  const [phase, setPhase] = useState<Phase>('summary');
  const [booking, setBooking] = useState<Booking | null>(null);
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'success') {
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }).start();
    }
  }, [phase, checkScale]);

  if (!event || !ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: Spacing.xl }}>Ticket unavailable.</Text>
      </SafeAreaView>
    );
  }

  const base = ticket.price;
  const fee = Math.round(base * TAX_RATE);
  const total = base + fee;

  const pay = () => {
    Haptics.mediumTap();
    setPhase('processing');
    // Demo payment — replace with real gateway (Razorpay/Cashfree/PhonePe) later.
    setTimeout(() => {
      const bk = createBooking(event, ticket, 1);
      setBooking(bk);
      Haptics.success();
      setPhase('success');
    }, 1600);
  };

  // ─── Success screen with digital ticket + QR ───
  if (phase === 'success' && booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.successCheck, { transform: [{ scale: checkScale }] }]}>
            <Ionicons name="checkmark" size={46} color={Colors.white} />
          </Animated.View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSub}>Your ticket has been generated. Show the QR code at the entrance.</Text>

          {/* Digital ticket */}
          <View style={styles.ticket}>
            <LinearGradient colors={event.bannerColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ticketTop}>
              <Ionicons name={event.bannerIcon as any} size={30} color="rgba(255,255,255,0.95)" />
              <Text style={styles.ticketEventTitle}>{event.title}</Text>
              <Text style={styles.ticketType}>{booking.ticketTypeName}</Text>
            </LinearGradient>

            <View style={styles.perforation}>
              <View style={[styles.notch, { left: -10 }]} />
              <View style={styles.dashedLine} />
              <View style={[styles.notch, { right: -10 }]} />
            </View>

            <View style={styles.ticketBottom}>
              <View style={styles.qrWrap}>
                <QRCode value={booking.qrData} size={168} />
              </View>
              <Text style={styles.ticketNumber}>{booking.ticketNumber}</Text>

              <View style={styles.ticketMetaGrid}>
                <View style={styles.ticketMetaItem}>
                  <Text style={styles.ticketMetaLabel}>Date</Text>
                  <Text style={styles.ticketMetaValue}>{formatEventDate(event.date)}</Text>
                </View>
                <View style={styles.ticketMetaItem}>
                  <Text style={styles.ticketMetaLabel}>Time</Text>
                  <Text style={styles.ticketMetaValue}>{formatEventTime(event.date)}</Text>
                </View>
                <View style={styles.ticketMetaItem}>
                  <Text style={styles.ticketMetaLabel}>Venue</Text>
                  <Text style={styles.ticketMetaValue} numberOfLines={2}>{event.venue}</Text>
                </View>
                <View style={styles.ticketMetaItem}>
                  <Text style={styles.ticketMetaLabel}>Paid</Text>
                  <Text style={styles.ticketMetaValue}>{formatPrice(booking.price)}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => navigation.replace('MyTickets')}
          >
            <Ionicons name="ticket" size={18} color={Colors.white} />
            <Text style={styles.primaryBtnText}>View My Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.linkBtn}>
            <Text style={styles.linkBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Summary / processing ───
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} disabled={phase === 'processing'}>
          <Ionicons name="arrow-back" size={24} color={phase === 'processing' ? Colors.textTertiary : Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardEvent}>{event.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatEventDate(event.date)} · {formatEventTime(event.date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{event.venue}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>{ticket.name} × 1</Text>
            <Text style={styles.lineValue}>{formatPrice(base)}</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Booking fee (5%)</Text>
            <Text style={styles.lineValue}>{formatPrice(fee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.demoNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
          <Text style={styles.demoNoteText}>Demo payment mode — no real charge will be made.</Text>
        </View>
      </ScrollView>

      <View style={styles.payBar}>
        <TouchableOpacity
          style={[styles.payBtn, phase === 'processing' && styles.payBtnDisabled]}
          activeOpacity={0.9}
          disabled={phase === 'processing'}
          onPress={pay}
        >
          {phase === 'processing' ? (
            <>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={styles.payBtnText}>Processing…</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={Colors.white} />
              <Text style={styles.payBtnText}>Pay {formatPrice(total)} (Demo)</Text>
            </>
          )}
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
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.small },
  cardEvent: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { ...Typography.subhead, color: Colors.textSecondary, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 3 },
  lineLabel: { ...Typography.subhead, color: Colors.textSecondary },
  lineValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600' },
  totalLabel: { ...Typography.bodyBold, color: Colors.textPrimary },
  totalValue: { ...Typography.title3, color: Colors.primary, fontWeight: '800' },
  demoNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.lg,
    backgroundColor: Colors.primarySoft, borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  demoNoteText: { ...Typography.caption1, color: Colors.textSecondary, flex: 1 },
  payBar: {
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md, paddingBottom: 30, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 16, ...Shadows.small,
  },
  payBtnDisabled: { backgroundColor: Colors.primaryLight },
  payBtnText: { ...Typography.bodyBold, color: Colors.white },

  // Success
  successScroll: { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.huge },
  successCheck: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  successTitle: { ...Typography.title2, color: Colors.textPrimary, fontWeight: '800' },
  successSub: { ...Typography.subhead, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  ticket: { width: '100%', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.small },
  ticketTop: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  ticketEventTitle: { ...Typography.headline, color: Colors.white, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm },
  ticketType: { ...Typography.subhead, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  perforation: { flexDirection: 'row', alignItems: 'center', height: 20, backgroundColor: Colors.white },
  notch: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background },
  dashedLine: { flex: 1, height: 1, marginHorizontal: Spacing.md, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderDark },
  ticketBottom: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.sm },
  qrWrap: { padding: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border },
  ticketNumber: { ...Typography.bodyBold, color: Colors.textPrimary, letterSpacing: 1, marginTop: Spacing.md },
  ticketMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.lg, width: '100%' },
  ticketMetaItem: { width: '50%', paddingVertical: Spacing.sm },
  ticketMetaLabel: { ...Typography.caption1, color: Colors.textTertiary },
  ticketMetaValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: 15, paddingHorizontal: Spacing.xxl, marginTop: Spacing.xxl, width: '100%',
  },
  primaryBtnText: { ...Typography.bodyBold, color: Colors.white },
  linkBtn: { marginTop: Spacing.lg, padding: Spacing.sm },
  linkBtnText: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '600' },
});

export default TicketCheckoutScreen;
