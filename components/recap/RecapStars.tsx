import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import type { Stars } from '@/lib/game';
import { useReduceMotion } from '@/context/GameContext';
import { color, motion, space } from '@/constants/theme';

const STAGGER_MS = 120;
/** Let the recap's fade-in finish before the first star pops. */
const START_MS = 200;
const SIZE = 40;

function PopStar({ index, filled }: { index: number; filled: boolean }) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(START_MS + index * STAGGER_MS, withSpring(1, motion.spring));
  }, [index, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Star
        size={SIZE}
        color={filled ? color.gold : color.inkMuted}
        fill={filled ? color.gold : 'transparent'}
        strokeWidth={1.5}
      />
    </Animated.View>
  );
}

/** Three stars that pop in one by one (120 ms stagger), or appear at once with reduced motion. */
export default function RecapStars({ stars }: { stars: Stars }) {
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={`${stars} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <PopStar key={i} index={i} filled={i < stars} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.md,
    minHeight: SIZE + space.sm,
    alignItems: 'center',
  },
});
