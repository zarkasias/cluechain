import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { useReduceMotion } from '@/context/GameContext';
import { color, radius, space } from '@/constants/theme';

export type InputTone = 'wrong' | 'near' | 'correct' | null;

type AnswerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  tone: InputTone;
  /** Incremented on every wrong guess so repeated misses shake again. */
  shakeKey: number;
  disabled?: boolean;
};

export type AnswerInputHandle = { focus: () => void };

const HEIGHT = 52;

const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(
  ({ value, onChangeText, onSubmit, tone, shakeKey, disabled }, ref) => {
    const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
    const [focused, setFocused] = useState(false);
    const reduceMotion = useReduceMotion();
    const shake = useSharedValue(0);

    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

    // Wrong: 4 × 8 px over 240 ms.
    useEffect(() => {
      if (shakeKey === 0 || reduceMotion) return;
      const t = { duration: 30 };
      shake.value = withSequence(
        withTiming(8, t), withTiming(-8, t), withTiming(8, t), withTiming(-8, t),
        withTiming(8, t), withTiming(-8, t), withTiming(8, t), withTiming(0, t),
      );
    }, [shakeKey, reduceMotion, shake]);

    const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

    const canSubmit = value.trim() !== '' && !disabled;
    const borderStyle =
      tone === 'wrong'
        ? styles.borderWrong
        : tone === 'near'
          ? styles.borderNear
          : tone === 'correct'
            ? styles.borderCorrect
            : focused
              ? styles.borderFocus
              : null;

    return (
      <View style={styles.row}>
        <Animated.View style={[styles.field, borderStyle, shakeStyle]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type your answer…"
            placeholderTextColor={color.cardMuted}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            returnKeyType="go"
            // Keep the keyboard up between links (the modern form of blurOnSubmit={false}).
            submitBehavior="submit"
            editable={!disabled}
            accessibilityLabel="Your answer"
            maxFontSizeMultiplier={1.3}
          />
        </Animated.View>
        <Pressable
          style={({ pressed }) => [styles.submit, !canSubmit && styles.submitDisabled, pressed && styles.submitPressed]}
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit answer"
          accessibilityState={{ disabled: !canSubmit }}
        >
          <ArrowRight size={24} color={color.white} />
        </Pressable>
      </View>
    );
  },
);

AnswerInput.displayName = 'AnswerInput';
export default AnswerInput;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  field: {
    flex: 1,
    minWidth: 0, // B6
    height: HEIGHT,
    borderRadius: radius.md,
    backgroundColor: color.card,
    borderWidth: 2,
    borderColor: color.tileBorder,
    justifyContent: 'center',
  },
  borderFocus: { borderColor: color.focus },
  borderWrong: { borderColor: color.error },
  borderNear: { borderColor: color.gold },
  borderCorrect: { borderColor: color.success },
  input: {
    minWidth: 0, // B6
    height: '100%',
    paddingHorizontal: space.lg,
    fontSize: 18,
    color: color.cardInk,
    // @ts-expect-error web-only: hide the browser focus ring; the border shows focus instead.
    outlineStyle: 'none',
  },
  submit: {
    width: HEIGHT,
    height: HEIGHT,
    flexShrink: 0, // B6
    borderRadius: radius.md,
    backgroundColor: color.linkFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitPressed: { backgroundColor: color.linkDeep },
});
