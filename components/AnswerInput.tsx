import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { ArrowRight as ArrowRightIcon } from 'lucide-react-native';

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
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            !value.trim() && styles.submitButtonDisabled
          ]}
          onPress={onSubmit}
          disabled={!value.trim()}
        >
          <ArrowRightIcon color="#fff" size={20} />
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputSuccess: {
    borderColor: '#4caf50',
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#333',
  },
  submitButton: {
    height: 56,
    width: 56,
    backgroundColor: '#7c4dff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c5c5c5',
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
    fontSize: 14,
  },
});

export default AnswerInput;