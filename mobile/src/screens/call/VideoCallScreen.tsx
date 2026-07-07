import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui';
import { callService } from '@/services';
import { Colors, Spacing, Typography } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export const VideoCallScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { receiverId, type, callId } = route.params;
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'AUDIO');

  useEffect(() => {
    initiateCall();
    return () => { /* cleanup WebRTC */ };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const initiateCall = async () => {
    try {
      await callService.initiateCall({ receiverId, type });
      setCallState('ringing');
      // Simulate connection for demo
      setTimeout(() => setCallState('connected'), 3000);
    } catch {
      setCallState('ended');
    }
  };

  const handleEndCall = async () => {
    if (callId) {
      await callService.endCall(callId).catch(() => {});
    }
    navigation.goBack();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradientDark as any}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.content}>
        {/* Call Info */}
        <View style={styles.callInfo}>
          <Avatar name="User" size={80} />
          <Text style={styles.callerName}>Calling...</Text>
          <Text style={styles.callStatus}>
            {callState === 'connecting' && 'Connecting...'}
            {callState === 'ringing' && 'Ringing...'}
            {callState === 'connected' && formatDuration(duration)}
            {callState === 'ended' && 'Call Ended'}
          </Text>
          <View style={styles.callType}>
            <Ionicons
              name={type === 'VIDEO' ? 'videocam' : 'call'}
              size={16}
              color={Colors.white}
            />
            <Text style={styles.callTypeText}>
              {type === 'VIDEO' ? 'Video Call' : 'Voice Call'}
            </Text>
          </View>
        </View>

        {/* Call Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? Colors.primary : Colors.white}
            />
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-medium'}
              size={24}
              color={isSpeaker ? Colors.primary : Colors.white}
            />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>

          {type === 'VIDEO' && (
            <TouchableOpacity
              style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
            >
              <Ionicons
                name={isVideoOff ? 'videocam-off' : 'videocam'}
                size={24}
                color={isVideoOff ? Colors.primary : Colors.white}
              />
              <Text style={styles.controlLabel}>Camera</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="camera-reverse" size={24} color={Colors.white} />
            <Text style={styles.controlLabel}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={28} color={Colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xxl },
  callInfo: { alignItems: 'center', marginTop: height * 0.15 },
  callerName: { ...Typography.title1, color: Colors.white, marginTop: Spacing.xl },
  callStatus: { ...Typography.callout, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.sm },
  callType: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 20,
  },
  callTypeText: { ...Typography.footnote, color: Colors.white },
  controls: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.xxl,
  },
  controlBtn: { alignItems: 'center', gap: Spacing.sm },
  controlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30, width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  controlLabel: { ...Typography.caption2, color: 'rgba(255,255,255,0.7)' },
  endCallBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
});
