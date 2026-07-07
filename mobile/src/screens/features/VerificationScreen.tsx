import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { verificationService } from '../../services';

type VerificationStep = 'intro' | 'document' | 'selfie' | 'review' | 'submitted';

const DOC_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card', icon: 'card-outline' },
  { key: 'passport', label: 'Passport', icon: 'globe-outline' },
  { key: 'driving_license', label: 'Driving License', icon: 'car-outline' },
  { key: 'voter_id', label: 'Voter ID', icon: 'document-outline' },
];

export default function VerificationScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState<VerificationStep>('intro');
  const [docType, setDocType] = useState('');
  const [docImage, setDocImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await verificationService.getStatus();
      const status = res.data?.data?.status;
      if (status === 'VERIFIED') {
        setExistingStatus('VERIFIED');
        setStep('submitted');
      } else if (status === 'PENDING') {
        setExistingStatus('PENDING');
        setStep('submitted');
      }
    } catch {}
  };

  const pickDocument = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setDocImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access for selfie verification.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const submitVerification = async () => {
    if (!docImage || !selfieImage || !docType) return;
    setLoading(true);
    try {
      await verificationService.submit({
        type: docType,
        documentUrl: docImage,
        selfieUrl: selfieImage,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('submitted');
      setExistingStatus('PENDING');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderIntro = () => (
    <View style={styles.content}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={56} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>
        Get a verified badge on your profile. Verified profiles get 3x more responses!
      </Text>

      <View style={styles.benefitsList}>
        {[
          'Verified badge on your profile',
          'Higher visibility in search results',
          'Build trust with potential matches',
          'Access premium features',
        ].map((benefit, i) => (
          <View key={i} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep('document'); }}
      >
        <Text style={styles.primaryBtnText}>Start Verification</Text>
        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderDocumentStep = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Step 1: Choose Document Type</Text>
      <Text style={styles.stepSubtitle}>Select the type of government ID you want to upload</Text>

      <View style={styles.docTypes}>
        {DOC_TYPES.map((doc) => (
          <TouchableOpacity
            key={doc.key}
            style={[styles.docTypeCard, docType === doc.key && styles.docTypeCardActive]}
            onPress={() => { Haptics.selectionAsync(); setDocType(doc.key); }}
          >
            <Ionicons
              name={doc.icon as any}
              size={24}
              color={docType === doc.key ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.docTypeLabel, docType === doc.key && styles.docTypeLabelActive]}>
              {doc.label}
            </Text>
            {docType === doc.key && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {docType && (
        <>
          <Text style={[styles.stepSubtitle, { marginTop: Spacing.lg }]}>
            Upload a clear photo of your {DOC_TYPES.find(d => d.key === docType)?.label}
          </Text>
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            {docImage ? (
              <Image source={{ uri: docImage }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
                <Text style={styles.uploadText}>Tap to upload document</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('intro')}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.nextBtn, (!docType || !docImage) && styles.disabledBtn]}
          onPress={() => { if (docType && docImage) setStep('selfie'); }}
          disabled={!docType || !docImage}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSelfieStep = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Step 2: Take a Selfie</Text>
      <Text style={styles.stepSubtitle}>
        We'll match your selfie with the document photo for verification
      </Text>

      <View style={styles.selfieGuide}>
        <Ionicons name="person-circle-outline" size={80} color={Colors.primaryLight} />
        <Text style={styles.guideText}>Face the camera directly with good lighting</Text>
      </View>

      <TouchableOpacity style={styles.uploadArea} onPress={takeSelfie}>
        {selfieImage ? (
          <Image source={{ uri: selfieImage }} style={styles.previewImage} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={40} color={Colors.primary} />
            <Text style={styles.uploadText}>Tap to take selfie</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('document')}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.nextBtn, !selfieImage && styles.disabledBtn]}
          onPress={() => { if (selfieImage) setStep('review'); }}
          disabled={!selfieImage}
        >
          <Text style={styles.primaryBtnText}>Review</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>Please confirm your documents before submission</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Document Type</Text>
        <Text style={styles.reviewValue}>
          {DOC_TYPES.find(d => d.key === docType)?.label}
        </Text>
      </View>

      <View style={styles.reviewRow}>
        <View style={styles.reviewThumb}>
          {docImage && <Image source={{ uri: docImage }} style={styles.thumbImage} />}
          <Text style={styles.thumbLabel}>Document</Text>
        </View>
        <View style={styles.reviewThumb}>
          {selfieImage && <Image source={{ uri: selfieImage }} style={styles.thumbImage} />}
          <Text style={styles.thumbLabel}>Selfie</Text>
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('selfie')}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.nextBtn]}
          onPress={submitVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Submit</Text>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSubmitted = () => (
    <View style={styles.content}>
      <View style={[styles.iconCircle, { backgroundColor: existingStatus === 'VERIFIED' ? Colors.successSoft : Colors.goldSoft }]}>
        <Ionicons
          name={existingStatus === 'VERIFIED' ? 'shield-checkmark' : 'time-outline'}
          size={56}
          color={existingStatus === 'VERIFIED' ? Colors.success : Colors.gold}
        />
      </View>
      <Text style={styles.title}>
        {existingStatus === 'VERIFIED' ? 'Profile Verified!' : 'Under Review'}
      </Text>
      <Text style={styles.subtitle}>
        {existingStatus === 'VERIFIED'
          ? 'Your identity has been verified. You now have the verified badge!'
          : 'Your documents are being reviewed. This usually takes 24-48 hours.'}
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: Spacing.xl }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.primaryBtnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress indicator */}
      {step !== 'intro' && step !== 'submitted' && (
        <View style={styles.progressBar}>
          {['document', 'selfie', 'review'].map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                (step === s || ['document', 'selfie', 'review'].indexOf(step) > i) && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 'intro' && renderIntro()}
        {step === 'document' && renderDocumentStep()}
        {step === 'selfie' && renderSelfieStep()}
        {step === 'review' && renderReview()}
        {step === 'submitted' && renderSubmitted()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBack: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...Typography.headline, fontWeight: '700' },
  progressBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    paddingVertical: Spacing.md,
  },
  progressDot: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
  },
  progressDotActive: { backgroundColor: Colors.primary },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  content: { padding: Spacing.lg, alignItems: 'center' },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  title: { ...Typography.title2, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  benefitsList: { marginTop: Spacing.xl, width: '100%' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md },
  benefitText: { ...Typography.body, color: Colors.textPrimary },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: 14, paddingHorizontal: 24, marginTop: Spacing.xl, width: '100%',
  },
  primaryBtnText: { ...Typography.body, fontWeight: '600', color: Colors.white },
  disabledBtn: { opacity: 0.5 },
  stepTitle: { ...Typography.title3, fontWeight: '700', marginBottom: Spacing.xs, textAlign: 'center' },
  stepSubtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center' },
  docTypes: { width: '100%', marginTop: Spacing.lg, gap: 10 },
  docTypeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  docTypeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  docTypeLabel: { ...Typography.body, flex: 1, color: Colors.textSecondary },
  docTypeLabelActive: { color: Colors.primary, fontWeight: '600' },
  uploadArea: {
    width: '100%', height: 200, borderRadius: BorderRadius.lg,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySoft, justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.md, overflow: 'hidden',
  },
  uploadText: { ...Typography.callout, color: Colors.primary, marginTop: Spacing.sm },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  selfieGuide: { alignItems: 'center', marginVertical: Spacing.lg },
  guideText: { ...Typography.caption1, color: Colors.textSecondary, marginTop: Spacing.sm },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: Spacing.xl, gap: 12,
  },
  backBtn: {
    flex: 1, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  backBtnText: { ...Typography.body, fontWeight: '600', color: Colors.textSecondary },
  nextBtn: { flex: 1, marginTop: 0 },
  reviewCard: {
    width: '100%', backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  reviewLabel: { ...Typography.caption1, color: Colors.textTertiary, marginBottom: 4 },
  reviewValue: { ...Typography.body, fontWeight: '600', color: Colors.textPrimary },
  reviewRow: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, width: '100%',
  },
  reviewThumb: { flex: 1, alignItems: 'center' },
  thumbImage: {
    width: '100%', height: 120, borderRadius: BorderRadius.md, resizeMode: 'cover',
  },
  thumbLabel: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 6 },
});
