import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';

type WordChainProps = {
  solvedWords: string[];
};

export default function WordChain({ solvedWords }: WordChainProps) {
  const { width } = useWindowDimensions();
  
  if (solvedWords.length === 0) {
    return null;
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { maxWidth: width - 32 } // Account for container padding
      ]}
    >
      {solvedWords.map((word, index) => (
        <View key={index} style={styles.wordContainer}>
          <Text style={styles.word}>{word}</Text>
          {index < solvedWords.length - 1 && (
            <View style={styles.connector} />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 120, // Increased height to accommodate multiple rows
    marginBottom: 20,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 8,
    gap: 8, // Consistent spacing between items
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c4dff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0ff',
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  connector: {
    width: 24,
    height: 2,
    backgroundColor: '#c5c5c5',
    marginHorizontal: 8,
  },
});