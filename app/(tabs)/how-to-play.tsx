import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function HowToPlayScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>How to Play</Text>
        
        <View style={styles.instructionBlock}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Objective</Text>
            <Text style={styles.stepDescription}>
            Solve the clue. Your answer becomes part of the next clue. Link five answers to complete the chain.
            </Text>
          </View>
        </View>
        
        
        <View style={styles.instructionBlock}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Gameplay</Text>
            <Text style={styles.stepDescription}>
              Each correct answer becomes part of the next clue, forming a chain of related words.
            </Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/example.jpg')}
            style={styles.gameplayImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.instructionBlock}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Scoring</Text>
            <Text style={styles.stepDescription}>
            Points are awarded for each correct word in the chain. Points are removed per hint used.
            </Text>
          </View>
        </View>
        
        
        
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 24,
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
  imageContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  gameplayImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff33',
  },
});