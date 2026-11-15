import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GradientView } from '@/components/GradientView';
import { Colors, Gradients } from '@/constants/Colors';

type WordChainProps = {
  solvedWords: string[];
};

// Phase 02 replaces this with the chain track (D1).
export default function WordChain({ solvedWords }: WordChainProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (solvedWords.length === 0) return null;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Solved ${solvedWords.length} of 5: ${solvedWords.join(', ')}`}
    >
      <Animated.View style={[styles.wordsContainer, { opacity: fadeAnim }]}>
        {solvedWords.map((word, index) => (
          <View key={`${word}-${index}`} style={styles.wordContainer}>
            <View style={styles.wordBadge}>
              <GradientView colors={Gradients.secondary} style={styles.gradientContent}>
                <Check size={18} color={Colors.textOnPrimary} />
              </GradientView>
            </View>
            {index < solvedWords.length - 1 && (
              <View style={styles.arrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color={Colors.textOnPrimary} />
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 1,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 2,
  },
  gradientContent: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  arrow: {
    paddingHorizontal: 1,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
});
