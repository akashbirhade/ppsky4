import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { eventService } from '@/services';
import * as Haptics from '@/utils/haptics';

interface EventItem {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  venue: string;
  mode: 'online' | 'offline';
  fee: number;
  participants: number;
  maxParticipants: number;
  icon: string;
  color: string;
  registered?: boolean;
}

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'speed-dating', label: 'Speed Dating' },
  { key: 'mixer', label: 'Mixers' },
  { key: 'webinar', label: 'Webinars' },
  { key: 'meetup', label: 'Meetups' },
  { key: 'festival', label: 'Festivals' },
];

const MOCK_EVENTS: EventItem[] = [
  { id: '1', title: 'Virtual Speed Dating Night', description: 'Meet 10 verified singles in one evening', type: 'speed-dating', date: '2026-07-15T19:00:00', venue: 'Online (Zoom)', mode: 'online', fee: 299, participants: 34, maxParticipants: 50, icon: 'flash', color: Colors.love },
  { id: '2', title: 'Mumbai Singles Mixer', description: 'Casual evening mixer at a rooftop lounge', type: 'mixer', date: '2026-07-20T18:30:00', venue: 'Bandra, Mumbai', mode: 'offline', fee: 999, participants: 62, maxParticipants: 80, icon: 'wine', color: Colors.secondary },
  { id: '3', title: 'Finding The One - Webinar', description: 'Expert tips on modern matchmaking', type: 'webinar', date: '2026-07-18T17:00:00', venue: 'Online (YouTube Live)', mode: 'online', fee: 0, participants: 210, maxParticipants: 500, icon: 'videocam', color: Colors.accent },
  { id: '4', title: 'Bangalore Tech Singles Meetup', description: 'Connect with IT professionals over coffee', type: 'meetup', date: '2026-07-25T11:00:00', venue: 'Koramangala, Bangalore', mode: 'offline', fee: 499, participants: 28, maxParticipants: 40, icon: 'cafe', color: Colors.primary },
  { id: '5', title: 'Diwali Community Festival', description: 'Celebrate & connect during the festival of lights', type: 'festival', date: '2026-08-01T16:00:00', venue: 'Delhi NCR', mode: 'offline', fee: 799, participants: 145, maxParticipants: 200, icon: 'sparkles', color: Colors.gold },
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' • ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventService.getAll();
      const data = res.data?.events;
      setEvents(data && data.length ? data : MOCK_EVENTS);
    } catch {
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (item: EventItem) => {
    Haptics.success();
    if (registeredIds.has(item.id)) {
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      eventService.cancelRegistration(item.id).catch(() => {});
    } else {
      setRegisteredIds((prev) => new Set(prev).add(item.id));
      eventService.register(item.id).catch(() => {});
      Alert.alert('Registered!', `You're registered for "${item.title}". We'll send you the details.`);
    }
  };

  const filtered = type === 'all' ? events : events.filter((e) => e.type === type);

  const renderEvent = ({ item }: { item: EventItem }) => {
    const registered = registeredIds.has(item.id);
    const spotsLeft = item.maxParticipants - item.participants;
    return (
      <View style={styles.eventCard}>
        <View style={styles.eventTop}>
          <View style={[styles.eventIcon, { backgroundColor: item.color + '18' }]}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name={item.mode === 'online' ? 'globe-outline' : 'location-outline'} size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{item.venue}</Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View>
            <Text style={styles.eventFee}>{item.fee === 0 ? 'Free' : `₹${item.fee}`}</Text>
            <Text style={styles.spotsText}>{spotsLeft} spots left</Text>
          </View>
          <TouchableOpacity
            style={[styles.registerBtn, registered && styles.registeredBtn]}
            onPress={() => handleRegister(item)}
          >
            <Text style={[styles.registerText, registered && styles.registeredText]}>
              {registered ? 'Registered ✓' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={{ width: 40 }} />
      </View>

      <LinearGradient
        colors={Colors.gradientGold as any}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Ionicons name="calendar" size={30} color={Colors.white} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.bannerTitle}>Meet Singles In Person</Text>
          <Text style={styles.bannerSub}>Join curated events, mixers & speed dating to find your match</Text>
        </View>
      </LinearGradient>

      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl }}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, type === t.key && styles.chipActive]}
              onPress={() => { Haptics.selectionChanged(); setType(t.key); }}
            >
              <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  banner: {
    flexDirection: 'row', alignItems: 'center', margin: Spacing.xl,
    padding: Spacing.lg, borderRadius: BorderRadius.lg,
  },
  bannerTitle: { ...Typography.bodyBold, color: Colors.white },
  bannerSub: { ...Typography.caption1, color: Colors.white, opacity: 0.9, marginTop: 2 },
  filterWrap: { marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.footnote, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  eventCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.small,
  },
  eventTop: { flexDirection: 'row', alignItems: 'flex-start' },
  eventIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  eventDesc: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 2 },
  eventMeta: { marginTop: Spacing.md, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...Typography.footnote, color: Colors.textSecondary },
  eventFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  eventFee: { ...Typography.bodyBold, color: Colors.primary },
  spotsText: { ...Typography.caption2, color: Colors.textTertiary, marginTop: 1 },
  registerBtn: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primary,
  },
  registeredBtn: { backgroundColor: Colors.successSoft },
  registerText: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },
  registeredText: { color: Colors.success },
});
