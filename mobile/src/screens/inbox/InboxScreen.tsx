import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMatchStore } from '@/store/matchStore';
import { matchService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

export const InboxScreen = () => {
  const navigation = useNavigation<any>();
  const { receivedLikes, loadReceivedLikes } = useMatchStore();
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadReceivedLikes();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReceivedLikes();
    setRefreshing(false);
  }, []);

  const handleAccept = async (userId: string, name: string) => {
    if (processing) return;
    setProcessing(userId);
    try {
      await matchService.likeProfile(userId);
      Haptics.success();
      Alert.alert('Accepted!', `You and ${name} are now connected.`);
      await loadReceivedLikes();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not accept request.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (userId: string) => {
    if (processing) return;
    setProcessing(userId);
    try {
      await matchService.unlikeProfile(userId);
      Haptics.mediumTap();
      await loadReceivedLikes();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not decline request.');
    } finally {
      setProcessing(null);
    }
  };

  const renderRequestCard = ({ item }: { item: any }) => {
    const photo = item.user?.photos?.find((p: any) => p.isMain)?.url || item.user?.photos?.[0]?.url;
    const name = `${item.firstName || ''} ${item.lastName?.[0] || ''}`.trim() || 'User';
    const isProcessing = processing === item.user?.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProfileDetail', { userId: item.user?.id })}
      >
        {/* Photo */}
        <View style={styles.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="person" size={32} color={Colors.textTertiary} />
            </View>
          )}
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {name}{item.age ? `, ${item.age}` : ''}
          </Text>
          <Text style={styles.cardDetail} numberOfLines={1}>
            {item.profession || item.education || 'Not specified'}
          </Text>
          <Text style={styles.cardCity} numberOfLines={1}>
            {item.city || 'Location not shared'}
          </Text>
          {item.religion && (
            <Text style={styles.cardReligion} numberOfLines={1}>
              {item.religion}{item.caste ? ` • ${item.caste}` : ''}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => handleDecline(item.user?.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={Colors.error} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(item.user?.id, item.firstName || 'this user')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="checkmark" size={22} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="mail-open-outline" size={56} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Requests Yet</Text>
      <Text style={styles.emptyText}>
        When someone sends you an interest, it will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <Text style={styles.headerCount}>
          {receivedLikes.length > 0 ? `${receivedLikes.length} request${receivedLikes.length > 1 ? 's' : ''}` : ''}
        </Text>
      </View>

      {/* Request List */}
      <FlatList
        data={receivedLikes}
        keyExtractor={(item, i) => item.id || item.user?.id || String(i)}
        renderItem={renderRequestCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={receivedLikes.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  headerCount: {
    ...Typography.callout,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.softCard,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
  },
  photoPlaceholder: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardName: {
    ...Typography.headline,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  cardDetail: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardCity: {
    ...Typography.caption1,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  cardReligion: {
    ...Typography.caption2,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  declineBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
  },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
