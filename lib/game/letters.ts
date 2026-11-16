import { isCorrect, normalize } from './answers';
import type { Link } from './types';

export type LetterMark = 'right' | 'elsewhere' | 'absent';
export type CheckedLetter = { letter: string; mark: LetterMark };

/** How many checked guesses each link keeps (GAME_RULES "Letter check"). */
export const MAX_CHECKED_GUESSES = 3;

/**
 * Wordle-style marks for a wrong guess of the same length as the canonical
 * answer. `null` when the guess is correct or a different length.
 */
export function checkLetters(guess: string, link: Link): CheckedLetter[] | null {
  const g = normalize(guess);
  const a = normalize(link.answer);
  if (!g || g.length !== a.length || isCorrect(guess, link)) return null;

  const marks: LetterMark[] = Array.from({ length: g.length }, () => 'absent');
  const unmatched = new Map<string, number>();
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) marks[i] = 'right';
    else unmatched.set(a[i], (unmatched.get(a[i]) ?? 0) + 1);
  }
  for (let i = 0; i < g.length; i++) {
    if (marks[i] === 'right') continue;
    const left = unmatched.get(g[i]) ?? 0;
    if (left > 0) {
      marks[i] = 'elsewhere';
      unmatched.set(g[i], left - 1);
    }
  }
  return marks.map((mark, i) => ({ letter: g[i].toUpperCase(), mark }));
}

/** Counts of right and elsewhere letters, for the feedback line. */
export function countMarks(letters: CheckedLetter[]): { right: number; elsewhere: number } {
  return {
    right: letters.filter((l) => l.mark === 'right').length,
    elsewhere: letters.filter((l) => l.mark === 'elsewhere').length,
  };
}

/** Adds a normalized guess to the list: newest last, no copies, at most MAX_CHECKED_GUESSES. */
export function addCheckedGuess(list: string[], guess: string): string[] {
  const g = normalize(guess);
  return [...list.filter((x) => x !== g), g].slice(-MAX_CHECKED_GUESSES);
}

/** Loads a saved `checkedGuesses` value, dropping anything malformed. */
export function coerceCheckedGuesses(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === 'string')
    .map(normalize)
    .filter(Boolean)
    .slice(-MAX_CHECKED_GUESSES);
}
