import { tutorialLinks } from '../../../data/tutorial';
import {
  createTutorialReducer,
  createTutorialState,
  isTutorialDone,
  TUTORIAL_SHOW_ANSWER_AFTER,
  tutorialShowsAnswer,
} from '../tutorial';
import type { TutorialAction, TutorialState } from '../tutorial';
import { isCorrect } from '../answers';

const reducer = createTutorialReducer(tutorialLinks);
const run = (s: TutorialState, ...a: TutorialAction[]) => a.reduce(reducer, s);
const guess = (g: string): TutorialAction => ({ type: 'SUBMIT_GUESS', guess: g });

describe('tutorial data', () => {
  it('is banana → ice cream, as in DESIGN_SPEC §5', () => {
    expect(tutorialLinks.map((l) => l.answer)).toEqual(['banana', 'ice cream']);
    expect(tutorialLinks[1].clue).toContain('{BANANA}');
    expect(isCorrect('icecream', tutorialLinks[1])).toBe(true);
  });
});

describe('tutorial reducer', () => {
  it('solves both links and finishes', () => {
    const s = run(createTutorialState(tutorialLinks), guess('Banana'), guess('ice cream'));
    expect(isTutorialDone(s)).toBe(true);
    expect(s.links.every((l) => l.solved && !l.revealed)).toBe(true);
  });

  it('near misses are encouragement, not misses', () => {
    const s = run(createTutorialState(tutorialLinks), guess('banan'));
    expect(s.lastOutcome).toBe('near');
    expect(s.links[0].wrongGuesses).toBe(0);
  });

  it(`shows the answer in the tiles after ${TUTORIAL_SHOW_ANSWER_AFTER} wrong guesses`, () => {
    let s = run(createTutorialState(tutorialLinks), guess('apple'));
    expect(tutorialShowsAnswer(tutorialLinks[0], s.links[0])).toBe(false);
    s = run(s, { type: 'CLEAR_FEEDBACK' }, guess('mango'));
    expect(s.lastOutcome).toBe('wrong');
    expect(tutorialShowsAnswer(tutorialLinks[0], s.links[0])).toBe(true);
    expect(s.links[0].hintLetters).toBe(6);
  });

  it('hints stop at length − 1; reveal solves the link', () => {
    let s = createTutorialState(tutorialLinks);
    for (let i = 0; i < 10; i++) s = run(s, { type: 'HINT' });
    expect(s.links[0].hintLetters).toBe(5);
    s = run(s, { type: 'REVEAL' });
    expect(s.linkIndex).toBe(1);
    expect(s.links[0]).toMatchObject({ solved: true, revealed: true });
  });

  it('ignores input once done and ignores empty guesses', () => {
    const s0 = createTutorialState(tutorialLinks);
    expect(run(s0, guess('  '))).toBe(s0);
    const done = run(s0, guess('banana'), guess('icecream'));
    expect(run(done, guess('x'), { type: 'HINT' })).toBe(done);
  });
});
