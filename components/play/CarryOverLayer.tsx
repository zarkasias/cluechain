import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Eye } from 'lucide-react-native';
import { color, radius, space } from '@/constants/theme';

export type Point = { x: number; y: number };

export type Ghost = {
  /** Changes for every flight so a new one restarts the animation. */
  id: number;
  word: string;
  /** Revealed words fly as an outlined, muted chip. */
  revealed: boolean;
  /** Centre of the letter tiles, relative to the layer. */
  from: Point;
  /** Centre of the target ChainTrack slot, relative to the layer. */
  to: Point;
};

/** §3 step 2: translate + scale 1 → 0.8 over 400 ms, ease-in-out. */
export const FLIGHT_MS = 400;
const APPEAR_MS = 80;

/**
 * An absolutely positioned overlay above the Play screen that renders the
 * flying "ghost" chip. Presentation only: the reducer has already advanced.
 */
export default function CarryOverLayer({ ghost }: { ghost: Ghost | null }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      {ghost && <GhostChip key={ghost.id} ghost={ghost} />}
    </View>
  );
}

function GhostChip({ ghost }: { ghost: Ghost }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const dx = ghost.to.x - ghost.from.x;
  const dy = ghost.to.y - ghost.from.y;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: APPEAR_MS });
    progress.value = withTiming(1, { duration: FLIGHT_MS, easing: Easing.inOut(Easing.cubic) });
  }, [opacity, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: dx * progress.value },
      { translateY: dy * progress.value },
      { scale: 1 - 0.2 * progress.value },
    ],
  }));

  // A zero-size anchor at the source centre; the chip centres itself on it.
  return (
    <View style={[styles.anchor, { left: ghost.from.x, top: ghost.from.y }]}>
      <Animated.View style={[styles.chip, ghost.revealed && styles.chipRevealed, style]}>
        {ghost.revealed && <Eye size={16} color={color.inkMuted} />}
        <Text style={[styles.word, ghost.revealed && styles.wordRevealed]} numberOfLines={1}>
          {ghost.word.toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: color.linkFill,
    shadowColor: color.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  chipRevealed: {
    backgroundColor: color.bg,
    borderWidth: 1.5,
    borderColor: color.inkMuted,
  },
  word: {
    fontFamily: 'Play-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
    color: color.white,
  },
  wordRevealed: {
    color: color.inkMuted,
  },
});
