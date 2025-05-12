import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Lightbulb as LightbulbIcon, RefreshCw as RefreshCwIcon, ArrowRight as ArrowRightIcon } from 'lucide-react-native';

type GameControlsProps = {
  onHint: () => void;
  onRestart: () => void;
  onNextChain: () => void;
  hintDisabled: boolean;
  isCompleted: boolean;
};

export default function GameControls({
  onHint,
  onRestart,
  onNextChain,
  hintDisabled,
  isCompleted,
}: GameControlsProps) {
  return (
    <View style={styles.container}>
      {!isCompleted ? (
        <>
          <TouchableOpacity
            style={[styles.button, styles.hintButton, hintDisabled && styles.disabledButton]}
            onPress={onHint}
            disabled={hintDisabled}
          >
            <LightbulbIcon size={20} color={hintDisabled ? '#999' : '#fff'} />
            <Text style={[styles.buttonText, hintDisabled && styles.disabledText]}>Hint</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.restartButton]} onPress={onRestart}>
            <RefreshCwIcon size={20} color="#fff" />
            <Text style={styles.buttonText}>Restart</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={onNextChain}>
          <ArrowRightIcon size={20} color="#fff" />
          <Text style={styles.buttonText}>Next Chain</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f033',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 8,
    minWidth: 120,
  },
  hintButton: {
    backgroundColor: '#7c4dff',
  },
  restartButton: {
    backgroundColor: '#5c6bc0',
  },
  nextButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledText: {
    color: '#999',
  },
});