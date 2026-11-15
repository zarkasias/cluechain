import { chains } from '../../../data/chains';
import {
  canHint,
  chainResult,
  createInitialState,
  createReducer,
  isChainComplete,
  toSave,
} from '../reducer';
import { freshSave } from '../storage';
import type { GameAction, GameState } from '../types';

const reducer = createReducer(chains);
const run = (s: GameState, ...actions: GameAction[]) => actions.reduce(reducer, s);
const guess = (g: string): GameAction => ({ type: 'SUBMIT_GUESS', guess: g, now: Date.UTC(2026, 10, 14, 12) });

describe('reducer', () => {
  it('a full 5-link playthrough reaches complete', () => {
    let s = createInitialState(chains);
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
    let s = run(createInitialState(chains), guess('giraffe'));
    expect(s.lastOutcome).toBe('wrong');
    expect(s.links[0]).toMatchObject({ wrongGuesses: 1, value: 90 });
    s = run(s, { type: 'CLEAR_FEEDBACK' }, guess('elephan'));
    expect(s.lastOutcome).toBe('near');
    expect(s.links[0].value).toBe(90);
  });

  it('ignores empty guesses', () => {
    const s0 = createInitialState(chains);
    expect(run(s0, guess('   '))).toBe(s0);
  });

  it('limits hints to answer.length − 1', () => {
    let s = createInitialState(chains); // "elephant": 8 letters
    for (let i = 0; i < 10; i++) s = run(s, { type: 'HINT' });
    expect(s.links[0].hintLetters).toBe(7);
    expect(canHint(chains, s)).toBe(false);
  });

  it('REVEAL scores 0 and advances', () => {
    const s = run(createInitialState(chains), { type: 'REVEAL' });
    expect(s.links[0]).toMatchObject({ revealed: true, solved: true, value: 0 });
    expect(s.linkIndex).toBe(1);
  });

  it('TICK accumulates time until the chain is complete', () => {
    let s = run(createInitialState(chains), { type: 'TICK', ms: 1000 }, { type: 'TICK', ms: 1000 });
    expect(s.elapsedMs).toBe(2000);
    s = chains[0].links.reduce((st, l) => run(st, guess(l.answer)), s);
    s = run(s, { type: 'TICK', ms: 1000 });
    expect(s.elapsedMs).toBe(2000);
    expect(s.stats.bestTimeMs).toBe(2000);
  });

  it('RESTART resets the chain but not stats', () => {
    const s = run(createInitialState(chains), guess('elephant'), { type: 'TICK', ms: 500 }, { type: 'RESTART' });
    expect(s.linkIndex).toBe(0);
    expect(s.elapsedMs).toBe(0);
    expect(s.links.every((l) => !l.solved)).toBe(true);
  });

  it('NEXT_CHAIN picks the first unfinished chain', () => {
    let s = createInitialState(chains);
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
    const s = run({ ...createInitialState(chains), history }, { type: 'NEXT_CHAIN' });
    expect(s.chainId).toBeNull();
  });

  it('HYDRATE resumes mid-chain at the same link', () => {
    const played = run(createInitialState(chains), guess('elephant'), guess('brain'), { type: 'HINT' });
    const resumed = run(createInitialState(chains), { type: 'HYDRATE', save: toSave(played) });
    expect(resumed.hydrated).toBe(true);
    expect(resumed.linkIndex).toBe(2);
    expect(resumed.links).toEqual(played.links);
  });

  it('HYDRATE with an unknown chainId starts at the first unfinished chain', () => {
    const save = freshSave();
    save.history['classic-01'] = { stars: 1, bestScore: 1, bestTimeMs: 1, firstCompletedAt: '' };
    save.progress = { chainId: 'gone', linkIndex: 2, links: [], elapsedMs: 0 };
    const s = run(createInitialState(chains), { type: 'HYDRATE', save });
    expect(s.chainId).toBe('classic-02');
    expect(s.linkIndex).toBe(0);
  });

  it('COMPLETE_TUTORIAL sets seenTutorial', () => {
    expect(run(createInitialState(chains), { type: 'COMPLETE_TUTORIAL' }).settings.seenTutorial).toBe(true);
  });
});
