import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { Check, Lightbulb, Sparkles, X } from 'lucide-react-native';
import { color, space, type } from '@/constants/theme';

export type Feedback =
  | { kind: 'wrong'; variant: number }
  | { kind: 'near' }
  | { kind: 'correct'; word: string }
  | { kind: 'hint'; cost: number }
  | null;

const WRONG_COPY = ['Not quite — try again.', 'Nope, keep going!', 'Not that one.'];

export function feedbackMessage(feedback: Feedback): string {
  if (!feedback) return '';
  switch (feedback.kind) {
    case 'wrong':
      return WRONG_COPY[feedback.variant % WRONG_COPY.length];
    case 'near':
      return 'So close! Check your spelling.';
    case 'correct':
      return `Nice! ${feedback.word.toUpperCase()} joins the chain.`;
    case 'hint':
      return `Hint used: −${feedback.cost}`;
  }
}

const ICONS = {
  wrong: { Icon: X, tint: color.error },
  near: { Icon: Sparkles, tint: color.gold },
  correct: { Icon: Check, tint: color.success },
  hint: { Icon: Lightbulb, tint: color.gold },
} as const;

/** A fixed-height line between the card and the input, announced to screen readers. */
export default function FeedbackLine({ feedback }: { feedback: Feedback }) {
  const message = feedbackMessage(feedback);

  useEffect(() => {
    // Android and web use the live region; iOS needs an explicit announcement.
    if (message && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [message, feedback]);

  const icon = feedback ? ICONS[feedback.kind] : null;

  return (
    <View style={styles.line} accessibilityLiveRegion="polite" aria-live="polite">
      {icon && <icon.Icon size={16} color={icon.tint} strokeWidth={2.5} />}
      <Text style={styles.text} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.xs,
  },
  text: {
    ...type.body,
    lineHeight: 20,
    flex: 1,
    color: color.ink,
  },
});
