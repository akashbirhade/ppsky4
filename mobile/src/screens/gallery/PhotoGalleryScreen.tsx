import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  Dimensions, TouchableOpacity, StatusBar, Modal, Share, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export const PhotoGalleryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { photos = [], initialIndex = 0, userName = '', onCancelInterest } = route.params || {};
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= photos.length) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const handleShare = async () => {
    setMenuOpen(false);
    try {
      await Share.share({ message: `Check out ${userName}'s profile on our app!` });
    } catch { /* cancelled */ }
  };

  const handleReport = () => {
    setMenuOpen(false);
    Alert.alert('Report Photo', `Report this photo of ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. Our team will review this.') },
    ]);
  };

  const handleBlock = () => {
    setMenuOpen(false);
    Alert.alert('Block User', `Block ${userName}? They won't be able to contact you.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => { navigation.goBack(); } },
    ]);
  };

  const menuItems = [
    ...(onCancelInterest ? [{ label: 'Cancel Interest', icon: 'close-circle-outline' as const, danger: false, onPress: () => { setMenuOpen(false); onCancelInterest(); navigation.goBack(); } }] : []),
    { label: 'Share Profile', icon: 'share-outline' as const, danger: false, onPress: handleShare },
    { label: 'Block', icon: 'ban-outline' as const, danger: true, onPress: handleBlock },
    { label: 'Report', icon: 'flag-outline' as const, danger: true, onPress: handleReport },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.counter}>{activeIndex + 1} / {photos.length} Photos</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Gallery */}
      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.url }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* Prev / Next arrows */}
      {activeIndex > 0 && (
        <TouchableOpacity style={styles.arrowLeft} onPress={() => goTo(activeIndex - 1)}>
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}
      {activeIndex < photos.length - 1 && (
        <TouchableOpacity style={styles.arrowRight} onPress={() => goTo(activeIndex + 1)}>
          <Ionicons name="chevron-forward" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {photos.map((_: any, i: number) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Photo Info */}
      {photos[activeIndex]?.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{photos[activeIndex].caption}</Text>
        </View>
      )}

      {/* Three-dot menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            {menuItems.map((item, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={20} color={item.danger ? Colors.error : Colors.textPrimary} />
                <Text style={[styles.menuLabel, item.danger && { color: Colors.error }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.white,
  },
  counter: {
    ...Typography.caption1,
    color: Colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  arrowLeft: {
    position: 'absolute',
    left: Spacing.lg,
    top: height / 2 - 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  arrowRight: {
    position: 'absolute',
    right: Spacing.lg,
    top: height / 2 - 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.white,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 120,
    left: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
  },
  caption: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
    paddingHorizontal: Spacing.lg,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});

export default PhotoGalleryScreen;
