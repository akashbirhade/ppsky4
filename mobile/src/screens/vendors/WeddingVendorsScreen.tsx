import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { vendorService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'venue', label: 'Venues', icon: 'business-outline' },
  { key: 'photographer', label: 'Photography', icon: 'camera-outline' },
  { key: 'catering', label: 'Catering', icon: 'restaurant-outline' },
  { key: 'decoration', label: 'Decoration', icon: 'flower-outline' },
  { key: 'makeup', label: 'Makeup', icon: 'brush-outline' },
  { key: 'music', label: 'Music/DJ', icon: 'musical-notes-outline' },
  { key: 'pandit', label: 'Pandit', icon: 'book-outline' },
  { key: 'invitation', label: 'Cards', icon: 'mail-outline' },
];

interface Vendor {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviews: number;
  priceRange: string;
  image: string;
  isPremium?: boolean;
  description?: string;
}

export const WeddingVendorsScreen = () => {
  const navigation = useNavigation<any>();
  const [category, setCategory] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVendors(); }, [category]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data } = await vendorService.getAll({ category: category === 'all' ? undefined : category });
      setVendors(data.data?.vendors || MOCK_VENDORS);
    } catch {
      setVendors(MOCK_VENDORS.filter(v => category === 'all' || v.category === category));
    } finally { setLoading(false); }
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <TouchableOpacity style={styles.vendorCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.vendorImage} />
      {item.isPremium && (
        <View style={styles.premiumTag}>
          <Ionicons name="diamond" size={10} color={Colors.white} />
          <Text style={styles.premiumText}>Featured</Text>
        </View>
      )}
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.vendorMeta}>
          <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.vendorMetaText}>{item.city}</Text>
        </View>
        <View style={styles.vendorMeta}>
          <Ionicons name="star" size={13} color={Colors.gold} />
          <Text style={styles.vendorMetaText}>{item.rating} ({item.reviews} reviews)</Text>
        </View>
        <Text style={styles.priceRange}>{item.priceRange}</Text>

        <View style={styles.vendorActions}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => {
            Haptics.lightTap();
            Alert.alert('Inquiry Sent', 'The vendor will contact you shortly.');
          }}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.white} />
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:+919876543210')}>
            <Ionicons name="call-outline" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wedding Vendors</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryActive]}
              onPress={() => { Haptics.selectionChanged(); setCategory(cat.key); }}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={isActive ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Vendor List */}
      <FlatList
        data={vendors}
        renderItem={renderVendor}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: Spacing.md }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </SafeAreaView>
  );
};

const MOCK_VENDORS: Vendor[] = [
  { id: '1', name: 'Royal Palace Banquets', category: 'venue', city: 'Mumbai', rating: 4.8, reviews: 234, priceRange: '₹5L - ₹25L', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', isPremium: true },
  { id: '2', name: 'Capture Moments Studio', category: 'photographer', city: 'Delhi', rating: 4.9, reviews: 189, priceRange: '₹50K - ₹3L', image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400' },
  { id: '3', name: 'Annapurna Caterers', category: 'catering', city: 'Pune', rating: 4.6, reviews: 156, priceRange: '₹800/plate', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400' },
  { id: '4', name: 'Floral Dreams Decor', category: 'decoration', city: 'Bangalore', rating: 4.7, reviews: 98, priceRange: '₹2L - ₹10L', image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400', isPremium: true },
  { id: '5', name: 'Glamour Studio', category: 'makeup', city: 'Hyderabad', rating: 4.5, reviews: 112, priceRange: '₹25K - ₹1L', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' },
  { id: '6', name: 'DJ Beats Entertainment', category: 'music', city: 'Chennai', rating: 4.4, reviews: 76, priceRange: '₹30K - ₹2L', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  categoryActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { ...Typography.subhead, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.white, fontWeight: '600' },
  vendorCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.small,
  },
  vendorImage: { width: '100%', height: 120 },
  premiumTag: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.gold, paddingHorizontal: Spacing.sm,
    paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  premiumText: { ...Typography.caption2, color: Colors.white },
  vendorInfo: { padding: Spacing.md },
  vendorName: { ...Typography.bodyBold, color: Colors.textPrimary, marginBottom: 4 },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  vendorMetaText: { ...Typography.caption1, color: Colors.textTertiary },
  priceRange: { ...Typography.footnote, color: Colors.primary, fontWeight: '600', marginTop: Spacing.sm },
  vendorActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  contactBtnText: { ...Typography.caption1, color: Colors.white, fontWeight: '600' },
  callBtn: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
});

export default WeddingVendorsScreen;
