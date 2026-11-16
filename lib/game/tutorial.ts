import { answerLetters, isCorrect, isNearMiss, maxHintLetters, normalize } from './answers';
import type { Link, Outcome } from './types';

/** After this many wrong guesses on a tutorial link, the tiles show the answer. */
export const TUTORIAL_SHOW_ANSWER_AFTER = 2;

export type TutorialLinkState = {
  hintLetters: number;
  wrongGuesses: number;
  solved: boolean;
  revealed: boolean;
};

export type TutorialState = {
  /** The link being played; equals `links.length` once every link is solved. */
  linkIndex: number;
  links: TutorialLinkState[];
  lastOutcome: Outcome | null;
};

export type TutorialAction =
  | { type: 'SUBMIT_GUESS'; guess: string }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'HINT' }
  | { type: 'REVEAL' };

export function createTutorialState(links: readonly Link[]): TutorialState {
  return {
    linkIndex: 0,
    links: links.map(() => ({ hintLetters: 0, wrongGuesses: 0, solved: false, revealed: false })),
    lastOutcome: null,
  };
}

export function isTutorialDone(state: TutorialState): boolean {
  return state.linkIndex >= state.links.length;
}

/**
 * The tutorial's own tiny game: the same answer matching as the real game, no
 * score, and after `TUTORIAL_SHOW_ANSWER_AFTER` misses the whole answer appears
 * in the tiles so nobody gets stuck.
 */
export function createTutorialReducer(links: readonly Link[]) {
  return function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
    if (isTutorialDone(state)) return state;
    const i = state.linkIndex;
    const link = links[i];
    const current = state.links[i];
    const patch = (p: Partial<TutorialLinkState>) => state.links.map((l, j) => (j === i ? { ...l, ...p } : l));

    switch (action.type) {
      case 'SUBMIT_GUESS': {
        if (!normalize(action.guess)) return state;
        if (isCorrect(action.guess, link)) {
          return { linkIndex: i + 1, links: patch({ solved: true }), lastOutcome: 'correct' };
        }
        if (isNearMiss(action.guess, link)) return { ...state, lastOutcome: 'near' };
        const wrongGuesses = current.wrongGuesses + 1;
        const hintLetters =
          wrongGuesses >= TUTORIAL_SHOW_ANSWER_AFTER ? answerLetters(link).length : current.hintLetters;
        return { ...state, links: patch({ wrongGuesses, hintLetters }), lastOutcome: 'wrong' };
      }
      case 'CLEAR_FEEDBACK':
        return state.lastOutcome === null ? state : { ...state, lastOutcome: null };
      case 'HINT':
        if (current.hintLetters >= maxHintLetters(link)) return state;
        return { ...state, links: patch({ hintLetters: current.hintLetters + 1 }), lastOutcome: null };
      case 'REVEAL':
        return { linkIndex: i + 1, links: patch({ solved: true, revealed: true }), lastOutcome: null };
      default:
        return state;
    }
  };
}

/** True when the tiles already show the whole answer (after too many misses). */
export function tutorialShowsAnswer(link: Link, state: TutorialLinkState): boolean {
  return state.hintLetters >= answerLetters(link).length;
}
