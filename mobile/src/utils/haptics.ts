import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities — iPhone-style tactile responses.
 * All methods are no-ops on Android < API 26 (handled by expo-haptics).
 */

/** Light tap — tab switches, toggles, minor selections */
export const lightTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/** Medium tap — button presses, card taps, navigation */
export const mediumTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/** Heavy tap — like/superlike actions, important confirmations */
export const heavyTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/** Soft tap — subtle feedback for scroll snaps, photo changes */
export const softTap = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/** Success — match found, action completed */
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/** Warning — approaching limits, premium required */
export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/** Error — failed action, block, report */
export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/** Selection changed — picker wheels, slider stops */
export const selectionChanged = () => {
  Haptics.selectionAsync();
};
