import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { ArrowRight as ArrowRightIcon } from 'lucide-react-native';
import { GradientView } from '@/components/GradientView';
import { Colors, Gradients } from '@/constants/Colors';

type AnswerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  showError: boolean;
  showSuccess: boolean;
};

export type AnswerInputHandle = {
  focus: () => void;
};

const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(({
  value,
  onChangeText,
  onSubmit,
  showError,
  showSuccess,
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));
  
  // Apply shake animation when error is shown
  useEffect(() => {
    if (showError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
    }
  }, [showError, shakeAnim]);
  
  // Handle enter key press
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Enter') {
      onSubmit();
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Answer:</Text>
      
      <Animated.View
        style={[
          styles.inputContainer,
          showError && styles.inputError,
          showSuccess && styles.inputSuccess,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          autoFocus={false}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButtonContainer,
            !value.trim() && styles.submitButtonDisabled
          ]}
          onPress={onSubmit}
          disabled={!value.trim()}
        >
          <GradientView
            colors={value.trim() ? Gradients.primary : [Colors.buttonDisabled, Colors.buttonDisabled]}
            style={styles.submitButton}
          >
            <ArrowRightIcon color={Colors.textOnPrimary} size={20} />
          </GradientView>
        </TouchableOpacity>
      </Animated.View>
      
      {showError && (
        <Text style={styles.errorText}>Incorrect. Try again!</Text>
      )}
    </View>
  );
});

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
    height: 46,
    paddingHorizontal: 16,
    fontSize: 18,
    color: Colors.text,
  },
  submitButtonContainer: {
    height: 46,
    width: 46,
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