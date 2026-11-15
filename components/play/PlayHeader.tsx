import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import type { Difficulty } from '@/lib/game';
import { useReduceMotion } from '@/context/GameContext';
import { color, motion, radius, space, type } from '@/constants/theme';

type PlayHeaderProps = {
  chainNumber: number;
  totalChains: number;
  difficulty: Difficulty;
  title: string;
  /** The running score for this chain. */
  score: number;
  /** Hide the title line when vertical space is tight (keyboard open on small phones). */
  compact?: boolean;
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

/** Counts the displayed number up to `target` over `duration` ms. */
function useCountUp(target: number, duration: number, animate: boolean) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (!animate || target <= from.current) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    const t0 = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame>;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      setShown(Math.round(start + (target - start) * p));
      if (p < 1) frame = requestAnimationFrame(step);
      else from.current = target;
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      from.current = target;
    };
  }, [target, duration, animate]);

  return shown;
}

export default function PlayHeader({ chainNumber, totalChains, difficulty, title, score, compact }: PlayHeaderProps) {
  const reduceMotion = useReduceMotion();
  const shown = useCountUp(score, motion.slow, !reduceMotion);

  // "+N" float-up when points are earned.
  const [delta, setDelta] = useState(0);
  const prev = useRef(score);
  const floatY = useSharedValue(0);
  const floatOpacity = useSharedValue(0);

  useEffect(() => {
    const gained = score - prev.current;
    prev.current = score;
    if (gained <= 0 || reduceMotion) return;
    setDelta(gained);
    floatY.value = 0;
    floatOpacity.value = 1;
    floatY.value = withTiming(-14, { duration: motion.slow });
    floatOpacity.value = withTiming(0, { duration: motion.slow });
  }, [score, reduceMotion, floatY, floatOpacity]);

  const floatStyle = useAnimatedStyle(() => ({
    opacity: floatOpacity.value,
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.meta} accessibilityRole="header" numberOfLines={1}>
          Chain {chainNumber} of {totalChains} · {DIFFICULTY_LABEL[difficulty]}
        </Text>
        {!compact && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.pillWrap}>
        <View style={styles.pill} accessible accessibilityLabel={`Chain score ${score} points`}>
          <Star size={16} color={color.gold} fill={color.gold} />
          <Text style={styles.score} maxFontSizeMultiplier={1.3}>
            {shown.toLocaleString()}
          </Text>
        </View>
        <Animated.Text style={[styles.float, floatStyle]} importantForAccessibility="no" aria-hidden>
          +{delta}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    ...type.label,
    color: color.inkMuted,
  },
  title: {
    ...type.title,
    color: color.ink,
  },
  pillWrap: {
    flexShrink: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: color.gold,
  },
  score: {
    fontFamily: 'Play-Bold',
    fontSize: 18,
    color: color.gold,
    fontVariant: ['tabular-nums'],
  },
  // Floats up beside the pill (to its left) so it never covers the number or leaves the screen.
  float: {
    position: 'absolute',
    right: '100%',
    marginRight: space.sm,
    top: 8,
    fontFamily: 'Play-Bold',
    fontSize: 16,
    color: color.gold,
  },
});
