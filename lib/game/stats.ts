import type { ChainResult, Stats } from './types';

export function emptyStats(): Stats {
  return {
    chainsCompleted: 0,
    perfectChains: 0,
    totalPoints: 0,
    wordsSolved: 0,
    hintsUsed: 0,
    wordsRevealed: 0,
    bestTimeMs: null,
    totalTimeMs: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDay: null,
  };
}

/** 'YYYY-MM-DD' for the given instant, in local time. */
export function localDayISO(epochMs: number): string {
  const d = new Date(epochMs);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** The calendar day before `dayISO` ('YYYY-MM-DD'). */
export function previousDayISO(dayISO: string): string {
  const [y, m, d] = dayISO.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - 1));
  return date.toISOString().slice(0, 10);
}

/** Folds a chain's FIRST completion into the stats. Replays must not call this. */
export function applyFirstCompletion(stats: Stats, result: ChainResult, todayISO: string): Stats {
  let currentStreak: number;
  if (stats.lastPlayedDay === todayISO) currentStreak = Math.max(1, stats.currentStreak);
  else if (stats.lastPlayedDay === previousDayISO(todayISO)) currentStreak = stats.currentStreak + 1;
  else currentStreak = 1;

  return {
    chainsCompleted: stats.chainsCompleted + 1,
    perfectChains: stats.perfectChains + (result.stars === 3 ? 1 : 0),
    totalPoints: stats.totalPoints + result.score,
    wordsSolved: stats.wordsSolved + result.wordsSolved,
    hintsUsed: stats.hintsUsed + result.hintLetters,
    wordsRevealed: stats.wordsRevealed + result.wordsRevealed,
    bestTimeMs: stats.bestTimeMs === null ? result.timeMs : Math.min(stats.bestTimeMs, result.timeMs),
    totalTimeMs: stats.totalTimeMs + result.timeMs,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastPlayedDay: todayISO,
  };
}
