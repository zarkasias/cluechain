import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
      </ScrollView>
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
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  word: {
    fontSize: 16,
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