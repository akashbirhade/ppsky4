import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * useReducedMotion (Section 17 — Accessibility)
 * Returns true when the user has enabled "Reduce Motion" in their OS settings.
 * Animation primitives use this to fall back to instant / minimal transitions.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduced(enabled);
    });

    return () => {
      mounted = false;
      // RN >= 0.65 returns a subscription with remove()
      sub?.remove?.();
    };
  }, []);

  return reduced;
};
