import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientView } from '@/components/GradientView';
import { Colors, Gradients } from '@/constants/Colors';

type WordChainProps = {
  solvedWords: string[];
};

export default function WordChain({ solvedWords }: WordChainProps) {
  if (solvedWords.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chain Progress</Text>
      <View style={styles.wordsContainer}>
        {solvedWords.map((word, index) => (
          <View key={`${word}-${index}`} style={styles.wordContainer}>
            <GradientView
              colors={Gradients.secondary}
              style={styles.wordBadge}
            >
              <Text style={styles.word}>{word}</Text>
            </GradientView>
            {index < solvedWords.length - 1 && (
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 22,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Play-Bold',
    color: Colors.textOnPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  wordsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 4,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordBadge: {
    paddingVertical: 8,
    marginVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  word: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  arrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 20,
    color: Colors.textOnPrimary,
  },
});