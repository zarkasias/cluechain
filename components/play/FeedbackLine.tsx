import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { Check, Lightbulb, Sparkles, X } from 'lucide-react-native';
import { color, space, type } from '@/constants/theme';

export type Feedback =
  /** Tutorial only: rotating copy, no letter check. */
  | { kind: 'wrong'; variant: number }
  /** A wrong guess of the right length (letter check). */
  | { kind: 'checked'; right: number; elsewhere: number }
  /** A wrong guess of a different length. */
  | { kind: 'length'; letters: number }
  | { kind: 'near' }
  | { kind: 'correct'; word: string }
  | { kind: 'hint'; cost: number }
  /** Tutorial only: the tiles now show the whole answer. */
  | { kind: 'answer' }
  | null;

const WRONG_COPY = ['Not quite — try again.', 'Nope, keep going!', 'Not that one.'];

export function feedbackMessage(feedback: Feedback): string {
  if (!feedback) return '';
  switch (feedback.kind) {
    case 'wrong':
      return WRONG_COPY[feedback.variant % WRONG_COPY.length];
    case 'checked':
      return feedback.right + feedback.elsewhere === 0
        ? 'No letters match — try another word.'
        : `Not quite — ${feedback.right} right, ${feedback.elsewhere} elsewhere.`;
    case 'length':
      return `Not quite — the answer has ${feedback.letters} letters.`;
    case 'near':
      return 'So close! Check your spelling.';
    case 'correct':
      return `Nice! ${feedback.word.toUpperCase()} joins the chain.`;
    case 'hint':
      return `Hint used: −${feedback.cost}`;
    case 'answer':
      return "Here's the answer. Type it in!";
  }
}

const ICONS = {
  wrong: { Icon: X, tint: color.error },
  checked: { Icon: X, tint: color.error },
  length: { Icon: X, tint: color.error },
  near: { Icon: Sparkles, tint: color.gold },
  correct: { Icon: Check, tint: color.success },
  hint: { Icon: Lightbulb, tint: color.gold },
  answer: { Icon: Lightbulb, tint: color.gold },
} as const;

type FeedbackLineProps = {
  feedback: Feedback;
  /** Read after the message but not shown, e.g. the letter-check row (DESIGN_SPEC §10). */
  detail?: string | null;
};

/** A fixed-height line between the card and the input, announced to screen readers. */
export default function FeedbackLine({ feedback, detail = null }: FeedbackLineProps) {
  const message = feedbackMessage(feedback);
  const spoken = message && detail ? `${message} ${detail}` : message;

  useEffect(() => {
    // Android and web use the live region; iOS needs an explicit announcement.
    if (spoken && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(spoken);
  }, [spoken, feedback]);

  const icon = feedback ? ICONS[feedback.kind] : null;

  return (
    <View style={styles.line} accessibilityLiveRegion="polite" aria-live="polite">
      {icon && <icon.Icon size={16} color={icon.tint} strokeWidth={2.5} />}
      <Text style={styles.text} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {message}
      </Text>
      {message && detail ? <Text style={styles.srOnly}>{detail}</Text> : null}
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
  /** Visually hidden but read by the live region. */
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
  text: {
    ...type.body,
    lineHeight: 20,
    flex: 1,
    color: color.ink,
  },
});
