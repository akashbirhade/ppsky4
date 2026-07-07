import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { authService } from '@/services';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export const OtpVerifyScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email, type } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyEmail({ email, otp: code });
      Alert.alert('Verified!', 'Your email has been verified successfully.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.sendEmailOtp(email);
      setResendTimer(30);
      Alert.alert('Sent!', 'A new OTP has been sent to your email.');
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify"
          onPress={handleVerify}
          variant="gradient"
          size="lg"
          loading={loading}
          fullWidth
        />

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  backBtn: {
    marginTop: Spacing.md, marginLeft: Spacing.xxl,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  content: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.huge,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: { ...Typography.title2, color: Colors.textPrimary, marginBottom: Spacing.md },
  subtitle: { ...Typography.callout, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  email: { color: Colors.primary, fontWeight: '600' },
  otpRow: {
    flexDirection: 'row', gap: Spacing.md,
    marginVertical: Spacing.xxxl,
  },
  otpInput: {
    width: 48, height: 56, borderRadius: BorderRadius.lg,
    borderWidth: 2, borderColor: Colors.border,
    textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  resendBtn: { marginTop: Spacing.xxl },
  resendText: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  resendDisabled: { color: Colors.textTertiary },
});
