import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { color, radius } from '@/constants/theme';

type LinkChipProps = {
  word: string;
  /** Text style to match the surrounding clue (font size, weight, line height). */
  textStyle: TextStyle;
  /** Pulse once on mount (links 2–5) so the eye catches the carry-over. */
  pulse?: boolean;
  maxFontSizeMultiplier?: number;
};

/** The previous answer shown inside a clue: a pink chip with the word in uppercase. */
export default function LinkChip({ word, textStyle, pulse, maxFontSizeMultiplier }: LinkChipProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!pulse || reduceMotion) return;
    scale.value = withSequence(withTiming(1.08, { duration: 140 }), withTiming(1, { duration: 160 }));
  }, [pulse, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.chip, style]}>
      <Animated.Text style={[textStyle, styles.text]} maxFontSizeMultiplier={maxFontSizeMultiplier}>
        {word.toUpperCase()}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: color.linkSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
  },
  text: {
    color: color.linkDeep,
  },
});
