import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface, TouchableRipple, useTheme } from 'react-native-paper';
import { GradientView } from '@/components/GradientView';
import { Colors, Gradients } from '@/constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type WordChainProps = {
  solvedWords: string[];
  onWordPress?: (word: string, index: number) => void;
};

export default function WordChain({ solvedWords, onWordPress }: WordChainProps) {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (solvedWords.length === 0) {
    return null;
  }

  return (
    <Surface style={styles.container} elevation={0}>
      <Text variant="headlineMedium" style={styles.title}>Chain Progress</Text>
      <Animated.View 
        style={[
          styles.wordsContainer,
          { opacity: fadeAnim }
        ]}
      >
        {solvedWords.map((word, index) => (
          <View key={`${word}-${index}`} style={styles.wordContainer}>
            <Surface style={styles.wordBadge} elevation={2}>
              <TouchableRipple
                onPress={() => onWordPress?.(word, index)}
                rippleColor={theme.colors.onSecondaryContainer}
                style={styles.touchable}
              >
                <GradientView
                  colors={Gradients.secondary}
                  style={styles.gradientContent}
                >
                  <Text variant="titleMedium" style={styles.word}>{word}</Text>
                </GradientView>
              </TouchableRipple>
            </Surface>
            {index < solvedWords.length - 1 && (
              <View style={styles.arrow}>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={24} 
                  color={Colors.textOnPrimary}
                  style={styles.arrowIcon}
                />
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 22,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
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
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 4,
  },
  touchable: {
    borderRadius: 10,
  },
  gradientContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  word: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  arrow: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    opacity: 0.9,
  },
});