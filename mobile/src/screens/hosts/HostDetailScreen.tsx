import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { hostService } from '../../services';
import * as Haptics from '../../utils/haptics';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  fee: number;
  maxParticipants: number;
  participantCount: number;
};

type Member = {
  id: string;
  userId: string;
  user?: { id: string; profile?: any; photos?: any[] };
};

export default function HostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { hostId } = route.params;
  const [host, setHost] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'members'>('about');

  useEffect(() => { loadHost(); }, [hostId]);

  const loadHost = async () => {
    try {
      const [hostRes, eventsRes] = await Promise.all([
        hostService.getById(hostId),
        hostService.getEvents(hostId),
      ]);
      setHost(hostRes.data?.data || hostRes.data);
      setEvents(eventsRes.data?.data?.events || eventsRes.data?.data || []);
    } catch {
      Alert.alert('Error', 'Could not load host details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data } = await hostService.getMembers(hostId);
      setMembers(data?.data?.members || data?.data || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'members' && members.length === 0) loadMembers();
  }, [activeTab]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!host) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Host Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            {host.profilePhoto ? (
              <Image source={{ uri: host.profilePhoto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{host.name}</Text>
          <Text style={styles.profileLocation}>
            <Ionicons name="location" size={14} color={Colors.textTertiary} />
            {' '}{host.city}, {host.district}, {host.region}
          </Text>
          <View style={styles.communityBadge}>
            <Text style={styles.communityText}>{host.community} Community</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{host._count?.members || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{host._count?.events || events.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{host.status === 'ACTIVE' ? '✓' : '—'}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['about', 'events', 'members'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => { Haptics.selectionChanged(); setActiveTab(tab); }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{host.mobile || 'Not shared'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{host.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Active since {formatDate(host.createdAt)}</Text>
            </View>

            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
              <Text style={styles.contactBtnText}>Contact Host</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.section}>
            {events.length === 0 ? (
              <View style={styles.emptyTab}>
                <Ionicons name="calendar-outline" size={36} color={Colors.textTertiary} />
                <Text style={styles.emptyTabText}>No upcoming events</Text>
              </View>
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Ionicons name="calendar" size={18} color={Colors.primary} />
                    <Text style={styles.eventTitle}>{event.title}</Text>
                  </View>
                  <Text style={styles.eventDesc}>{event.description}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                      <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
                      <Text style={styles.eventMetaText}>{event.venue}</Text>
                    </View>
                  </View>
                  <View style={styles.eventFooter}>
                    <Text style={styles.eventFee}>₹{event.fee}</Text>
                    <Text style={styles.eventParticipants}>
                      {event.participantCount}/{event.maxParticipants} joined
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn} activeOpacity={0.7}>
                    <Text style={styles.joinBtnText}>Register for Event</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.section}>
            {members.length === 0 ? (
              <View style={styles.emptyTab}>
                <Ionicons name="people-outline" size={36} color={Colors.textTertiary} />
                <Text style={styles.emptyTabText}>Members are private</Text>
              </View>
            ) : (
              members.map((member) => {
                const profile = member.user?.profile;
                const photo = member.user?.photos?.[0]?.url;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberCard}
                    onPress={() => navigation.navigate('ProfileDetail', { userId: member.userId })}
                  >
                    {photo ? (
                      <Image source={{ uri: photo }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                        <Ionicons name="person" size={18} color={Colors.textTertiary} />
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {profile?.firstName || 'Member'} {profile?.lastName || ''}
                      </Text>
                      <Text style={styles.memberMeta}>
                        {profile?.age ? `${profile.age} yrs` : ''} • {profile?.city || ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...Typography.headline, fontWeight: '700' },
  profileCard: {
    alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white, margin: Spacing.md, borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  profileAvatar: { marginBottom: Spacing.md },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  profileName: { ...Typography.title3, fontWeight: '700' },
  profileLocation: { ...Typography.callout, color: Colors.textSecondary, marginTop: 4 },
  communityBadge: {
    backgroundColor: Colors.primarySoft, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: Spacing.sm,
  },
  communityText: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg,
    paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, width: '100%',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { ...Typography.title3, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { ...Typography.caption2, color: Colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  tabRow: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: 4,
    ...Shadows.small,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.subhead, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  section: { padding: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  infoText: { ...Typography.body, color: Colors.textPrimary },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: 14, marginTop: Spacing.lg,
  },
  contactBtnText: { ...Typography.body, fontWeight: '600', color: Colors.white },
  eventCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.small,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eventTitle: { ...Typography.subhead, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  eventDesc: { ...Typography.caption1, color: Colors.textSecondary, marginBottom: Spacing.sm },
  eventMeta: { gap: 4, marginBottom: Spacing.sm },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { ...Typography.caption2, color: Colors.textTertiary },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  eventFee: { ...Typography.subhead, fontWeight: '700', color: Colors.primary },
  eventParticipants: { ...Typography.caption1, color: Colors.textSecondary },
  joinBtn: {
    backgroundColor: Colors.primarySoft, borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
  },
  joinBtnText: { ...Typography.subhead, fontWeight: '600', color: Colors.primary },
  emptyTab: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyTabText: { ...Typography.callout, color: Colors.textTertiary, marginTop: Spacing.sm },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs, ...Shadows.small,
  },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: Spacing.md },
  memberAvatarPlaceholder: { backgroundColor: Colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  memberInfo: { flex: 1 },
  memberName: { ...Typography.subhead, fontWeight: '600', color: Colors.textPrimary },
  memberMeta: { ...Typography.caption1, color: Colors.textTertiary, marginTop: 2 },
});
