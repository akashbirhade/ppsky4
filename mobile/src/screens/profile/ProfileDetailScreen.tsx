import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  LayoutAnimation,
  UIManager,
  Linking,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { profileService, chatService, matchService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { InterestButton, InterestStatus } from '@/components/InterestButton';
import { toast } from '@/components/Toast';
import { formatDistanceToNow } from 'date-fns';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import * as Haptics from '@/utils/haptics';
import { ActionSheetIOS, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ConnectStatus = 'none' | 'sent' | 'interested' | 'accepted' | 'connected' | 'declined';

const CONNECT_STATES: Record<ConnectStatus, { label: string; icon: string; colors: readonly [string, string]; disabled: boolean }> = {
  none: { label: 'Connect Now', icon: 'heart-outline', colors: Colors.gradientPrimary, disabled: false },
  sent: { label: 'Request Sent', icon: 'checkmark', colors: ['#9CA3AF', '#6B7280'], disabled: true },
  interested: { label: 'Interested', icon: 'heart', colors: Colors.gradientGold, disabled: true },
  accepted: { label: 'Accepted', icon: 'checkmark-done', colors: Colors.gradientPrimary, disabled: true },
  connected: { label: 'Connected', icon: 'checkmark-circle', colors: ['#10B981', '#059669'], disabled: true },
  declined: { label: 'Declined', icon: 'close-circle', colors: ['#EF4444', '#DC2626'], disabled: true },
};

// Emoji icon per hobby keyword
const HOBBY_ICONS: Record<string, string> = {
  travel: '🏖', traveling: '🏖', music: '🎵', food: '🍜', cooking: '🍳', reading: '📚',
  fitness: '🏋', gym: '🏋', movies: '🎬', movie: '🎬', painting: '🎨', art: '🎨',
  dancing: '💃', dance: '💃', photography: '📷', sports: '⚽', cricket: '🏏',
  yoga: '🧘', pets: '🐶', gaming: '🎮', writing: '✍️', singing: '🎤', shopping: '🛍',
  nature: '🌿', hiking: '🥾', coffee: '☕', technology: '💻', fashion: '👗',
};
const hobbyIcon = (h: string) => HOBBY_ICONS[h.toLowerCase().trim()] || '⭐';

const maskPhone = (phone?: string) => {
  if (!phone) return '+91 934*****56';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '+91 934*****56';
  return `+91 ${digits.slice(-10, -7)}*****${digits.slice(-2)}`;
};

const maskEmail = (email?: string) => {
  if (!email || !email.includes('@')) return 'pri*****@gmail.com';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 3)}*****@${domain}`;
};

const formatBirthDate = (dob?: string) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const isOnline = (lastActive: string) => {
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000; // 5 min
};

const formatLastActive = (lastActive: string) => {
  return formatDistanceToNow(new Date(lastActive), { addSuffix: true });
};

// Reusable action button for the bottom dock (reference redesign)
const DockAction: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tint: string;
  highlight?: boolean;
  active?: boolean;
}> = ({ icon, label, onPress, tint, highlight, active }) => {
  const filled = !!(highlight || active);
  return (
    <TouchableOpacity
      style={styles.dockAction}
      activeOpacity={0.85}
      onPress={() => { Haptics.lightTap(); onPress(); }}
    >
      <View style={[styles.dockIconCircle, filled && { backgroundColor: tint, borderColor: tint }]}>
        <Ionicons name={icon} size={22} color={filled ? Colors.white : 'rgba(255,255,255,0.92)'} />
      </View>
      <Text style={styles.dockLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export const ProfileDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId: initialUserId, profileIds, currentIndex: initIdx } = route.params;
  const currentUser = useAuthStore((s) => s.user);
  const isPremium = !!currentUser?.subscription?.isActive && currentUser?.subscription?.plan !== 'free';

  // Horizontal navigation between profiles (Section 7)
  const navList: string[] = profileIds || [];
  const [navIndex, setNavIndex] = useState<number>(typeof initIdx === 'number' ? initIdx : 0);
  const userId = navList.length > 0 ? navList[navIndex] : initialUserId;
  const canGoPrev = navList.length > 0 && navIndex > 0;
  const canGoNext = navList.length > 0 && navIndex < navList.length - 1;

  // The PanResponder below is created once (useRef), so it would capture the
  // first render's canGoPrev/canGoNext/goToProfile. Mirror the latest values in
  // refs so swiping keeps working after navigating to another profile.
  const navStateRef = useRef({ canGoPrev, canGoNext, len: navList.length });
  navStateRef.current = { canGoPrev, canGoNext, len: navList.length };
  const goToProfileRef = useRef<(dir: -1 | 1) => void>(() => {});

  // ─── Swipe Navigation (Section 24) ───────────────────────────────────────
  const swipeX = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const goToProfile = (dir: -1 | 1) => {
    const next = navIndex + dir;
    if (next < 0 || next >= navList.length) return;
    // Slide out current profile
    Animated.timing(slideAnim, {
      toValue: -dir * width,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setNavIndex(next);
      setProfile(null);
      setLoading(true);
      setCurrentPhotoIndex(0);
      setConnectStatus('none');
      setAboutExpanded(false);
      setContactRevealed(false);
      // Slide in new profile from opposite side
      slideAnim.setValue(dir * width);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 20,
        tension: 80,
      }).start();
      // Reset scroll
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    Haptics.selectionChanged();
  };
  // Always keep the ref pointing at the latest goToProfile closure
  goToProfileRef.current = goToProfile;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && navStateRef.current.len > 1,
      onPanResponderMove: (_, gs) => {
        // Only allow drag if navigable in that direction
        if (gs.dx > 0 && !navStateRef.current.canGoPrev) return;
        if (gs.dx < 0 && !navStateRef.current.canGoNext) return;
        swipeX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD && navStateRef.current.canGoPrev) {
          goToProfileRef.current(-1);
        } else if (gs.dx < -SWIPE_THRESHOLD && navStateRef.current.canGoNext) {
          goToProfileRef.current(1);
        }
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      },
    })
  ).current;

  const [profile, setProfile] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>('none');
  const [connecting, setConnecting] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data } = await profileService.getProfileById(userId);
      const p = data.data;
      setProfile(p);
      // Derive relationship status from backend flags if present
      if (p.isMatched || p.isConnected) setConnectStatus('connected');
      else if (p.interestAccepted) setConnectStatus('accepted');
      else if (p.interestSent) setConnectStatus('sent');
      else if (p.interestReceived) setConnectStatus('none');
    } catch {
      Alert.alert('Error', 'Could not load profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterest = () => {
    Alert.alert('Cancel Request', 'Withdraw your interest in this profile?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw', style: 'destructive',
        onPress: async () => {
          setConnectStatus('none');
          Haptics.selectionChanged();
          try { await matchService.unlikeProfile(userId); } catch {}
        },
      },
    ]);
  };

  const canCommunicate = connectStatus === 'accepted' || connectStatus === 'connected';
  const isDeclined = connectStatus === 'declined';

  // Animated interest send (used by InterestButton) — returns isMatch
  const sendInterest = async (): Promise<boolean> => {
    setConnecting(true);
    try {
      const { data } = await matchService.likeProfile(userId);
      const isMatch = !!data?.data?.isMatch;
      setConnectStatus(isMatch ? 'connected' : 'interested');
      return isMatch;
    } catch {
      // Optimistic local update if backend unavailable
      setConnectStatus('interested');
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const interestStatus: InterestStatus =
    connectStatus === 'none' || isDeclined
      ? 'none'
      : canCommunicate
        ? 'connected'
        : 'sent';

  const handleChat = async () => {
    Haptics.mediumTap();
    try {
      const { data } = await chatService.getOrCreateConversation(userId);
      navigation.navigate('Chat', {
        conversationId: data.data.id,
        userId,
        name: `${profile.firstName} ${profile.lastName || ''}`,
      });
    } catch {}
  };

  const handleWhatsApp = () => {
    if (!canCommunicate) return promptConnect();
    if (!isPremium) return setShowPremiumSheet(true);
    const phone = (profile.whatsappNumber || profile.mobileNumber || '').replace(/\D/g, '');
    if (!phone) { Alert.alert('Unavailable', 'WhatsApp number not shared.'); return; }
    const msg = encodeURIComponent(`Hi ${profile.firstName}, I found your profile on Soulmate Sync!`);
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
  };

  const handleCall = () => {
    if (!canCommunicate) return promptConnect();
    if (!isPremium) return setShowPremiumSheet(true);
    navigation.navigate('VideoCall', { receiverId: userId, type: 'AUDIO', callId: '' });
  };

  const promptConnect = () => {
    Haptics.warning();
    Alert.alert('Connect First', 'You can call & message once your interest is accepted.');
  };

  const handleViewContact = () => {
    if (isPremium) {
      setContactRevealed(true);
      Haptics.success();
    } else {
      setShowPremiumSheet(true);
    }
  };

  const handleCopyId = async () => {
    const id = (profile.profileId || profile.id || userId).toString().slice(0, 8).toUpperCase();
    await Clipboard.setStringAsync(id);
    Haptics.selectionChanged();
    Alert.alert('Copied', `Profile ID ${id} copied to clipboard`);
  };

  const handleShare = () => {
    Haptics.selectionChanged();
    Alert.alert('Share Profile', 'Profile link copied. Share it with family & friends!');
  };

  const toggleAbout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAboutExpanded((v) => !v);
  };

  // ── Bottom dock actions (reference redesign) ──
  const handleInterest = () => {
    if (interestStatus !== 'none') return;
    Haptics.success();
    sendInterest().then((m) => toast.success(m ? "It's a match! 💚" : 'Interest sent successfully'));
  };

  const handleSuperInterest = async () => {
    Haptics.success();
    try { await matchService.superLike(userId); } catch {}
    setConnectStatus((s) => (s === 'none' ? 'interested' : s));
    toast.success('Super Interest sent! ⭐');
  };

  const handleShortlist = async () => {
    const next = !shortlisted;
    Haptics.selectionChanged();
    setShortlisted(next);
    try {
      if (next) await matchService.addFavorite(userId);
      else await matchService.removeFavorite(userId);
    } catch {}
    toast.success(next ? 'Added to Shortlist' : 'Removed from Shortlist');
  };

  const showMoreOptions = () => {
    const canCancel = connectStatus === 'interested' || connectStatus === 'sent';
    const baseOptions = canCancel
      ? ['Cancel Interest Request', 'Share Profile', 'Block Profile', 'Report Profile', 'Cancel']
      : ['Share Profile', 'Block Profile', 'Report Profile', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: baseOptions,
          destructiveButtonIndex: canCancel ? [0, 2] as any : 1,
          cancelButtonIndex: baseOptions.length - 1,
        },
        (index) => routeOption(index, canCancel),
      );
    } else {
      const buttons: any[] = [];
      if (canCancel) buttons.push({ text: 'Cancel Interest Request', style: 'destructive', onPress: handleCancelInterest });
      buttons.push({ text: 'Share Profile', onPress: handleShare });
      buttons.push({ text: 'Block Profile', style: 'destructive', onPress: () => confirmBlock() });
      buttons.push({ text: 'Report Profile', onPress: () => confirmReport() });
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Options', '', buttons);
    }
  };

  const routeOption = (index: number, canCancel: boolean) => {
    const map = canCancel
      ? [handleCancelInterest, handleShare, confirmBlock, confirmReport]
      : [handleShare, confirmBlock, confirmReport];
    map[index]?.();
  };

  function confirmBlock() {
    Alert.alert('Block Profile', "They won't be able to see your profile or message you.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block', style: 'destructive',
        onPress: async () => {
          try {
            await matchService.blockUser(userId);
            Haptics.warning();
            Alert.alert('Blocked', 'This user has been blocked.');
            navigation.goBack();
          } catch {}
        },
      },
    ]);
  }

  function confirmReport() {
    Alert.alert('Report Profile', 'Why are you reporting this profile?', [
      { text: 'Fake Profile', onPress: () => submitReport('fake_profile') },
      { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
      { text: 'Harassment', onPress: () => submitReport('harassment') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const submitReport = async (reason: string) => {
    try {
      await matchService.reportUser(userId, reason);
      Haptics.success();
      Alert.alert('Reported', 'Thank you for helping keep our community safe.');
    } catch {}
  };

  const openGallery = () => {
    const canCancel = connectStatus === 'interested' || connectStatus === 'sent';
    navigation.navigate('PhotoGallery', {
      photos,
      initialIndex: currentPhotoIndex,
      userName: `${profile.firstName} ${profile.lastName || ''}`,
      ...(canCancel ? { onCancelInterest: handleCancelInterest } : {}),
    });
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const photos = profile.user?.photos || [];
  const currentPhoto = photos[currentPhotoIndex]?.url || 'https://via.placeholder.com/400';
  const fullName = `${profile.firstName} ${profile.lastName || ''}`.trim();
  const isFemale = (profile.gender || profile.user?.gender || '').toUpperCase() === 'FEMALE';
  const subjectPronoun = isFemale ? 'She' : 'He';
  const relationshipNote = profile.hasMessaged
    ? `${subjectPronoun} sent you a message`
    : profile.interestReceived
      ? `${subjectPronoun} has sent you an Interest`
      : null;

  // ─── Match preferences (section 10) ───
  const prefChecks = [
    { label: 'Height', matched: !!profile.height },
    { label: 'Age', matched: !!profile.age },
    { label: 'Marital Status', matched: !!profile.maritalStatus },
    { label: 'Religion', matched: !!profile.religion },
    { label: 'Community', matched: !!(profile.caste || profile.community) },
    { label: 'Mother Tongue', matched: !!profile.motherTongue },
    { label: 'Country', matched: true },
    { label: 'State', matched: !!profile.state },
    { label: 'City', matched: !!profile.city },
    { label: 'Profession', matched: !!profile.profession },
    { label: 'Diet', matched: !!profile.diet },
    { label: 'Annual Income', matched: !!profile.annualIncome },
  ];
  const matchedCount = prefChecks.filter((p) => p.matched).length;
  const matchPercent = Math.round((matchedCount / prefChecks.length) * 100);

  // ─── Things in common (section 11) ───
  const commonItems: { icon: string; text: string }[] = [];
  if (profile.diet) commonItems.push({ icon: '🍽', text: `Both enjoy ${profile.diet} food` });
  const hobbiesArr: string[] = Array.isArray(profile.hobbies) ? profile.hobbies : profile.hobbies ? [profile.hobbies] : [];
  hobbiesArr.slice(0, 3).forEach((h) => commonItems.push({ icon: hobbyIcon(h), text: `Both love ${h}` }));
  if (profile.city) commonItems.push({ icon: '🌍', text: `Both prefer living in ${profile.city}` });

  const infoRows: { label: string; value: any; icon: string; copyable?: boolean }[] = [
    { label: 'Managed By', value: profile.managedBy || 'Self', icon: '👤' },
    { label: 'Profile ID', value: (profile.profileId || profile.id || userId).toString().slice(0, 8).toUpperCase(), icon: '🆔', copyable: true },
    { label: 'Age', value: profile.age ? `${profile.age} Years` : null, icon: '🗓' },
    { label: 'Height', value: profile.height ? `${Math.floor(profile.height / 30.48)}'${Math.round((profile.height % 30.48) / 2.54)}" (${profile.height} cm)` : null, icon: '📏' },
    { label: 'Birth Date', value: formatBirthDate(profile.dateOfBirth), icon: '🎂' },
    { label: 'Marital Status', value: profile.maritalStatus || 'Never Married', icon: '❤️' },
    { label: 'Lives In', value: [profile.city, profile.state].filter(Boolean).join(', ') || null, icon: '📍' },
    { label: 'Native Place', value: profile.nativePlace || profile.hometown || null, icon: '🏡' },
    { label: 'Religion', value: profile.religion, icon: '🕌' },
    { label: 'Mother Tongue', value: profile.motherTongue, icon: '🗣' },
    { label: 'Community', value: profile.caste || profile.community, icon: '👥' },
    { label: 'Diet', value: profile.diet, icon: '🍽' },
    { label: 'Country', value: profile.country || 'India', icon: '🌎' },
  ].filter((r) => r.value);

  const familyRows: { label: string; value: any; icon: string }[] = [
    { label: 'Family Location', value: profile.familyLocation || profile.city, icon: '🏠' },
    { label: 'Family Status', value: profile.familyStatus, icon: '👨‍👩‍👧' },
    { label: 'Annual Family Income', value: profile.familyIncome, icon: '💰' },
    { label: 'Father Occupation', value: profile.fatherOccupation, icon: '👨' },
    { label: 'Mother Occupation', value: profile.motherOccupation, icon: '👩' },
    { label: 'Siblings', value: profile.siblings != null ? `${profile.siblings}` : null, icon: '👫' },
  ].filter((r) => r.value);

  const careerRows: { label: string; value: any; icon: string }[] = [
    { label: 'Profession', value: profile.profession, icon: '💼' },
    { label: 'Working As', value: profile.workingAs, icon: '👔' },
    { label: 'Organization', value: profile.organization, icon: '🏢' },
    { label: 'Annual Income', value: profile.annualIncome, icon: '💰' },
    { label: 'Highest Qualification', value: profile.education, icon: '🎓' },
    { label: 'Education Field', value: profile.educationField, icon: '📚' },
    { label: 'College', value: profile.college, icon: '🏛' },
  ].filter((r) => r.value);

  // Partner preferences (Section 18) — grouped below into "Who is X looking for"

  // ─── "Who is X looking for" — grouped preferences w/ match check (reference) ───
  const normStr = (s?: any) => (s ?? '').toString().trim().toLowerCase();
  const myReligion = normStr((currentUser as any)?.religion);
  const myTongue = normStr((currentUser as any)?.motherTongue);
  const myMarital = normStr((currentUser as any)?.maritalStatus);
  const myCountry = normStr((currentUser as any)?.country) || 'india';
  const meetsPref = (mine: string, pref: string) => {
    const p = normStr(pref);
    if (!mine || !p || p === 'any' || p === 'open to all') return true;
    return p.includes(mine) || mine.includes(p);
  };

  const heightPref = profile.partnerMinHeight && profile.partnerMaxHeight
    ? `${profile.partnerMinHeight} - ${profile.partnerMaxHeight} cm`
    : `5'3" to 6'0"`;
  const agePref = profile.partnerMinAge && profile.partnerMaxAge
    ? `${profile.partnerMinAge} to ${profile.partnerMaxAge} Years`
    : '23 to 33 Years';
  const maritalPref = profile.partnerMaritalStatus || 'Never Married';
  const religionPref = profile.partnerReligion || profile.religion || 'Open to all';
  const tonguePref = profile.partnerMotherTongue || profile.motherTongue || 'Any';
  const countryPref = profile.partnerCountry || 'India';
  const eduPref = profile.partnerEducation || 'Graduate & above';
  const professionPref = profile.partnerProfession || 'Any';
  const incomePref = profile.partnerIncome || 'Rs. 4 Lakh & above';

  const lookingForGroups: { title: string; rows: { label: string; value: string; matched: boolean }[] }[] = [
    {
      title: 'Basic Details',
      rows: [
        { label: 'Height', value: heightPref, matched: true },
        { label: 'Age', value: agePref, matched: true },
        { label: 'Marital Status', value: maritalPref, matched: meetsPref(myMarital, maritalPref) },
        { label: 'Religion', value: religionPref, matched: meetsPref(myReligion, religionPref) },
        { label: 'Mother Tongue', value: tonguePref, matched: meetsPref(myTongue, tonguePref) },
        { label: 'Country', value: countryPref, matched: meetsPref(myCountry, countryPref) },
      ],
    },
    {
      title: 'Desired Education & Occupation',
      rows: [
        { label: 'Education', value: eduPref, matched: true },
        { label: 'Profession', value: professionPref, matched: true },
        { label: 'Earning', value: incomePref, matched: true },
      ],
    },
  ];
  const prefRowsFlat = lookingForGroups.flatMap((g) => g.rows);
  const prefTotal = prefRowsFlat.length;
  const prefMatched = prefRowsFlat.filter((r) => r.matched).length;
  const herPoss = isFemale ? 'her' : 'his';
  const subjLower = isFemale ? 'she' : 'he';
  const myPhoto = (currentUser as any)?.photos?.[0]?.url || (currentUser as any)?.profilePhoto || (currentUser as any)?.avatar || null;
  const herPhoto = photos[0]?.url || currentPhoto;

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ flex: 1, transform: [{ translateX: Animated.add(swipeX, slideAnim) }] }}
        {...panResponder.panHandlers}
      >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ─── Photo Gallery (sections 2 & 3) ─── */}
        <View style={styles.photoSection}>
          <TouchableOpacity activeOpacity={1} onPress={openGallery} style={StyleSheet.absoluteFill}>
            <Image source={{ uri: currentPhoto }} style={styles.mainPhoto} />
          </TouchableOpacity>
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)']}
            style={styles.photoOverlay}
            pointerEvents="none"
          />

          {/* Photo indicators (dots) */}
          {photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {photos.map((_: any, i: number) => (
                <View key={i} style={[styles.indicator, i === currentPhotoIndex && styles.indicatorActive]} />
              ))}
            </View>
          )}

          {/* Prev / Next arrows + tap zones */}
          {currentPhotoIndex > 0 && (
            <TouchableOpacity style={styles.navArrowLeft} onPress={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}>
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </TouchableOpacity>
          )}
          {currentPhotoIndex < photos.length - 1 && (
            <TouchableOpacity style={styles.navArrowRight} onPress={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}>
              <Ionicons name="chevron-forward" size={22} color={Colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.tapLeft} onPress={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))} />
          <TouchableOpacity style={styles.tapRight} onPress={() => setCurrentPhotoIndex((i) => Math.min(photos.length - 1, i + 1))} />

          {/* Top bar: back / counter / three-dot */}
          <SafeAreaView style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            {photos.length > 0 && (
              <View style={styles.counterPill}>
                <Ionicons name="images-outline" size={13} color={Colors.white} />
                <Text style={styles.counterText}>{currentPhotoIndex + 1} / {photos.length} Photos</Text>
              </View>
            )}
            <TouchableOpacity style={styles.topActionBtn} onPress={showMoreOptions}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ─── Profile Content ─── */}
        <View style={styles.content}>
          {/* Header (section 3) */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{fullName}</Text>
              {profile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={13} color={Colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.ageLocation}>
              {profile.age ? `${profile.age} Years` : ''}
              {profile.height ? `  •  ${Math.floor(profile.height / 30.48)}'${Math.round((profile.height % 30.48) / 2.54)}"` : ''}
              {profile.city ? `  •  ${profile.city}` : ''}
            </Text>
            {profile.profession && <Text style={styles.professionText}>{profile.profession}</Text>}
            {profile.user?.lastActive && (
              <View style={styles.lastActiveRow}>
                <View style={[styles.onlineDot, isOnline(profile.user.lastActive) && styles.onlineDotActive]} />
                <Text style={styles.lastActiveText}>
                  {isOnline(profile.user.lastActive) ? 'Online now' : `Active ${formatLastActive(profile.user.lastActive)}`}
                </Text>
              </View>
            )}
            {relationshipNote && (
              <View style={styles.interestNote}>
                <Ionicons name="heart" size={14} color={Colors.love} />
                <Text style={styles.interestNoteText}>{relationshipNote}</Text>
              </View>
            )}
          </View>

          {/* Connect button (section 1) — animated interest */}
          <InterestButton
            variant="full"
            status={interestStatus}
            onSend={sendInterest}
            style={styles.connectWrap}
          />
          {(connectStatus === 'interested' || connectStatus === 'sent') && (
            <TouchableOpacity onPress={handleCancelInterest} style={styles.cancelInterestBtn}>
              <Text style={styles.cancelInterestText}>Cancel Request</Text>
            </TouchableOpacity>
          )}

          {/* Match Percentage (section 10 / 19 — detailed) */}
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <View>
                <Text style={styles.matchTitle}>❤️ Compatibility Analysis</Text>
                <Text style={styles.matchSub}>{matchedCount} of {prefChecks.length} Preferences Match</Text>
              </View>
              <View style={styles.matchPercentBadge}>
                <Text style={styles.matchPercentText}>{matchPercent}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient colors={Colors.gradientPrimary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${matchPercent}%` }]} />
            </View>
            <View style={styles.prefGrid}>
              {prefChecks.map((p, i) => (
                <View key={i} style={styles.prefItem}>
                  <Ionicons name={p.matched ? 'checkmark-circle' : 'close-circle'} size={15} color={p.matched ? Colors.success : Colors.error} />
                  <Text style={[styles.prefLabel, !p.matched && styles.prefLabelUnmatched]}>{p.label}</Text>
                </View>
              ))}
            </View>
            {prefChecks.some((p) => !p.matched) && (
              <View style={styles.diffNote}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.gold} />
                <Text style={styles.diffNoteText}>
                  Differences: {prefChecks.filter((p) => !p.matched).map((p) => p.label).join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* About (section 4) */}
          {profile.bio && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About {isFemale ? 'Her' : 'Him'}</Text>
              <Text style={styles.bioText} numberOfLines={aboutExpanded ? undefined : 4}>{profile.bio}</Text>
              {profile.bio.length > 160 && (
                <TouchableOpacity onPress={toggleAbout}>
                  <Text style={styles.viewMore}>{aboutExpanded ? 'View Less' : 'View More'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Hobbies & Interests (section 5) */}
          {hobbiesArr.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Hobbies & Interests</Text>
              <View style={styles.hobbyRow}>
                {hobbiesArr.map((hobby, i) => (
                  <View key={i} style={styles.hobbyChip}>
                    <Text style={styles.hobbyEmoji}>{hobbyIcon(hobby)}</Text>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Profile Information (section 6) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            {infoRows.map((row, i) => (
              <View key={i} style={[styles.infoRow, i === infoRows.length - 1 && styles.infoRowLast]}>
                <Text style={styles.infoLabel}>{row.icon}  {row.label}</Text>
                <View style={styles.infoValueWrap}>
                  <Text style={styles.infoValue}>{row.value}</Text>
                  {row.copyable && (
                    <TouchableOpacity onPress={handleCopyId} style={styles.copyBtn}>
                      <Ionicons name="copy-outline" size={15} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Contact Details (section 7) */}
          <View style={styles.card}>
            <View style={styles.contactHeader}>
              <Text style={styles.cardTitle}>Contact Details</Text>
              {(isPremium || contactRevealed) && <Ionicons name="lock-open" size={16} color={Colors.success} />}
              {!isPremium && !contactRevealed && <Ionicons name="lock-closed" size={16} color={Colors.gold} />}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱  Phone</Text>
              <Text style={styles.infoValue}>
                {contactRevealed && isPremium ? (profile.mobileNumber || 'Not shared') : maskPhone(profile.mobileNumber)}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>📧  Email</Text>
              <Text style={styles.infoValue}>
                {contactRevealed && isPremium ? (profile.user?.email || 'Not shared') : maskEmail(profile.user?.email)}
              </Text>
            </View>
            {!(contactRevealed && isPremium) && (
              <TouchableOpacity style={styles.viewContactBtn} onPress={handleViewContact}>
                <Ionicons name="lock-open-outline" size={18} color={Colors.white} />
                <Text style={styles.viewContactText}>View Contact Details</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Family Details (section 8) */}
          {familyRows.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👨‍👩‍👧 Family Details</Text>
              {familyRows.map((row, i) => (
                <View key={i} style={[styles.infoRow, i === familyRows.length - 1 && styles.infoRowLast]}>
                  <Text style={styles.infoLabel}>{row.icon}  {row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Career & Education (section 9) */}
          {careerRows.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💼 Career & Education</Text>
              {careerRows.map((row, i) => (
                <View key={i} style={[styles.infoRow, i === careerRows.length - 1 && styles.infoRowLast]}>
                  <Text style={styles.infoLabel}>{row.icon}  {row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Who is X looking for (reference redesign) */}
          <View style={styles.lookingCard}>
            <View style={styles.lookingAvatars}>
              <Image source={{ uri: herPhoto }} style={[styles.lookingAvatar, styles.lookingAvatarFront]} />
              {myPhoto ? (
                <Image source={{ uri: myPhoto }} style={styles.lookingAvatar} />
              ) : (
                <View style={[styles.lookingAvatar, styles.lookingAvatarFallback]}>
                  <Ionicons name="person" size={22} color={Colors.textTertiary} />
                </View>
              )}
            </View>
            <Text style={styles.lookingTitle}>Who is {subjLower} looking for…</Text>
            <View style={styles.lookingMeetPill}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.lookingMeetText}>You meet {prefMatched}/{prefTotal} of {herPoss} preferences</Text>
            </View>

            <View style={styles.lookingColHeader}>
              <Text style={styles.lookingColTxt}>{isFemale ? 'Her' : 'His'} Preferences</Text>
              <Text style={styles.lookingColTxt}>You Match</Text>
            </View>

            {lookingForGroups.map((group) => (
              <View key={group.title} style={styles.lookingGroup}>
                <Text style={styles.lookingGroupTitle}>{group.title}</Text>
                {group.rows.map((row, i) => (
                  <View key={row.label} style={[styles.lookingRow, i === group.rows.length - 1 && styles.lookingRowLast]}>
                    <View style={{ flex: 1, paddingRight: Spacing.md }}>
                      <Text style={styles.lookingRowLabel}>{row.label}</Text>
                      <Text style={styles.lookingRowValue}>{row.value}</Text>
                    </View>
                    <View style={row.matched ? styles.lookingCheck : styles.lookingCheckMuted}>
                      <Ionicons name={row.matched ? 'checkmark' : 'remove'} size={16} color={row.matched ? Colors.white : Colors.textTertiary} />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Things in Common (section 11) */}
          {commonItems.length > 0 && (
            <LinearGradient colors={['#FFF7ED', '#FEF2F2']} style={styles.commonCard}>
              <View style={styles.commonHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.gold} />
                <Text style={styles.commonTitle}>Common Between Both of You</Text>
              </View>
              {commonItems.map((item, i) => (
                <View key={i} style={styles.commonRow}>
                  <Text style={styles.commonEmoji}>{item.icon}</Text>
                  <Text style={styles.commonText}>{item.text}</Text>
                </View>
              ))}
            </LinearGradient>
          )}

          {/* Kundali */}
          <TouchableOpacity style={styles.kundaliCard} onPress={() => navigation.navigate('Kundali', { userId })}>
            <LinearGradient colors={Colors.gradientPurple as any} style={styles.kundaliGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="planet" size={24} color={Colors.white} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.kundaliTitle}>Kundali Compatibility</Text>
                <Text style={styles.kundaliSub}>Check 36-point Guna Milan</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Swipe hint (Section 24) */}
          {navList.length > 1 && (
            <View style={styles.swipeHint}>
              <Ionicons name="swap-horizontal" size={16} color={Colors.textTertiary} />
              <Text style={styles.swipeHintText}>Swipe left or right to browse profiles</Text>
            </View>
          )}
        </View>
      </ScrollView>
      </Animated.View>

      {/* ─── Fixed Bottom Action Dock (reference redesign) ─── */}
      {isDeclined ? (
        <View style={styles.bottomDock}>
          <View style={styles.declinedBar}>
            <Ionicons name="close-circle" size={18} color={Colors.loveLight} />
            <Text style={styles.declinedDockText}>Your interest was declined. Explore other profiles.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.bottomDock}>
          {canCommunicate ? (
            <>
              <DockAction icon="chatbubble" label="Chat" onPress={handleChat} tint={Colors.primary} />
              <DockAction icon="logo-whatsapp" label="WhatsApp" onPress={handleWhatsApp} tint="#25D366" />
              <DockAction icon="call" label="Call" onPress={handleCall} tint={Colors.accent} />
              <DockAction icon={shortlisted ? 'star' : 'star-outline'} label="Shortlist" onPress={handleShortlist} tint={Colors.gold} active={shortlisted} />
            </>
          ) : (
            <>
              <DockAction
                icon={interestStatus === 'none' ? 'mail' : 'checkmark-circle'}
                label={interestStatus === 'none' ? 'Interest' : 'Sent'}
                onPress={handleInterest}
                tint={Colors.love}
                highlight
              />
              <DockAction icon="heart" label="Super Interest" onPress={handleSuperInterest} tint={Colors.secondaryDark} />
              <DockAction icon={shortlisted ? 'star' : 'star-outline'} label="Shortlist" onPress={handleShortlist} tint={Colors.gold} active={shortlisted} />
              <DockAction icon="chatbubble-ellipses" label="Chat" onPress={handleChat} tint={Colors.primary} />
            </>
          )}
        </View>
      )}

      {/* ─── Premium Bottom Sheet (section 7) ─── */}
      <Modal visible={showPremiumSheet} transparent animationType="slide" onRequestClose={() => setShowPremiumSheet(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowPremiumSheet(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <LinearGradient colors={Colors.gradientGold as any} style={styles.sheetIcon}>
              <Ionicons name="diamond" size={28} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.sheetTitle}>Unlock Contact Details</Text>
            <Text style={styles.sheetSub}>Upgrade to Premium to view phone numbers, chat on WhatsApp & make calls with your matches.</Text>
            <View style={styles.sheetBenefits}>
              {['View phone & email', 'WhatsApp & voice calls', 'Unlimited interests', 'Priority visibility'].map((b, i) => (
                <View key={i} style={styles.sheetBenefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.sheetBenefitText}>{b}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.subscribeBtn} onPress={() => { setShowPremiumSheet(false); navigation.navigate('Premium'); }}>
              <LinearGradient colors={Colors.gradientPrimary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subscribeGradient}>
                <Text style={styles.subscribeText}>Subscribe Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPremiumSheet(false)}>
              <Text style={styles.sheetDismiss}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  photoSection: { width, height: height * 0.55, position: 'relative' },
  mainPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: { ...StyleSheet.absoluteFillObject },
  photoIndicators: {
    position: 'absolute', top: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4, paddingHorizontal: Spacing.xl,
  },
  indicator: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 2, maxWidth: 60,
  },
  indicatorActive: { backgroundColor: Colors.white },
  navArrowLeft: {
    position: 'absolute', left: Spacing.md, top: '50%', marginTop: -18,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  navArrowRight: {
    position: 'absolute', right: Spacing.md, top: '50%', marginTop: -18,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  tapLeft: { position: 'absolute', left: 0, top: 60, bottom: 60, width: '35%' },
  tapRight: { position: 'absolute', right: 0, top: 60, bottom: 60, width: '35%' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, zIndex: 3,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  counterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  counterText: { ...Typography.caption1, color: Colors.white, fontWeight: '600' },
  topActionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    marginTop: -24, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    backgroundColor: Colors.background, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.xl,
  },
  nameSection: { marginBottom: Spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { ...Typography.title1, color: Colors.textPrimary },
  verifiedBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center',
  },
  ageLocation: { ...Typography.callout, color: Colors.textSecondary, marginTop: 4 },
  professionText: { ...Typography.subhead, color: Colors.textSecondary, marginTop: 2 },
  lastActiveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textTertiary },
  onlineDotActive: { backgroundColor: Colors.success },
  lastActiveText: { ...Typography.caption1, color: Colors.textTertiary },
  interestNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md,
    alignSelf: 'flex-start', backgroundColor: Colors.loveSoft,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  interestNoteText: { ...Typography.footnote, color: Colors.loveDark, fontWeight: '600' },

  // Connect button
  connectWrap: { marginBottom: Spacing.sm },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.glow,
  },
  connectText: { ...Typography.bodyBold, color: Colors.white },
  cancelInterestBtn: { alignSelf: 'center', paddingVertical: Spacing.sm, marginBottom: Spacing.md },
  cancelInterestText: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600' },

  // Generic card
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.small,
  },
  cardTitle: { ...Typography.headline, color: Colors.textPrimary, marginBottom: Spacing.md },
  bioText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },
  viewMore: { ...Typography.footnote, color: Colors.primary, fontWeight: '700', marginTop: Spacing.sm },

  // Hobbies
  hobbyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hobbyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primarySoft, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  hobbyEmoji: { fontSize: 14 },
  hobbyText: { ...Typography.footnote, color: Colors.primary, fontWeight: '600' },

  // Info rows
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { ...Typography.subhead, color: Colors.textTertiary, flex: 1 },
  infoValueWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1, justifyContent: 'flex-end' },
  infoValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600', textAlign: 'right' },
  copyBtn: { padding: 2 },

  // Contact
  contactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewContactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
  },
  viewContactText: { ...Typography.footnote, color: Colors.white, fontWeight: '700' },

  // Match card
  matchCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.small,
    borderWidth: 1, borderColor: Colors.primaryMuted,
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  matchTitle: { ...Typography.headline, color: Colors.textPrimary },
  matchSub: { ...Typography.footnote, color: Colors.textSecondary, marginTop: 2 },
  matchPercentBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySoft,
  },
  matchPercentText: { ...Typography.bodyBold, color: Colors.primary },
  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  prefItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '50%', marginBottom: Spacing.sm },
  prefLabel: { ...Typography.footnote, color: Colors.textPrimary },
  prefLabelUnmatched: { color: Colors.textTertiary },
  diffNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md,
    backgroundColor: Colors.goldSoft, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  diffNoteText: { ...Typography.footnote, color: Colors.goldDark, flex: 1 },

  // Common card
  commonCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.goldLight,
  },
  commonHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  commonTitle: { ...Typography.headline, color: Colors.textPrimary },
  commonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  commonEmoji: { fontSize: 16 },
  commonText: { ...Typography.subhead, color: Colors.textSecondary, flex: 1 },

  // Kundali
  kundaliCard: { marginBottom: Spacing.md },
  kundaliGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadius.xl,
  },
  kundaliTitle: { ...Typography.bodyBold, color: Colors.white },
  kundaliSub: { ...Typography.caption1, color: 'rgba(255,255,255,0.8)' },

  // Swipe hint (Section 24)
  swipeHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, marginBottom: Spacing.lg, opacity: 0.6,
  },
  swipeHintText: { ...Typography.caption1, color: Colors.textTertiary },

  // "Who is X looking for" (reference redesign)
  lookingCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.small,
  },
  lookingAvatars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  lookingAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: Colors.white,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  lookingAvatarFront: { marginRight: -16, zIndex: 2 },
  lookingAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
  lookingTitle: { ...Typography.headline, color: Colors.textPrimary, textAlign: 'center', fontWeight: '700', fontSize: 18 },
  lookingMeetPill: {
    flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6,
    marginTop: 6, marginBottom: Spacing.lg,
  },
  lookingMeetText: { ...Typography.footnote, color: Colors.successDark, fontWeight: '600' },
  lookingColHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingBottom: Spacing.sm, marginBottom: Spacing.sm,
  },
  lookingColTxt: { ...Typography.caption1, color: Colors.textTertiary, fontWeight: '600' },
  lookingGroup: {
    backgroundColor: '#F9FAFB', borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  lookingGroupTitle: {
    ...Typography.caption1, color: Colors.textSecondary, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingTop: Spacing.sm, paddingBottom: 4,
  },
  lookingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  lookingRowLast: { borderBottomWidth: 0 },
  lookingRowLabel: { ...Typography.caption1, color: Colors.textTertiary },
  lookingRowValue: { ...Typography.subhead, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
  lookingCheck: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  lookingCheckMuted: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Bottom Action Dock (reference redesign)
  bottomDock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start',
    backgroundColor: '#3D0C15',
    paddingTop: 14, paddingBottom: 30, paddingHorizontal: Spacing.sm,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22, shadowRadius: 16, elevation: 16,
  },
  dockAction: { alignItems: 'center', gap: 6, flex: 1 },
  dockIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
  },
  dockLabel: { ...Typography.caption2, color: 'rgba(255,255,255,0.88)', fontWeight: '600' },
  declinedDockText: { ...Typography.footnote, color: 'rgba(255,255,255,0.9)', flex: 1 },

  // Bottom Action Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: Colors.white, paddingTop: 12, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  bottomAction: { alignItems: 'center', gap: 6 },
  bottomIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  bottomActionLabel: { ...Typography.caption2, color: Colors.textSecondary, fontWeight: '600' },
  bottomActionLabelDisabled: { color: Colors.textTertiary },
  declinedBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    flex: 1, paddingHorizontal: Spacing.md,
  },
  declinedBarText: { ...Typography.footnote, color: Colors.textSecondary, flex: 1 },

  // Premium sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl, paddingBottom: Spacing.huge, alignItems: 'center',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: Spacing.lg },
  sheetIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  sheetTitle: { ...Typography.title2, color: Colors.textPrimary },
  sheetSub: { ...Typography.subhead, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg },
  sheetBenefits: { alignSelf: 'stretch', marginBottom: Spacing.lg, gap: Spacing.sm },
  sheetBenefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sheetBenefitText: { ...Typography.body, color: Colors.textPrimary },
  subscribeBtn: { alignSelf: 'stretch', marginBottom: Spacing.md },
  subscribeGradient: { paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center' },
  subscribeText: { ...Typography.bodyBold, color: Colors.white },
  sheetDismiss: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600' },
});
