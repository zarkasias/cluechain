import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientView } from '@/components/GradientView';
import { Colors, Gradients } from '@/constants/Colors';

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
    if (!answer || hintLevel === 0) return '';
    return answer.slice(0, hintLevel).toUpperCase() + '•'.repeat(Math.max(0, answer.length - hintLevel));
  };
  
  const clueParts = processClue();
  
  return (
    <View style={styles.container}>
      <GradientView
        colors={[Colors.surface, Colors.surfaceHighlight]}
        style={styles.clueCard}
      >
        <Text style={styles.clueLabel}>Clue:</Text>
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
        
        {hintLevel > 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Hint:</Text>
            <GradientView
              colors={Gradients.secondary}
              style={styles.hintBadge}
            >
              <Text style={styles.hintText}>{getHintText()}</Text>
            </GradientView>
          </View>
        )}
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  clueCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  clueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  clueText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  highlightedText: {
    fontWeight: '700',
    color: '#7c4dff',
  },
  hintContainer: {
    marginTop: 10,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  hintBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hintText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    letterSpacing: 2,
  },
});