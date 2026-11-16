import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// A thin wrapper over expo-haptics. A no-op on web and when the player has
// turned haptics off (`settings.haptics`, synced by GameProvider).

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function run(fn: () => Promise<void>) {
  if (!enabled || Platform.OS === 'web') return;
  fn().catch(() => {});
}

export const haptics = {
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  selection: () => run(() => Haptics.selectionAsync()),
};
