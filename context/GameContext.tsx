import React, { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { chains } from '@/data/chains';
import { setHapticsEnabled } from '@/lib/haptics';
import { createInitialState, createReducer, createSaver, loadSave, toSave } from '@/lib/game';
import type { Chain, GameAction, GameState } from '@/lib/game';

const reducer = createReducer(chains);

type GameContextValue = { state: GameState; dispatch: React.Dispatch<GameAction>; chains: Chain[] };

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, chains, createInitialState);
  const saver = useMemo(() => createSaver(AsyncStorage), []);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    setHapticsEnabled(state.settings.haptics);
  }, [state.settings.haptics]);

  // Hydrate once.
  useEffect(() => {
    let cancelled = false;
    loadSave(AsyncStorage).then((save) => {
      if (!cancelled) dispatch({ type: 'HYDRATE', save });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave (debounced). Time is saved at most every 5 s so ticks don't write every second.
  const timeBucket = Math.floor(state.elapsedMs / 5000);
  useEffect(() => {
    if (state.hydrated) saver.schedule(toSave(latest.current));
  }, [saver, state.hydrated, state.chainId, state.linkIndex, state.links, state.history, state.stats, state.settings, timeBucket]);

  // Save immediately when the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active' && latest.current.hydrated) {
        saver.schedule(toSave(latest.current));
        void saver.flush();
      }
    });
    return () => sub.remove();
  }, [saver]);

  const value = useMemo(() => ({ state, dispatch, chains }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('Game hooks must be used within a GameProvider');
  return context;
}

export function useGameState() {
  return useGameContext().state;
}

export function useGameDispatch() {
  return useGameContext().dispatch;
}

export function useChains() {
  return useGameContext().chains;
}

/** True when motion should be reduced: `settings.reduceMotion` if set, otherwise the system setting. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const override = useGameContext().state.settings.reduceMotion;
  return override ?? system;
}

const TICK_MS = 1000;

/**
 * Sends a TICK every second while the calling screen is focused and the app is
 * active. Call it from the Play tab.
 */
export function usePlayTimer() {
  const dispatch = useGameDispatch();

  useFocusEffect(
    React.useCallback(() => {
      let interval: ReturnType<typeof setInterval> | null = null;
      let last = Date.now();

      const start = () => {
        if (interval) return;
        last = Date.now();
        interval = setInterval(() => {
          const now = Date.now();
          // Cap each tick so a suspended JS thread can't add a huge jump.
          dispatch({ type: 'TICK', ms: Math.min(now - last, TICK_MS * 5) });
          last = now;
        }, TICK_MS);
      };
      const stop = () => {
        if (interval) clearInterval(interval);
        interval = null;
      };

      if (AppState.currentState === 'active') start();
      const sub = AppState.addEventListener('change', (next) => (next === 'active' ? start() : stop()));
      return () => {
        stop();
        sub.remove();
      };
    }, [dispatch]),
  );
}
