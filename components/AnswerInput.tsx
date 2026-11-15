import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowRight as ArrowRightIcon } from 'lucide-react-native';
import { GradientView } from '@/components/GradientView';
import type { Outcome } from '@/lib/game';
import { Colors, Gradients } from '@/constants/Colors';

type AnswerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  /** The reducer's verdict on the last guess, or null. */
  outcome: Outcome | null;
};

export type AnswerInputHandle = {
  focus: () => void;
};

const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(({ value, onChangeText, onSubmit, outcome }, ref) => {
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const showError = outcome === 'wrong' || outcome === 'near';

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    if (showError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [showError, shakeAnim]);

  const canSubmit = value.trim() !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Answer:</Text>

      <Animated.View
        style={[
          styles.inputContainer,
          showError && styles.inputError,
          outcome === 'correct' && styles.inputSuccess,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Type your answer..."
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          accessibilityLabel="Your answer"
        />

        <TouchableOpacity
          style={[styles.submitButtonContainer, !canSubmit && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit answer"
          accessibilityState={{ disabled: !canSubmit }}
        >
          <GradientView
            colors={canSubmit ? Gradients.primary : [Colors.buttonDisabled, Colors.buttonDisabled]}
            style={styles.submitButton}
          >
            <ArrowRightIcon color={Colors.textOnPrimary} size={20} />
          </GradientView>
        </TouchableOpacity>
      </Animated.View>

      {showError && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {outcome === 'near' ? 'So close! Check your spelling.' : 'Incorrect. Try again!'}
        </Text>
      )}
    </View>
  );
});

AnswerInput.displayName = 'AnswerInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputSuccess: {
    borderColor: Colors.success,
  },
  input: {
    flex: 1,
    minWidth: 0, // B6: let the input shrink so the submit button isn't clipped
    height: 46,
    paddingHorizontal: 16,
    fontSize: 18,
    color: Colors.text,
  },
  submitButtonContainer: {
    height: 46,
    width: 46,
    flexShrink: 0, // B6
  },
  submitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: Colors.error,
    marginTop: 8,
    fontSize: 14,
  },
});

export default AnswerInput;
