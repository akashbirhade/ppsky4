import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import {
  DEMO_EVENTS,
  type TicketEvent,
  formatEventDate,
  formatEventTime,
  formatPrice,
  startingPrice,
  seatsLeft,
} from '@/data/eventTickets';
import { useTicketStore } from '@/store/ticketStore';
import * as Haptics from '@/utils/haptics';

export const EventTicketsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const bookings = useTicketStore((s) => s.bookings);
  const activeCount = bookings.filter((b) => b.status === 'upcoming').length;

  const renderEvent = ({ item }: { item: TicketEvent }) => {
    const left = seatsLeft(item);
    const low = left <= 15;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => { Haptics.lightTap(); navigation.navigate('EventTicketDetail', { eventId: item.id }); }}
      >
        <LinearGradient
          colors={item.bannerColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons name={item.bannerIcon as any} size={40} color="rgba(255,255,255,0.95)" />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeLabel}>From</Text>
            <Text style={styles.priceBadgeValue}>{formatPrice(startingPrice(item))}</Text>
          </View>
        </LinearGradient>

        <View style={styles.cardBody}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatEventDate(item.date)} · {formatEventTime(item.date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{item.organizer}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.seatsPill, low && styles.seatsPillLow]}>
              <Ionicons name="ticket-outline" size={13} color={low ? Colors.love : Colors.success} />
              <Text style={[styles.seatsText, low && styles.seatsTextLow]}>
                {left} tickets left
              </Text>
            </View>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View Details</Text>
              <Ionicons name="arrow-forward" size={15} color={Colors.white} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Passes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')} style={styles.iconBtn}>
          <Ionicons name="ticket" size={22} color={Colors.primary} />
          {activeCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={DEMO_EVENTS}
        keyExtractor={(e) => e.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <LinearGradient
            colors={Colors.gradientSunset as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Marriage & Matchmaking Events</Text>
              <Text style={styles.heroSub}>Book your pass and meet your match in person</Text>
            </View>
            <Ionicons name="heart-circle" size={44} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        }
      />

      <TouchableOpacity
        style={styles.myTicketsFab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MyTickets')}
      >
        <Ionicons name="ticket" size={18} color={Colors.white} />
        <Text style={styles.myTicketsFabText}>My Tickets{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
      </TouchableOpacity>
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
  headerBadge: {
    position: 'absolute', top: 4, right: 2, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.love, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  headerBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  hero: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  heroTitle: { ...Typography.title3, color: Colors.white, fontWeight: '700' },
  heroSub: { ...Typography.subhead, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    overflow: 'hidden', marginBottom: Spacing.lg, ...Shadows.small,
  },
  banner: { height: 130, alignItems: 'center', justifyContent: 'center' },
  priceBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: BorderRadius.md,
    paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end',
  },
  priceBadgeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '600' },
  priceBadgeValue: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  cardBody: { padding: Spacing.lg },
  eventTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { ...Typography.subhead, color: Colors.textSecondary, flex: 1 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  seatsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.successSoft, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  seatsPillLow: { backgroundColor: Colors.loveSoft },
  seatsText: { ...Typography.caption1, color: Colors.successDark, fontWeight: '700' },
  seatsTextLow: { color: Colors.loveDark },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  viewBtnText: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },
  myTicketsFab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.textPrimary, borderRadius: BorderRadius.full,
    paddingHorizontal: 20, paddingVertical: 12, ...Shadows.small,
  },
  myTicketsFabText: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },
});

export default EventTicketsScreen;
