import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { answerWords, checkLetters } from '@/lib/game';
import type { CheckedLetter, LetterMark, Link } from '@/lib/game';
import { useReduceMotion } from '@/context/GameContext';
import { color, motion, radius } from '@/constants/theme';
import { GAP, tileLayout, WORD_GAP } from './tileLayout';

const STAGGER_MS = 60;
/** Guess tiles are 80% of the answer tiles, but never below 22 (DESIGN_SPEC §2.4). */
const SCALE = 0.8;
const MIN_SIZE = 22;

type GuessRowsProps = {
  link: Link;
  /** Normalized checked guesses, oldest first (`LinkState.checkedGuesses`). */
  guesses: string[];
  /** The answer tiles' maximum size; guess tiles are 80% of the answer tiles' actual size. */
  maxSize?: number;
  /** Compact cards show only the newest row. */
  newestOnly?: boolean;
};

const MARK_WORD: Record<LetterMark, string> = { right: 'Right', elsewhere: 'Elsewhere', absent: 'Not in the word' };

/** "Your guess TITLES. Right: I in spot 2, T in spot 3, E in spot 5. Elsewhere: T. Not in the word: L, S." */
export function describeGuess(letters: CheckedLetter[]): string {
  const word = letters.map((l) => l.letter).join('');
  const parts = (['right', 'elsewhere', 'absent'] as const).flatMap((mark) => {
    const items = letters
      .map((l, i) => ({ ...l, spot: i + 1 }))
      .filter((l) => l.mark === mark)
      .map((l) => (mark === 'right' ? `${l.letter} in spot ${l.spot}` : l.letter));
    return items.length ? [`${MARK_WORD[mark]}: ${items.join(', ')}.`] : [];
  });
  return [`Your guess ${word}.`, ...parts].join(' ');
}

/** Splits the guess letters into the answer's word lengths, so multi-word answers line up. */
function groupLike(link: Link, letters: CheckedLetter[]): CheckedLetter[][] {
  const groups: CheckedLetter[][] = [];
  let i = 0;
  for (const w of answerWords(link)) {
    groups.push(letters.slice(i, i + w.length));
    i += w.length;
  }
  return groups;
}

function GuessTile({ item, size, delay }: { item: CheckedLetter; size: number; delay: number | null }) {
  const rotate = useSharedValue(delay === null ? 0 : 90);
  useEffect(() => {
    if (delay !== null) rotate.value = withDelay(delay, withTiming(0, { duration: motion.base }));
  }, [delay, rotate]);
  const style = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { rotateY: `${rotate.value}deg` }],
  }));
  const marker = Math.max(6, Math.round(size * 0.26));

  return (
    <Animated.View style={[styles.tile, markStyles[item.mark], { width: size, height: size }, style]}>
      <Animated.Text
        style={[styles.letter, item.mark === 'absent' && styles.letterAbsent, { fontSize: Math.round(size * 0.5) }]}
        maxFontSizeMultiplier={1.3}
      >
        {item.letter}
      </Animated.Text>
      {item.mark === 'right' && (
        <View style={styles.check}>
          <Check size={marker} color={color.successDeep} strokeWidth={3.5} />
        </View>
      )}
      {item.mark === 'elsewhere' && (
        <View style={[styles.dot, { width: marker * 0.7, height: marker * 0.7, borderRadius: marker }]} />
      )}
    </Animated.View>
  );
}

function GuessRow({
  link,
  letters,
  width,
  max,
  animate,
}: {
  link: Link;
  letters: CheckedLetter[];
  width: number;
  max: number;
  animate: boolean;
}) {
  const groups = groupLike(link, letters);
  const { size, rows } = tileLayout(width, groups.map((g) => g.map((l) => l.letter).join('')), max);
  let index = 0;
  return (
    <View style={styles.guess} accessible accessibilityLabel={describeGuess(letters)}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.line}>
          {row.map((piece, pi) => (
            <View key={pi} style={styles.word} importantForAccessibility="no-hide-descendants">
              {piece.split('').map((_, li) => {
                const i = index++;
                return (
                  <GuessTile key={li} item={letters[i]} size={size} delay={animate ? i * STAGGER_MS : null} />
                );
              })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** The checked guesses for the current link (letter check, DESIGN_SPEC §2.4). */
export default function GuessRows({ link, guesses, maxSize = 44, newestOnly = false }: GuessRowsProps) {
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  // Rows present on the first render (e.g. after a reload) appear without the flip.
  const [initial] = useState(() => new Set(guesses));

  const checked = guesses
    .map((g) => ({ guess: g, letters: checkLetters(g, link) }))
    .filter((r): r is { guess: string; letters: CheckedLetter[] } => r.letters !== null);
  // 80% of the answer tiles' actual size (they share this width), never below MIN_SIZE.
  const words = answerWords(link);
  const answerSize = tileLayout(width, words, maxSize).size;
  const max = Math.max(MIN_SIZE, Math.round(answerSize * SCALE));
  // A long answer wraps each guess onto several lines; then show only the newest so the
  // card doesn't push the input off screen (DESIGN_SPEC §2.4).
  const wraps = width > 0 && tileLayout(width, words, max).rows.length > 1;
  const shown = newestOnly || wraps ? checked.slice(-1) : checked;
  if (shown.length === 0) return null;

  return (
    <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 &&
        shown.map((r) => (
          <GuessRow
            key={r.guess}
            link={link}
            letters={r.letters}
            width={width}
            max={max}
            animate={!reduceMotion && !initial.has(r.guess)}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    rowGap: GAP,
  },
  guess: {
    rowGap: GAP,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: WORD_GAP,
  },
  word: {
    flexDirection: 'row',
    columnGap: GAP,
  },
  tile: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: 'Play-Bold',
    color: color.cardInk,
  },
  letterAbsent: {
    color: color.cardMuted,
  },
  check: {
    position: 'absolute',
    right: 1,
    bottom: 1,
  },
  dot: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: color.elsewhere,
  },
});

const markStyles = StyleSheet.create({
  right: {
    backgroundColor: color.successSoft,
    borderWidth: 2,
    borderColor: color.successDeep,
  },
  elsewhere: {
    backgroundColor: color.elsewhereSoft,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: color.elsewhere,
  },
  absent: {
    backgroundColor: color.tile,
  },
});
