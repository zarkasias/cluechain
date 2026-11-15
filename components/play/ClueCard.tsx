import React, { ReactNode, Ref, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { clueText, parseClue } from '@/lib/game';
import type { Link } from '@/lib/game';
import { color, radius, space, type } from '@/constants/theme';
import LinkChip from './LinkChip';

type ClueCardProps = {
  link: Link;
  /** 0-based link index. */
  linkIndex: number;
  /** Rendered under the clue (the letter tiles). */
  children?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Ref to the link chip (links 2–5), for measuring it. */
  linkChipRef?: Ref<React.ComponentRef<typeof View>>;
  /** Pulse the link chip on mount. Defaults to true for links 2–5. */
  pulse?: boolean;
};

type Piece = { text: string; isLink: boolean };

/**
 * Groups clue text into unbreakable "words" so the clue can wrap in a flex row
 * while the link chip stays a real View (padding, radius and a pulse all work
 * on native, unlike nested Text). Pieces with no whitespace between them stay
 * together, e.g. "{BANANA}-yellow".
 */
function toWordGroups(clue: string): Piece[][] {
  const groups: Piece[][] = [];
  let current: Piece[] = [];
  const close = () => {
    if (current.length) groups.push(current);
    current = [];
  };
  for (const seg of parseClue(clue)) {
    if (seg.isLink) {
      current.push({ text: seg.text, isLink: true });
      continue;
    }
    for (const token of seg.text.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) close();
      else current.push({ text: token, isLink: false });
    }
  }
  close();
  return groups;
}

const CLUE_SCALE = 1.6;

export default function ClueCard({
  link,
  linkIndex,
  children,
  compact,
  style,
  linkChipRef,
  pulse = linkIndex > 0,
}: ClueCardProps) {
  const groups = useMemo(() => toWordGroups(link.clue), [link.clue]);
  const clueStyle = compact ? styles.clueCompact : styles.clue;

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <Text style={styles.label} maxFontSizeMultiplier={1.3}>
        Link {linkIndex + 1} of 5
      </Text>
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <View
          style={styles.clueRow}
          accessible
          accessibilityRole="text"
          accessibilityLabel={clueText(link.clue)}
        >
          {groups.map((group, gi) => (
            <View
              key={gi}
              style={styles.group}
              importantForAccessibility="no-hide-descendants"
            >
              {group.map((piece, pi) =>
                piece.isLink ? (
                  <LinkChip
                    key={pi}
                    word={piece.text}
                    textStyle={clueStyle}
                    pulse={pulse}
                    chipRef={linkChipRef}
                    maxFontSizeMultiplier={CLUE_SCALE}
                  />
                ) : (
                  <Text
                    key={pi}
                    style={clueStyle}
                    maxFontSizeMultiplier={CLUE_SCALE}
                  >
                    {piece.text}
                  </Text>
                ),
              )}
            </View>
          ))}
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.card,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
    shadowColor: color.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardCompact: {
    padding: space.lg,
    gap: space.sm,
  },
  /** Clue + tiles, centred together in any extra card height. */
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: space.lg,
  },
  bodyCompact: {
    gap: space.sm,
  },
  label: {
    ...type.label,
    color: color.cardMuted,
  },
  clueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 6,
    rowGap: 2,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clue: {
    ...type.clue,
    color: color.cardInk,
  },
  clueCompact: {
    ...type.clue,
    fontSize: 19,
    lineHeight: 26,
    color: color.cardInk,
  },
});
