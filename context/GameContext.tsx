import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wordChains } from '@/data/wordChains';

// Types
type WordChain = {
  id: string;
  clues: string[];
  answers: string[];
};

type GameStats = {
  chainsCompleted: number;
  hintsUsed: number;
  wordsGuessed: number;
  bestTime: number | null;
  totalPoints: number;
};

type GameState = {
  currentChain: WordChain;
  currentClueIndex: number;
  hintLevel: number;
  solvedWords: string[];
  isChainCompleted: boolean;
  currentPoints: number;
  stats: GameStats;
};

type GameAction =
  | { type: 'CHECK_ANSWER'; payload: string }
  | { type: 'SHOW_HINT' }
  | { type: 'RESTART_CHAIN' }
  | { type: 'LOAD_NEXT_CHAIN' }
  | { type: 'LOAD_SAVED_STATS'; payload: GameStats };

// Constants
const POINTS_PER_CORRECT_ANSWER = 100;
const POINTS_PER_HINT = 25;
const MAX_HINT_LEVEL = 3;

// Initial state
const initialState: GameState = {
  currentChain: wordChains[0],
  currentClueIndex: 0,
  hintLevel: 0,
  solvedWords: [],
  isChainCompleted: false,
  currentPoints: 0,
  stats: {
    chainsCompleted: 0,
    hintsUsed: 0,
    wordsGuessed: 0,
    bestTime: null,
    totalPoints: 0,
  },
};

// Create context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CHECK_ANSWER': {
      // Validate that we have a current chain and the index is valid
      if (!state.currentChain?.answers || 
          state.currentClueIndex < 0 || 
          state.currentClueIndex >= state.currentChain.answers.length) {
        return state;
      }

      const userAnswer = action.payload.trim().toLowerCase();
      const correctAnswer = state.currentChain.answers[state.currentClueIndex].toLowerCase();
      
      if (userAnswer === correctAnswer) {
        const newSolvedWords = [...state.solvedWords, correctAnswer];
        const newIndex = state.currentClueIndex + 1;
        const isCompleted = newIndex >= state.currentChain.clues.length;
        
        // Calculate points for correct answer
        const earnedPoints = POINTS_PER_CORRECT_ANSWER;
        const newCurrentPoints = state.currentPoints + earnedPoints;
        
        // Update stats
        const newStats = {
          ...state.stats,
          wordsGuessed: state.stats.wordsGuessed + 1,
          chainsCompleted: isCompleted ? state.stats.chainsCompleted + 1 : state.stats.chainsCompleted,
          totalPoints: state.stats.totalPoints + earnedPoints,
        };
        
        return {
          ...state,
          currentClueIndex: newIndex,
          hintLevel: 0,
          solvedWords: newSolvedWords,
          isChainCompleted: isCompleted,
          currentPoints: newCurrentPoints,
          stats: newStats,
        };
      }
      return state;
    }
    
    case 'SHOW_HINT': {
      if (state.hintLevel >= MAX_HINT_LEVEL) {
        return state;
      }

      const pointsDeduction = POINTS_PER_HINT * (state.hintLevel + 1);
      const newCurrentPoints = Math.max(0, state.currentPoints - pointsDeduction);
      
      return {
        ...state,
        hintLevel: state.hintLevel + 1,
        stats: {
          ...state.stats,
          hintsUsed: state.stats.hintsUsed + 1,
          totalPoints: Math.max(0, state.stats.totalPoints - pointsDeduction),
        },
        currentPoints: newCurrentPoints,
      };
    }
    
    case 'RESTART_CHAIN':
      return {
        ...state,
        currentClueIndex: 0,
        hintLevel: 0,
        solvedWords: [],
        isChainCompleted: false,
        currentPoints: 0,
        stats: state.stats,
      };
    
    case 'LOAD_NEXT_CHAIN': {
      // Validate that wordChains array exists and has items
      if (!wordChains || wordChains.length === 0) {
        return state;
      }

      // Find the index of the current chain
      const currentIndex = wordChains.findIndex(chain => chain.id === state.currentChain?.id);
      // Calculate the next index, wrapping around if needed
      const nextIndex = (currentIndex + 1) % wordChains.length;
      
      return {
        ...state,
        currentChain: wordChains[nextIndex],
        currentClueIndex: 0,
        hintLevel: 0,
        solvedWords: [],
        isChainCompleted: false,
        currentPoints: 0,
        stats: state.stats,
      };
    }
    
    case 'LOAD_SAVED_STATS':
      return {
        ...state,
        stats: action.payload,
      };
    
    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Load saved stats when the app starts
  useEffect(() => {
    const loadSavedStats = async () => {
      try {
        const savedStats = await AsyncStorage.getItem('gameStats');
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          dispatch({ type: 'LOAD_SAVED_STATS', payload: parsedStats });
        }
      } catch (error) {
        console.error('Error loading saved stats:', error);
      }
    };
    loadSavedStats();
  }, []);

  // Save stats whenever they change
  useEffect(() => {
    const saveStats = async () => {
      try {
        await AsyncStorage.setItem('gameStats', JSON.stringify(state.stats));
      } catch (error) {
        console.error('Error saving stats:', error);
      }
    };
    saveStats();
  }, [state.stats]);

  const value = { state, dispatch };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook for accessing game state and dispatch
export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context.state;
}

export function useGameDispatch() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameProvider');
  }
  return context.dispatch;
}