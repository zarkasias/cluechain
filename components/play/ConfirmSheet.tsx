import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, layout, motion, radius, space, type } from '@/constants/theme';

type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const OFFSCREEN = 400;

/** A small slide-up bottom sheet with a scrim. Used instead of Alert so it matches on every platform. */
export default function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    const duration = reduceMotion ? motion.fast : motion.base;
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      progress.value = withTiming(0, { duration });
      const t = setTimeout(() => setMounted(false), duration);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, progress, reduceMotion]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? progress.value : 1,
    transform: [{ translateY: reduceMotion ? 0 : (1 - progress.value) * OFFSCREEN }],
  }));

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }, sheetStyle]}
          accessibilityViewIsModal
          aria-modal
          role="dialog"
          aria-label={title}
        >
          <View style={styles.handle} />
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.cancelPressed]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.confirmPressed]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scrim: {
    backgroundColor: color.scrim,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.maxWidth,
    backgroundColor: color.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    gap: space.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: color.tileBorder,
    marginBottom: space.sm,
  },
  title: {
    ...type.title,
    color: color.cardInk,
  },
  message: {
    ...type.body,
    color: color.cardMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: { backgroundColor: color.tile },
  cancelPressed: { backgroundColor: color.tileBorder },
  confirm: { backgroundColor: color.linkFill },
  confirmPressed: { backgroundColor: color.linkDeep },
  cancelText: { ...type.body, fontWeight: '600', color: color.cardInk },
  confirmText: { ...type.body, fontWeight: '600', color: color.white },
});
