import { chains } from '../../../data/chains';
import {
  canHint,
  chainResult,
  createInitialState,
  createReducer,
  isChainComplete,
  isReplay,
  toSave,
} from '../reducer';
import { freshSave } from '../storage';
import type { GameAction, GameState } from '../types';

const reducer = createReducer(chains);
/** A new game with the tutorial already seen (so TICKs count). */
const start = (): GameState => {
  const s = createInitialState(chains);
  return { ...s, settings: { ...s.settings, seenTutorial: true } };
};
const run = (s: GameState, ...actions: GameAction[]) => actions.reduce(reducer, s);
const guess = (g: string): GameAction => ({ type: 'SUBMIT_GUESS', guess: g, now: Date.UTC(2026, 10, 14, 12) });

describe('reducer', () => {
  it('a full 5-link playthrough reaches complete', () => {
    let s = start();
    for (const [i, link] of chains[0].links.entries()) {
      expect(isChainComplete(s)).toBe(false);
      expect(s.linkIndex).toBe(i);
      s = run(s, guess(link.answer));
      expect(s.lastOutcome).toBe('correct');
    }
    expect(isChainComplete(s)).toBe(true);
    expect(chainResult(s)).toMatchObject({ score: 600, stars: 3, wordsSolved: 5 });
    expect(s.history['classic-01']).toBeDefined();
    expect(s.stats.chainsCompleted).toBe(1);
  });

  it('wrong guesses cost points, near misses do not', () => {
    let s = run(start(), guess('giraffe'));
    expect(s.lastOutcome).toBe('wrong');
    expect(s.links[0]).toMatchObject({ wrongGuesses: 1, value: 90 });
    s = run(s, { type: 'CLEAR_FEEDBACK' }, guess('elephan'));
    expect(s.lastOutcome).toBe('near');
    expect(s.links[0].value).toBe(90);
  });

  it('ignores empty guesses', () => {
    const s0 = start();
    expect(run(s0, guess('   '))).toBe(s0);
  });

  it('limits hints to answer.length − 1', () => {
    let s = start(); // "elephant": 8 letters
    for (let i = 0; i < 10; i++) s = run(s, { type: 'HINT' });
    expect(s.links[0].hintLetters).toBe(7);
    expect(canHint(chains, s)).toBe(false);
  });

  it('REVEAL scores 0 and advances', () => {
    const s = run(start(), { type: 'REVEAL' });
    expect(s.links[0]).toMatchObject({ revealed: true, solved: true, value: 0 });
    expect(s.linkIndex).toBe(1);
  });

  it('TICK accumulates time until the chain is complete', () => {
    let s = run(start(), { type: 'TICK', ms: 1000 }, { type: 'TICK', ms: 1000 });
    expect(s.elapsedMs).toBe(2000);
    s = chains[0].links.reduce((st, l) => run(st, guess(l.answer)), s);
    s = run(s, { type: 'TICK', ms: 1000 });
    expect(s.elapsedMs).toBe(2000);
    expect(s.stats.bestTimeMs).toBe(2000);
  });

  it('RESTART resets the chain but not stats', () => {
    const s = run(start(), guess('elephant'), { type: 'TICK', ms: 500 }, { type: 'RESTART' });
    expect(s.linkIndex).toBe(0);
    expect(s.elapsedMs).toBe(0);
    expect(s.links.every((l) => !l.solved)).toBe(true);
  });

  it('NEXT_CHAIN picks the first unfinished chain', () => {
    let s = start();
    s = { ...s, history: { 'classic-01': { stars: 3, bestScore: 600, bestTimeMs: 1, firstCompletedAt: '' } } };
    s = run(s, { type: 'NEXT_CHAIN' });
    expect(s.chainId).toBe('classic-02');

    s = {
      ...s,
      history: { ...s.history, 'classic-03': { stars: 3, bestScore: 600, bestTimeMs: 1, firstCompletedAt: '' } },
    };
    expect(run(s, { type: 'NEXT_CHAIN' }).chainId).toBe('classic-02');
  });

  it('NEXT_CHAIN with every chain done enters the all-complete state', () => {
    const entry = { stars: 3 as const, bestScore: 600, bestTimeMs: 1, firstCompletedAt: '' };
    const history = Object.fromEntries(chains.map((c) => [c.id, entry]));
    const s = run({ ...start(), history }, { type: 'NEXT_CHAIN' });
    expect(s.chainId).toBeNull();
  });

  it('HYDRATE resumes mid-chain at the same link', () => {
    const played = run(start(), guess('elephant'), guess('brain'), { type: 'HINT' });
    const resumed = run(start(), { type: 'HYDRATE', save: toSave(played) });
    expect(resumed.hydrated).toBe(true);
    expect(resumed.linkIndex).toBe(2);
    expect(resumed.links).toEqual(played.links);
  });

  it('HYDRATE with an unknown chainId starts at the first unfinished chain', () => {
    const save = freshSave();
    save.history['classic-01'] = { stars: 1, bestScore: 1, bestTimeMs: 1, firstCompletedAt: '' };
    save.progress = { chainId: 'gone', linkIndex: 2, links: [], elapsedMs: 0 };
    const s = run(start(), { type: 'HYDRATE', save });
    expect(s.chainId).toBe('classic-02');
    expect(s.linkIndex).toBe(0);
  });

  it('COMPLETE_TUTORIAL sets seenTutorial', () => {
    expect(run(start(), { type: 'COMPLETE_TUTORIAL' }).settings.seenTutorial).toBe(true);
  });

  describe('completion record', () => {
    const solveAll = (s: GameState) => chains[0].links.reduce((st, l) => run(st, guess(l.answer)), s);

    it('is null until the chain is complete, and marks a perfect first completion', () => {
      let s = run(start(), guess('elephant'));
      expect(s.completion).toBeNull();
      expect(isReplay(s)).toBe(false);
      s = solveAll(start());
      expect(s.completion).toEqual({ first: true, perfect: true, newBestTime: false, previous: null });
      expect(isReplay(s)).toBe(false);
    });

    it('newBestTime only when it beats an earlier best time', () => {
      const base = { ...start(), stats: { ...start().stats, bestTimeMs: 5000 } };
      const fast = solveAll(run(base, { type: 'TICK', ms: 3000 }));
      expect(fast.completion?.newBestTime).toBe(true);
      const slow = solveAll(run(base, { type: 'TICK', ms: 9000 }));
      expect(slow.completion?.newBestTime).toBe(false);
    });

    it('a replay records the previous best and leaves stats alone', () => {
      const first = solveAll(run(start(), { type: 'TICK', ms: 4000 }));
      const replaying = run(first, { type: 'REPLAY_CHAIN', id: 'classic-01' });
      expect(replaying.completion).toBeNull();
      expect(isReplay(replaying)).toBe(true);
      const done = solveAll(run(replaying, { type: 'TICK', ms: 2000 }));
      expect(done.completion).toEqual({
        first: false,
        perfect: false,
        newBestTime: false,
        previous: first.history['classic-01'],
      });
      expect(isReplay(done)).toBe(true);
      expect(done.stats).toEqual(first.stats);
      expect(done.history['classic-01'].bestTimeMs).toBe(2000);
    });

    it('survives a save and HYDRATE', () => {
      const done = solveAll(start());
      const resumed = run(start(), { type: 'HYDRATE', save: toSave(done) });
      expect(resumed.completion).toEqual(done.completion);
    });

    it('HYDRATE of a completed chain without a record still shows a recap', () => {
      const done = solveAll(start());
      const save = toSave(done);
      delete save.progress?.completion;
      const resumed = run(start(), { type: 'HYDRATE', save });
      expect(resumed.completion).toEqual({ first: true, perfect: false, newBestTime: false, previous: null });
    });

    it('ChainResult carries the per-link outcomes', () => {
      const s = solveAll(run(start(), guess('giraffe'), { type: 'CLEAR_FEEDBACK' }));
      expect(chainResult(s)?.links.map((l) => l.wrongGuesses)).toEqual([1, 0, 0, 0, 0]);
    });
  });

  describe('tutorial', () => {
    it('TICK is ignored until the tutorial is seen', () => {
      const s0 = createInitialState(chains);
      expect(run(s0, { type: 'TICK', ms: 1000 }).elapsedMs).toBe(0);
      expect(run(s0, { type: 'COMPLETE_TUTORIAL' }, { type: 'TICK', ms: 1000 }).elapsedMs).toBe(1000);
    });

    it('REPLAY_TUTORIAL shows it again without touching the current chain', () => {
      const playing = run(start(), guess('elephant'), { type: 'HINT' });
      const s = run(playing, { type: 'REPLAY_TUTORIAL' });
      expect(s.settings.seenTutorial).toBe(false);
      expect(s.links).toBe(playing.links);
      expect(s.linkIndex).toBe(1);
      expect(s.stats).toBe(playing.stats);
    });
  });
});
