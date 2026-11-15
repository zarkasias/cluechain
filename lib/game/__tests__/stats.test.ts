import { chains } from '../../../data/chains';
import { createInitialState, createReducer } from '../reducer';
import { applyFirstCompletion, emptyStats, previousDayISO } from '../stats';
import type { ChainResult, GameState } from '../types';

const result: ChainResult = {
  chainId: 'x',
  score: 500,
  stars: 3,
  timeMs: 60_000,
  hintLetters: 0,
  wrongGuesses: 0,
  wordsRevealed: 0,
  wordsSolved: 5,
  links: [],
};

describe('previousDayISO', () => {
  it('crosses month and year boundaries', () => {
    expect(previousDayISO('2026-03-01')).toBe('2026-02-28');
    expect(previousDayISO('2026-01-01')).toBe('2025-12-31');
  });
});

describe('applyFirstCompletion', () => {
  it('adds the result to the stats', () => {
    const s = applyFirstCompletion(emptyStats(), result, '2026-11-14');
    expect(s).toMatchObject({
      chainsCompleted: 1,
      perfectChains: 1,
      totalPoints: 500,
      wordsSolved: 5,
      bestTimeMs: 60_000,
      totalTimeMs: 60_000,
      currentStreak: 1,
      bestStreak: 1,
      lastPlayedDay: '2026-11-14',
    });
  });

  it('keeps the faster best time', () => {
    const a = applyFirstCompletion(emptyStats(), result, '2026-11-14');
    const b = applyFirstCompletion(a, { ...result, timeMs: 90_000 }, '2026-11-14');
    expect(b.bestTimeMs).toBe(60_000);
  });

  describe('streak', () => {
    const base = { ...emptyStats(), currentStreak: 3, bestStreak: 5, lastPlayedDay: '2026-11-13' };
    it('same day: unchanged', () => {
      const s = applyFirstCompletion({ ...base, lastPlayedDay: '2026-11-14' }, result, '2026-11-14');
      expect(s.currentStreak).toBe(3);
    });
    it('next day: +1', () => {
      const s = applyFirstCompletion(base, result, '2026-11-14');
      expect(s.currentStreak).toBe(4);
      expect(s.bestStreak).toBe(5);
    });
    it('after a gap: resets to 1', () => {
      const s = applyFirstCompletion(base, result, '2026-11-16');
      expect(s.currentStreak).toBe(1);
    });
    it('updates bestStreak', () => {
      const s = applyFirstCompletion({ ...base, currentStreak: 5 }, result, '2026-11-14');
      expect(s.bestStreak).toBe(6);
    });
  });
});

describe('replaying a completed chain (B2 regression)', () => {
  const reducer = createReducer(chains);
  const playThrough = (s: GameState, now: number) =>
    chains[0].links.reduce((st, l) => reducer(st, { type: 'SUBMIT_GUESS', guess: l.answer, now }), s);

  it('does not change stats, via Restart or Replay', () => {
    const now = new Date(2026, 10, 14, 12).getTime();
    let s = playThrough(createInitialState(chains), now);
    const statsAfterFirst = s.stats;
    expect(statsAfterFirst.chainsCompleted).toBe(1);

    s = reducer(s, { type: 'RESTART' });
    s = playThrough(s, now);
    expect(s.stats).toEqual(statsAfterFirst);

    s = reducer(s, { type: 'REPLAY_CHAIN', id: chains[0].id });
    s = reducer(s, { type: 'HINT' });
    s = playThrough(s, now);
    expect(s.stats).toEqual(statsAfterFirst);
    // The personal best is kept.
    expect(s.history[chains[0].id].bestScore).toBe(600);
    expect(s.history[chains[0].id].stars).toBe(3);
  });
});
