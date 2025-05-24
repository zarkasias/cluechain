import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { GradientView } from '@/components/GradientView';
import ClueDisplay from './ClueDisplay';
import AnswerInput, { AnswerInputHandle } from './AnswerInput';
import WordChain from './WordChain';
import GameControls from './GameControls';
import { useGameState, useGameDispatch } from '@/context/GameContext';
import { Colors, Gradients } from '@/constants/Colors';

export default function GameScreen() {
  const {
    currentChain,
    currentClueIndex,
    hintLevel,
    solvedWords,
    isChainCompleted,
    currentPoints,
  } = useGameState();
  const dispatch = useGameDispatch();
  const [userAnswer, setUserAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const answerInputRef = useRef<AnswerInputHandle>(null);

  // Reset animations when chain changes
  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [currentChain.id]);

  // Focus input when a new word is revealed
  useEffect(() => {
    if (!isChainCompleted && !isAnimating && Platform.OS !== 'ios') {
      const focusTimeout = setTimeout(() => {
        answerInputRef.current?.focus();
      }, 100); // Small delay to ensure animations are complete
      return () => clearTimeout(focusTimeout);
    }
  }, [currentClueIndex, isChainCompleted, isAnimating]);

  const animateTransition = (callback: () => void) => {
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();

      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Animate in the new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const handleSubmit = () => {
    if (userAnswer.trim() === '' || isAnimating) return;

    const correctAnswer = currentChain.answers[currentClueIndex].toLowerCase();
    if (userAnswer.trim().toLowerCase() === correctAnswer) {
      setShowSuccess(true);
      setShowError(false);

      animateTransition(() => {
        dispatch({ type: 'CHECK_ANSWER', payload: userAnswer });
        setUserAnswer('');
        setShowSuccess(false);
      });
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  const handleShowHint = () => {
    if (!isAnimating) {
      dispatch({ type: 'SHOW_HINT' });
    }
  };

  const handleRestartChain = () => {
    if (!isAnimating) {
      dispatch({ type: 'RESTART_CHAIN' });
      setUserAnswer('');
      setShowError(false);
      setShowSuccess(false);
    }
  };

  const handleNextChain = () => {
    if (!isAnimating) {
      dispatch({ type: 'LOAD_NEXT_CHAIN' });
      setUserAnswer('');
      setShowError(false);
      setShowSuccess(false);
    }
  };

  const getCurrentHint = () => {
    if (hintLevel > 0 && currentClueIndex < currentChain.answers.length) {
      return currentChain.answers[currentClueIndex][0].toUpperCase();
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>ClueChain</Text>
        <View style={styles.pointsWrapper}>
          <GradientView
            colors={Gradients.accent}
            style={styles.pointsContainer}
          >
            <Text style={styles.points}>Points: {currentPoints}</Text>
          </GradientView>
        </View>
      </View>


      <View style={styles.mainContent}>
        <Animated.View
          style={[
            styles.clueContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <WordChain solvedWords={solvedWords} />
          {!isChainCompleted ? (
            <GradientView
              colors={[Colors.surface, Colors.surfaceHighlight]}
              style={styles.contentCard}
            >
              <ClueDisplay
                clue={
                  currentClueIndex < currentChain.clues.length
                    ? currentChain.clues[currentClueIndex]
                    : ''
                }
                answer={
                  currentClueIndex < currentChain.answers.length
                    ? currentChain.answers[currentClueIndex]
                    : undefined
                }
                hintLevel={hintLevel}
              />

              <AnswerInput
                ref={answerInputRef}
                value={userAnswer}
                onChangeText={setUserAnswer}
                onSubmit={handleSubmit}
                showError={showError}
                showSuccess={showSuccess}
              />
              <GameControls
                onHint={handleShowHint}
                onRestart={handleRestartChain}
                onNextChain={handleNextChain}
                hintDisabled={hintLevel >= 3 || isChainCompleted}
                isCompleted={isChainCompleted}
              />
            </GradientView>
          ) : (
            <GradientView
              colors={[Colors.surface, Colors.surfaceHighlight]}
              style={styles.contentCard}
            >
              <Text style={styles.completionTitle}>Chain Complete!</Text>
              <Text style={styles.completionMessage}>
                You've successfully completed the word chain!
              </Text>
              <Text style={styles.completionPoints}>
                Points earned: {currentPoints}
              </Text>
              <GameControls
                onHint={handleShowHint}
                onRestart={handleRestartChain}
                onNextChain={handleNextChain}
                hintDisabled={true}
                isCompleted={true}
              />
            </GradientView>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 6,
    marginTop: Platform.OS === 'ios' ? 35 : 0,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Play-Bold',
    padding: 12,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  pointsWrapper: {
    flexShrink: 1,
    flexGrow: 0,
  },
  pointsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  points: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 14,
    justifyContent: 'flex-start',
  },
  clueContainer: {
    width: '100%',
  },
  contentCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    elevation: 6,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  completionCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Play-Bold',
    color: Colors.secondary,
    marginBottom: 12,
  },
  completionMessage: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  completionPoints: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: 12,
  },
});
