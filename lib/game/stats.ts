import type { Chain, ChainResult, History, HistoryEntry, Stats } from './types';

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

/**
 * The streak to show today. A streak that wasn't extended yesterday or today
 * has lapsed, so it reads 0. Computed at display time; saved stats are not changed.
 */
export function displayStreak(stats: Pick<Stats, 'currentStreak' | 'lastPlayedDay'>, todayISO: string): number {
  const last = stats.lastPlayedDay;
  if (last === null) return 0;
  return last === todayISO || last === previousDayISO(todayISO) ? stats.currentStreak : 0;
}

/** Average time per first completion, or null before any. */
export function averageTimeMs(stats: Pick<Stats, 'totalTimeMs' | 'chainsCompleted'>): number | null {
  return stats.chainsCompleted > 0 ? stats.totalTimeMs / stats.chainsCompleted : null;
}

export type HistoryRow = { chain: Chain; number: number; entry: HistoryEntry };

/** Completed chains that still exist in the content, newest first completion first. */
export function historyRows(chains: Chain[], history: History): HistoryRow[] {
  return chains
    .map((chain, i) => ({ chain, number: i + 1, entry: history[chain.id] }))
    .filter((r): r is HistoryRow => r.entry !== undefined)
    .sort((a, b) => b.entry.firstCompletedAt.localeCompare(a.entry.firstCompletedAt) || a.number - b.number);
}
