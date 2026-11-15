import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { answerWords } from '@/lib/game';
import type { Link } from '@/lib/game';
import { color, motion, radius, space } from '@/constants/theme';

export type TileFill = 'correct' | 'revealed' | null;

type LetterTilesProps = {
  link: Link;
  hintLetters: number;
  /** Fill every tile, staggered: green for a solve, gold for a reveal. */
  fill?: TileFill;
  /** Upper bound for the tile size (smaller when space is tight). */
  maxSize?: number;
};

const GAP = 6;
const WORD_GAP = 16;
const STAGGER_MS: Record<'correct' | 'revealed', number> = { correct: 30, revealed: 60 };

/** Tile size = min(max, floor((width − gaps) / letters)). Exported for tests/layout checks. */
export function tileSize(width: number, words: string[], max = 44): number {
  const letters = words.reduce((n, w) => n + w.length, 0);
  if (!letters || width <= 0) return max;
  const gaps = (letters - words.length) * GAP + (words.length - 1) * WORD_GAP;
  return Math.max(12, Math.min(max, Math.floor((width - gaps) / letters)));
}

type TileProps = { letter: string; shown: boolean; tone: 'empty' | 'hinted' | 'correct'; size: number };

function Tile({ letter, shown, tone, size }: TileProps) {
  const reduceMotion = useReducedMotion();
  const rotate = useSharedValue(0);
  const wasShown = useRef(shown);

  useEffect(() => {
    if (shown && !wasShown.current && !reduceMotion) {
      rotate.value = 90;
      rotate.value = withTiming(0, { duration: motion.base });
    }
    wasShown.current = shown;
  }, [shown, reduceMotion, rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { rotateY: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.tile, toneStyles[tone], { width: size, height: size }, style]}>
      {shown && (
        <Animated.Text
          style={[styles.letter, { fontSize: Math.round(size * 0.5) }]}
          maxFontSizeMultiplier={1.3}
        >
          {letter}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

export default function LetterTiles({ link, hintLetters, fill = null, maxSize = 44 }: LetterTilesProps) {
  const words = answerWords(link);
  const total = words.reduce((n, w) => n + w.length, 0);
  const [width, setWidth] = useState(0);
  const [filled, setFilled] = useState(0);
  const reduceMotion = useReducedMotion();

  // Staggered fill for a solve or a reveal.
  useEffect(() => {
    if (!fill) {
      setFilled(0);
      return;
    }
    if (reduceMotion) {
      setFilled(total);
      return;
    }
    let n = 0;
    setFilled(0);
    const id = setInterval(() => {
      n += 1;
      setFilled(n);
      if (n >= total) clearInterval(id);
    }, STAGGER_MS[fill]);
    return () => clearInterval(id);
  }, [fill, total, reduceMotion]);

  const size = tileSize(width, words, maxSize);
  const hinted = words.join('').slice(0, hintLetters);
  const a11y =
    `Answer, ${total} letters.` + (hinted ? ` Revealed: ${hinted.split('').join(' ')}` : '');

  let index = 0;
  return (
    <View
      style={styles.row}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={a11y}
    >
      {words.map((word, wi) => (
        <View key={wi} style={styles.word} importantForAccessibility="no-hide-descendants">
          {word.split('').map((letter, li) => {
            const i = index++;
            const isHinted = i < hintLetters;
            const isFilled = fill !== null && i < filled;
            const tone = isFilled ? (fill === 'correct' ? 'correct' : 'hinted') : isHinted ? 'hinted' : 'empty';
            return <Tile key={li} letter={letter} shown={isHinted || isFilled} tone={tone} size={size} />;
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: space.xs,
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: 'Play-Bold',
    color: color.cardInk,
  },
});

const toneStyles = StyleSheet.create({
  empty: {
    backgroundColor: color.tile,
    borderColor: color.tileBorder,
  },
  hinted: {
    backgroundColor: color.goldSoft,
    borderColor: color.gold,
  },
  correct: {
    backgroundColor: color.successSoft,
    borderColor: color.success,
  },
});
