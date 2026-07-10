import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { successStoryService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.xl * 2;

interface Story {
  id: string;
  couple: string;
  story: string;
  weddingDate: string;
  photo?: string;
  location?: string;
  partner1Name?: string;
  partner2Name?: string;
}

export const SuccessStoriesScreen = () => {
  const navigation = useNavigation<any>();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data } = await successStoryService.getAll();
      setStories(data.data?.stories || MOCK_STORIES);
    } catch {
      setStories(MOCK_STORIES);
    } finally { setLoading(false); }
  };

  const renderStory = ({ item }: { item: Story }) => (
    <View style={styles.storyCard}>
      <Image
        source={{ uri: item.photo || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600' }}
        style={styles.storyImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageGradient}
      />
      <View style={styles.coupleNames}>
        <Ionicons name="heart" size={16} color={Colors.love} />
        <Text style={styles.coupleText}>{item.couple}</Text>
      </View>
      <View style={styles.storyContent}>
        <Text style={styles.storyText} numberOfLines={4}>{item.story}</Text>
        <View style={styles.storyMeta}>
          {item.location && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>Married {item.weddingDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success Stories</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Banner */}
      <LinearGradient
        colors={Colors.gradientSunset as any}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <Ionicons name="heart-circle" size={28} color={Colors.white} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={styles.bannerTitle}>Real Love Stories</Text>
          <Text style={styles.bannerSub}>Couples who found their soulmate on our platform</Text>
        </View>
      </LinearGradient>

      {/* Stories List */}
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStories} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
      />

      {/* Share your story CTA */}
      <TouchableOpacity style={styles.shareCTA} activeOpacity={0.8}>
        <LinearGradient
          colors={Colors.gradientPrimary as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.shareGradient}
        >
          <Ionicons name="add-circle" size={20} color={Colors.white} />
          <Text style={styles.shareText}>Share Your Story</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const MOCK_STORIES: Story[] = [
  {
    id: '1', couple: 'Rahul & Priya',
    story: 'We met on Soulmate Sync in March 2025. After matching based on our kundali compatibility, we started chatting and realized we shared so many values. Within 3 months, our families met and we got engaged!',
    weddingDate: 'Dec 2025', location: 'Mumbai',
    photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  },
  {
    id: '2', couple: 'Amit & Sneha',
    story: 'The AI matchmaking feature suggested Sneha and I were 94% compatible. We were skeptical at first but after our first video call, we knew it was meant to be. Thank you Soulmate Sync!',
    weddingDate: 'Feb 2026', location: 'Delhi',
    photo: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
  },
  {
    id: '3', couple: 'Vikram & Ananya',
    story: 'Being from different states, we never would have met without this app. The community host in our area organized a meetup where we first talked in person. It was love at first sight!',
    weddingDate: 'Jun 2026', location: 'Bangalore',
    photo: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600',
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl, padding: Spacing.lg,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
  },
  bannerTitle: { ...Typography.headline, color: Colors.white },
  bannerSub: { ...Typography.caption1, color: Colors.white, opacity: 0.8, marginTop: 2 },
  storyCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    overflow: 'hidden', ...Shadows.medium,
  },
  storyImage: { width: '100%', height: 200 },
  imageGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  coupleNames: {
    position: 'absolute', top: Spacing.lg, left: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, borderRadius: BorderRadius.full,
  },
  coupleText: { ...Typography.footnote, color: Colors.textPrimary },
  storyContent: { padding: Spacing.lg },
  storyText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  storyMeta: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography.caption1, color: Colors.textTertiary },
  shareCTA: { position: 'absolute', bottom: 30, left: Spacing.xl, right: Spacing.xl },
  shareGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full, ...Shadows.glow,
  },
  shareText: { ...Typography.bodyBold, color: Colors.white },
});

export default SuccessStoriesScreen;
