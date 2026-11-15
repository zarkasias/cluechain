import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ArrowRight as ArrowRightIcon,
  Eye as EyeIcon,
  Lightbulb as LightbulbIcon,
  RefreshCw as RefreshCwIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type GameControlsProps = {
  onHint: () => void;
  onReveal: () => void;
  onRestart: () => void;
  onNextChain: () => void;
  /** False once every hint letter but the last is shown; Reveal replaces Hint. */
  hintAvailable: boolean;
  isCompleted: boolean;
};

export default function GameControls({
  onHint,
  onReveal,
  onRestart,
  onNextChain,
  hintAvailable,
  isCompleted,
}: GameControlsProps) {
  if (isCompleted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.restartButton]}
          onPress={onRestart}
          accessibilityRole="button"
          accessibilityLabel="Replay this chain"
        >
          <RefreshCwIcon size={20} color={Colors.textOnPrimary} />
          <Text style={styles.buttonText}>Replay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={onNextChain}
          accessibilityRole="button"
          accessibilityLabel="Next chain"
        >
          <ArrowRightIcon size={20} color={Colors.textOnPrimary} />
          <Text style={styles.buttonText}>Next Chain</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hintAvailable ? (
        <TouchableOpacity
          style={[styles.button, styles.hintButton]}
          onPress={onHint}
          accessibilityRole="button"
          accessibilityLabel="Hint: reveal the next letter"
        >
          <LightbulbIcon size={20} color={Colors.textOnPrimary} />
          <Text style={styles.buttonText}>Hint</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.hintButton]}
          onPress={onReveal}
          accessibilityRole="button"
          accessibilityLabel="Reveal the word. This link scores 0."
        >
          <EyeIcon size={20} color={Colors.textOnPrimary} />
          <Text style={styles.buttonText}>Reveal</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.restartButton]}
        onPress={onRestart}
        accessibilityRole="button"
        accessibilityLabel="Restart this chain"
      >
        <RefreshCwIcon size={20} color={Colors.textOnPrimary} />
        <Text style={styles.buttonText}>Restart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
    paddingVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 120,
  },
  hintButton: {
    backgroundColor: Colors.secondaryDark,
  },
  restartButton: {
    backgroundColor: Colors.buttonPrimary,
  },
  nextButton: {
    backgroundColor: Colors.secondaryDark,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
