import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/context/GameContext';
import { color, motion, radius, space } from '@/constants/theme';

type ToastProps = {
  message: string;
  /** Change this to show the toast again (e.g. a counter). 0 hides it. */
  showKey: number;
  durationMs?: number;
};

/** A small pill at the bottom of its container that fades in, holds, then fades out. */
export default function Toast({ message, showKey, durationMs = 1600 }: ToastProps) {
  const reduceMotion = useReduceMotion();
  const [visible, setVisible] = useState(false);
  const opacity = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (showKey === 0) return;
    setVisible(true);
    AccessibilityInfo.announceForAccessibility(message);
    const fadeIn = reduceMotion ? motion.fast : motion.base;
    opacity.value = 0;
    y.value = reduceMotion ? 0 : 8;
    opacity.value = withTiming(1, { duration: fadeIn });
    y.value = withTiming(0, { duration: fadeIn });
    opacity.value = withDelay(durationMs, withTiming(0, { duration: motion.base }));
    const t = setTimeout(() => setVisible(false), durationMs + motion.base);
    return () => clearTimeout(t);
  }, [showKey, message, durationMs, reduceMotion, opacity, y]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.toast, style]} pointerEvents="none" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: space.xl,
    alignSelf: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    shadowColor: color.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: color.cardInk,
  },
});
