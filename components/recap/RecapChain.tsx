import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Eye } from 'lucide-react-native';
import { clueText } from '@/lib/game';
import type { Chain, LinkState } from '@/lib/game';
import { color, radius, space } from '@/constants/theme';

type RecapChainProps = {
  chain: Chain;
  links: LinkState[];
  /** Show each link's clue beside the connector above it (hidden on small screens). */
  showClues: boolean;
};

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "(1 hint)", "(2 misses)", "(1 hint, 1 miss)", or "" for a clean solve. */
export function linkNote(link: LinkState): string {
  if (link.revealed) return 'revealed';
  const parts: string[] = [];
  if (link.hintLetters > 0) parts.push(count(link.hintLetters, 'hint', 'hints'));
  if (link.wrongGuesses > 0) parts.push(count(link.wrongGuesses, 'miss', 'misses'));
  return parts.join(', ');
}

/** The hero of the recap: the five answers as a vertical chain, with each link's result. */
export default function RecapChain({ chain, links, showClues }: RecapChainProps) {
  return (
    <View style={styles.list}>
      {chain.links.map((link, i) => {
        const state = links[i];
        const note = linkNote(state);
        const word = link.answer.toUpperCase();
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <View style={styles.connectorRow} importantForAccessibility="no-hide-descendants" aria-hidden>
                <View style={styles.connector} />
                {showClues && (
                  <Text style={styles.clue} numberOfLines={1}>
                    {clueText(link.clue)}
                  </Text>
                )}
              </View>
            )}
            <View
              style={styles.row}
              accessible
              accessibilityLabel={`Link ${i + 1}, ${word}. ${
                state.revealed ? 'Revealed, 0 points' : `${state.value} points${note ? `, ${note}` : ''}`
              }.`}
            >
              <View style={[styles.pill, state.revealed && styles.pillRevealed]}>
                <Text
                  style={[styles.word, state.revealed && styles.wordRevealed]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  maxFontSizeMultiplier={1.4}
                >
                  {word}
                </Text>
              </View>
              <View style={styles.result}>
                <View style={styles.valueRow}>
                  {state.revealed ? (
                    <Eye size={16} color={color.inkMuted} />
                  ) : (
                    <Check size={16} color={color.success} strokeWidth={3} />
                  )}
                  <Text style={[styles.value, state.revealed && styles.valueRevealed]}>{state.value}</Text>
                </View>
                {note !== '' && <Text style={styles.note}>{note}</Text>}
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const PILL_HEIGHT = 40;
/** The connector sits under the pill's left edge plus this inset. */
const CONNECTOR_INSET = 24;

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    minHeight: PILL_HEIGHT + space.xs,
  },
  pill: {
    flexShrink: 1,
    minHeight: PILL_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: color.linkFill,
    borderWidth: 2,
    borderColor: color.linkFill,
  },
  pillRevealed: {
    backgroundColor: 'transparent',
    borderColor: color.link,
  },
  word: {
    fontFamily: 'Play-Bold',
    fontSize: 18,
    letterSpacing: 1,
    color: color.white,
  },
  wordRevealed: {
    color: color.ink,
  },
  result: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  value: {
    fontFamily: 'Play-Bold',
    fontSize: 18,
    color: color.ink,
    fontVariant: ['tabular-nums'],
    minWidth: 32,
    textAlign: 'right',
  },
  valueRevealed: {
    color: color.inkMuted,
  },
  note: {
    fontSize: 13,
    lineHeight: 16,
    color: color.inkMuted,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 22,
    paddingLeft: CONNECTOR_INSET,
    gap: space.md,
  },
  connector: {
    alignSelf: 'stretch',
    width: 3,
    borderRadius: 2,
    backgroundColor: color.link,
  },
  clue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    color: color.inkMuted,
    paddingVertical: 2,
  },
});
