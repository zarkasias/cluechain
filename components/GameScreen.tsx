import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import ClueDisplay from './ClueDisplay';
import AnswerInput, { AnswerInputHandle } from './AnswerInput';
import WordChain from './WordChain';
import GameControls from './GameControls';
import { useGameState, useGameDispatch } from '@/context/GameContext';

export default function GameScreen() {
  const { 
    currentChain, 
    currentClueIndex, 
    hintLevel, 
    solvedWords, 
    isChainCompleted,
    currentPoints 
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
    if (!isChainCompleted && !isAnimating) {
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
      })
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
        })
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
      <View style={styles.header}>
        <Text style={styles.points}>Points: {currentPoints}</Text>
      </View>

      <WordChain solvedWords={solvedWords} />
      
      <Animated.View 
        style={[
          styles.clueContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {!isChainCompleted ? (
          <>
            <ClueDisplay 
              clue={currentClueIndex < currentChain.clues.length ? currentChain.clues[currentClueIndex] : ''}
              answer={currentClueIndex < currentChain.answers.length ? currentChain.answers[currentClueIndex] : undefined}
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
          </>
        ) : (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>Chain Complete!</Text>
            <Text style={styles.completionMessage}>
              You've successfully completed the word chain!
            </Text>
            <Text style={styles.completionPoints}>
              Points earned: {currentPoints}
            </Text>
          </View>
        )}
      </Animated.View>
      
      <GameControls 
        onHint={handleShowHint}
        onRestart={handleRestartChain}
        onNextChain={handleNextChain}
        hintDisabled={hintLevel >= 3 || isChainCompleted}
        isCompleted={isChainCompleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  points: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c4dff',
  },
  clueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  completionContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7c4dff',
    marginBottom: 16,
  },
  completionMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  completionPoints: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
  },
});