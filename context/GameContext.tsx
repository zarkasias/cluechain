import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
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
};

type GameState = {
  currentChain: WordChain;
  currentClueIndex: number;
  hintRevealed: boolean;
  solvedWords: string[];
  isChainCompleted: boolean;
  stats: GameStats;
};

type GameAction =
  | { type: 'CHECK_ANSWER'; payload: string }
  | { type: 'SHOW_HINT' }
  | { type: 'RESTART_CHAIN' }
  | { type: 'LOAD_NEXT_CHAIN' };

// Initial state
const initialState: GameState = {
  currentChain: wordChains[0],
  currentClueIndex: 0,
  hintRevealed: false,
  solvedWords: [],
  isChainCompleted: false,
  stats: {
    chainsCompleted: 0,
    hintsUsed: 0,
    wordsGuessed: 0,
    bestTime: null,
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
        
        // Update stats
        const newStats = {
          ...state.stats,
          wordsGuessed: state.stats.wordsGuessed + 1,
          chainsCompleted: isCompleted ? state.stats.chainsCompleted + 1 : state.stats.chainsCompleted,
        };
        
        return {
          ...state,
          currentClueIndex: newIndex,
          hintRevealed: false,
          solvedWords: newSolvedWords,
          isChainCompleted: isCompleted,
          stats: newStats,
        };
      }
      return state;
    }
    
    case 'SHOW_HINT':
      return {
        ...state,
        hintRevealed: true,
        stats: {
          ...state.stats,
          hintsUsed: state.stats.hintsUsed + 1,
        },
      };
    
    case 'RESTART_CHAIN':
      return {
        ...state,
        currentClueIndex: 0,
        hintRevealed: false,
        solvedWords: [],
        isChainCompleted: false,
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
        hintRevealed: false,
        solvedWords: [],
        isChainCompleted: false,
      };
    }
    
    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
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