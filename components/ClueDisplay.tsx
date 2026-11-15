import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GradientView } from '@/components/GradientView';
import { answerLetters, parseClue } from '@/lib/game';
import type { Link } from '@/lib/game';
import { Colors, Gradients } from '@/constants/Colors';

type ClueDisplayProps = {
  link: Link;
  hintLetters: number;
};

export default function ClueDisplay({ link, hintLetters }: ClueDisplayProps) {
  const segments = parseClue(link.clue);
  const letters = answerLetters(link);
  const hintText = letters.slice(0, hintLetters) + '•'.repeat(Math.max(0, letters.length - hintLetters));

  return (
    <View style={styles.container}>
      <GradientView colors={[Colors.surface, Colors.surfaceHighlight]} style={styles.clueCard}>
        <Text style={styles.clueLabel}>Clue:</Text>
        <Text style={styles.clueText}>
          {segments.map((part, index) => (
            <Text key={index} style={part.isLink ? styles.highlightedText : null}>
              {part.text}
            </Text>
          ))}
        </Text>

        {hintLetters > 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Hint:</Text>
            <GradientView colors={Gradients.secondary} style={styles.hintBadge}>
              <Text style={styles.hintText}>{hintText}</Text>
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
    color: Colors.secondaryDark,
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
