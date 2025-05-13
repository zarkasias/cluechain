import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function HowToPlayScreen() {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
      style={styles.gradient}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>How to Play ClueChain</Text>
        
        <View style={styles.instructionBlock}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Read the Clue</Text>
            <Text style={styles.stepDescription}>
              Each clue is a hint to a word you need to guess.
            </Text>
          </View>
        </View>
        
        <View style={styles.instructionBlock}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter Your Answer</Text>
            <Text style={styles.stepDescription}>
              Type your answer in the input field and submit.
            </Text>
          </View>
        </View>
        
        <View style={styles.instructionBlock}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Build the Chain</Text>
            <Text style={styles.stepDescription}>
              Each correct answer becomes part of the next clue, forming a chain of related words.
            </Text>
          </View>
        </View>
        
        <View style={styles.instructionBlock}>
          <Text style={styles.stepNumber}>4</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Need Help?</Text>
            <Text style={styles.stepDescription}>
              Use the hint button to reveal the first letter of the answer.
            </Text>
          </View>
        </View>
        
        <View style={styles.exampleBlock}>
          <Text style={styles.exampleTitle}>Example:</Text>
          <Text style={styles.exampleText}>
            Clue 1: "Large gray animal with a trunk" {'\n'}
            Answer: ELEPHANT{'\n\n'}
            
            Clue 2: "An ELEPHANT never forgets, and this organ is responsible for memory"{'\n'}
            Answer: BRAIN{'\n\n'}
            
            Clue 3: "The BRAIN controls this vital organ that pumps blood"{'\n'}
            Answer: HEART
          </Text>
        </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
  },
  card: {
    backgroundColor: '#ffffff33',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Play-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionBlock: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c4dff',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Play-Bold',
  },
  stepDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  exampleBlock: {
    marginTop: 8,
    backgroundColor: '#f0f0f055',
    padding: 14,
    borderRadius: 8,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
    lineHeight: 24,
  },
});