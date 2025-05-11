import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ClueDisplayProps = {
  clue: string;
  answer?: string;
  hintLevel: number;
};

export default function ClueDisplay({ clue, answer, hintLevel }: ClueDisplayProps) {
  // Process the clue to highlight the embedded words (in uppercase)
  const processClue = () => {
    if (!clue) return [];
    
    const parts = [];
    let currentText = '';
    let inUpperCase = false;
    
    for (let i = 0; i < clue.length; i++) {
      const char = clue[i];
      const isUpperCase = char === char.toUpperCase() && char !== char.toLowerCase();
      
      if (isUpperCase && !inUpperCase) {
        // Start of uppercase section
        if (currentText) {
          parts.push({ text: currentText, highlight: false });
          currentText = '';
        }
        inUpperCase = true;
        currentText += char;
      } else if (!isUpperCase && inUpperCase) {
        // End of uppercase section
        parts.push({ text: currentText, highlight: true });
        currentText = char;
        inUpperCase = false;
      } else {
        // Continue current section
        currentText += char;
      }
    }
    
    if (currentText) {
      parts.push({ text: currentText, highlight: inUpperCase });
    }
    
    return parts;
  };

  const getHintText = () => {
    if (!answer || hintLevel === 0) return null;
    
    const hintLength = Math.min(hintLevel, answer.length);
    return answer.slice(0, hintLength).toUpperCase() + '...';
  };
  
  const clueParts = processClue();
  const hintText = getHintText();
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clue:</Text>
      <View style={styles.clueBox}>
        <Text style={styles.clueText}>
          {clueParts.map((part, index) => (
            <Text
              key={index}
              style={part.highlight ? styles.highlightedText : null}
            >
              {part.text}
            </Text>
          ))}
        </Text>
        
        {hintText && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Hint:</Text>
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{hintText}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  clueBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clueText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#333',
  },
  highlightedText: {
    fontWeight: '700',
    color: '#7c4dff',
  },
  hintContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c4dff',
  },
});