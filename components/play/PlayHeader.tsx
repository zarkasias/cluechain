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
import { DIFFICULTY_LABEL } from '@/lib/format';
import { color, motion, radius, space, type } from '@/constants/theme';

type PlayHeaderProps = {
  chainNumber: number;
  totalChains: number;
  difficulty: Difficulty;
  /** The running score for this chain. */
  score: number;
  /** Show the small "Replay" tag: this chain was already completed. */
  replay?: boolean;
};

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

/**
 * Chain number, difficulty and score. The chain's title is not shown here: titles name the
 * first and last answers, so they only appear once the chain is finished (DESIGN_SPEC §2.1).
 */
export default function PlayHeader({ chainNumber, totalChains, difficulty, score, replay }: PlayHeaderProps) {
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
        <View style={styles.metaRow}>
          <Text
            style={styles.meta}
            accessibilityRole="header"
            accessibilityLabel={`Chain ${chainNumber} of ${totalChains}, ${DIFFICULTY_LABEL[difficulty]}${
              replay ? ". Replay: this run won't change your stats" : ''
            }`}
            numberOfLines={1}
          >
            Chain {chainNumber} of {totalChains} · {DIFFICULTY_LABEL[difficulty]}
          </Text>
          {replay && (
            <View style={styles.tag} importantForAccessibility="no-hide-descendants" aria-hidden>
              <Text style={styles.tagText} maxFontSizeMultiplier={1.3}>
                Replay
              </Text>
            </View>
          )}
        </View>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  meta: {
    ...type.label,
    color: color.inkMuted,
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.inkMuted,
  },
  tagText: {
    ...type.label,
    fontSize: 11,
    lineHeight: 16,
    color: color.inkMuted,
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
