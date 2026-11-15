import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientView } from '@/components/GradientView';
import ClueDisplay from './ClueDisplay';
import AnswerInput, { AnswerInputHandle } from './AnswerInput';
import WordChain from './WordChain';
import GameControls from './GameControls';
import { useChains, useGameDispatch, useGameState } from '@/context/GameContext';
import { canHint, chainResult, chainScore, currentChain, isChainComplete } from '@/lib/game';
import { Colors, Gradients } from '@/constants/Colors';

export default function GameScreen() {
  const state = useGameState();
  const chains = useChains();
  const dispatch = useGameDispatch();
  const { linkIndex, links, lastOutcome } = state;
  const chain = currentChain(chains, state);
  const complete = isChainComplete(state);

  const [userAnswer, setUserAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  // While the "correct" transition plays, keep showing the link that was just solved.
  const [frozenIndex, setFrozenIndex] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const answerInputRef = useRef<AnswerInputHandle>(null);

  const shownIndex = frozenIndex ?? linkIndex;
  const showComplete = complete && frozenIndex === null;

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [chain?.id, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!complete && !isAnimating && Platform.OS !== 'ios') {
      const t = setTimeout(() => answerInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [linkIndex, complete, isAnimating]);

  const animateTransition = (callback: () => void) => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      callback();
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setIsAnimating(false));
    });
  };

  // React to the reducer's verdict on the last guess.
  useEffect(() => {
    if (lastOutcome === 'correct') {
      animateTransition(() => {
        setFrozenIndex(null);
        setUserAnswer('');
        dispatch({ type: 'CLEAR_FEEDBACK' });
      });
    } else {
      setFrozenIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOutcome]);

  const resetInput = () => {
    setUserAnswer('');
    setFrozenIndex(null);
  };

  const handleChangeText = (text: string) => {
    setUserAnswer(text);
    if (lastOutcome === 'wrong' || lastOutcome === 'near') dispatch({ type: 'CLEAR_FEEDBACK' });
  };

  const handleSubmit = () => {
    // Feedback must be cleared (by typing) before the same text is judged again.
    if (userAnswer.trim() === '' || isAnimating || lastOutcome !== null) return;
    setFrozenIndex(linkIndex);
    dispatch({ type: 'SUBMIT_GUESS', guess: userAnswer });
  };

  const handleHint = () => {
    if (!isAnimating) dispatch({ type: 'HINT' });
  };
  const handleReveal = () => {
    if (isAnimating) return;
    resetInput();
    dispatch({ type: 'REVEAL' });
  };
  const handleRestart = () => {
    if (isAnimating) return;
    resetInput();
    dispatch({ type: 'RESTART' });
  };
  const handleNextChain = () => {
    if (isAnimating) return;
    resetInput();
    dispatch({ type: 'NEXT_CHAIN' });
  };
  const handlePlayFromStart = () => {
    resetInput();
    if (chains[0]) dispatch({ type: 'REPLAY_CHAIN', id: chains[0].id });
  };

  const solvedWords = chain ? chain.links.filter((_, i) => links[i]?.solved).map((l) => l.answer) : [];
  const result = chainResult(state);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Clue Chains</Text>
        <View style={styles.pointsWrapper}>
          <GradientView colors={Gradients.accent} style={styles.pointsContainer}>
            <Text style={styles.points}>Points: {chainScore(links)}</Text>
          </GradientView>
        </View>
      </View>

      <View style={styles.mainContent}>
        {!chain ? (
          <GradientView colors={[Colors.surface, Colors.surfaceSecondary]} style={styles.contentCard}>
            <Text style={styles.completionTitle}>All chains complete!</Text>
            <Text style={styles.completionMessage}>You've finished every chain. More are on the way.</Text>
            <TouchableOpacity
              style={styles.replayButton}
              onPress={handlePlayFromStart}
              accessibilityRole="button"
              accessibilityLabel="Play the first chain again"
            >
              <Text style={styles.replayButtonText}>Play again from the start</Text>
            </TouchableOpacity>
          </GradientView>
        ) : (
          <Animated.View
            style={[styles.clueContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <WordChain solvedWords={solvedWords} />
            {!showComplete ? (
              <GradientView colors={[Colors.surface, Colors.surfaceHighlight]} style={styles.contentCard}>
                <ClueDisplay link={chain.links[shownIndex]} hintLetters={links[shownIndex].hintLetters} />
                <AnswerInput
                  ref={answerInputRef}
                  value={userAnswer}
                  onChangeText={handleChangeText}
                  onSubmit={handleSubmit}
                  outcome={lastOutcome}
                />
                <GameControls
                  onHint={handleHint}
                  onReveal={handleReveal}
                  onRestart={handleRestart}
                  onNextChain={handleNextChain}
                  hintAvailable={canHint(chains, state)}
                  isCompleted={false}
                />
              </GradientView>
            ) : (
              <GradientView colors={[Colors.surface, Colors.surfaceSecondary]} style={styles.contentCard}>
                <Text style={styles.completionTitle}>Chain Complete!</Text>
                <Text style={styles.completionMessage}>{chain.title}</Text>
                {result && (
                  <Text
                    style={styles.completionPoints}
                    accessibilityLabel={`${result.stars} of 3 stars. ${result.score} points.`}
                  >
                    {'★'.repeat(result.stars) + '☆'.repeat(3 - result.stars)} Points earned: {result.score}
                  </Text>
                )}
                <GameControls
                  onHint={handleHint}
                  onReveal={handleReveal}
                  onRestart={handleRestart}
                  onNextChain={handleNextChain}
                  hintAvailable={false}
                  isCompleted
                />
              </GradientView>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: 3,
    marginBottom: 3,
    marginTop: Platform.OS === 'ios' ? 35 : 0,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Play-Bold',
    padding: 12,
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
    paddingHorizontal: 14,
    justifyContent: 'flex-start',
  },
  clueContainer: {
    width: '100%',
  },
  contentCard: {
    width: '100%',
    padding: 8,
    borderRadius: 16,
    elevation: 6,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  completionTitle: {
    fontSize: 28,
    fontFamily: 'Play-Bold',
    color: Colors.secondary,
    marginBottom: 10,
  },
  completionMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  completionPoints: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  replayButton: {
    minHeight: 44,
    marginVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
