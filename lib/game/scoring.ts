import type { LinkState, Stars } from './types';

export const LINK_START_VALUE = 100;
export const WRONG_GUESS_PENALTY = 10;
export const HINT_LETTER_PENALTY = 20;
export const LINK_FLOOR = 10;
export const PERFECT_BONUS = 100;

export function newLinkState(): LinkState {
  return { hintLetters: 0, wrongGuesses: 0, revealed: false, solved: false, value: LINK_START_VALUE };
}

/** A link's value: 100 minus penalties, never below 10, or 0 if revealed. */
export function linkValue(link: Pick<LinkState, 'hintLetters' | 'wrongGuesses' | 'revealed'>): number {
  if (link.revealed) return 0;
  const raw = LINK_START_VALUE - WRONG_GUESS_PENALTY * link.wrongGuesses - HINT_LETTER_PENALTY * link.hintLetters;
  return Math.max(LINK_FLOOR, raw);
}

function totals(links: LinkState[]) {
  return links.reduce(
    (t, l) => ({
      hints: t.hints + l.hintLetters,
      wrong: t.wrong + l.wrongGuesses,
      reveals: t.reveals + (l.revealed ? 1 : 0),
    }),
    { hints: 0, wrong: 0, reveals: 0 },
  );
}

export function isPerfect(links: LinkState[]): boolean {
  const t = totals(links);
  return t.hints === 0 && t.reveals === 0;
}

/**
 * Sum of the solved links' values, plus the perfect bonus once every link is
 * solved with no hints and no reveals.
 */
export function chainScore(links: LinkState[]): number {
  const sum = links.filter((l) => l.solved).reduce((s, l) => s + l.value, 0);
  const complete = links.length > 0 && links.every((l) => l.solved);
  return sum + (complete && isPerfect(links) ? PERFECT_BONUS : 0);
}

export function stars(links: LinkState[]): Stars {
  const t = totals(links);
  if (t.hints === 0 && t.reveals === 0 && t.wrong <= 2) return 3;
  if (t.reveals === 0 && t.hints <= 3) return 2;
  return 1;
}
