import type { Link } from '../lib/game/types';

/**
 * The built-in demo chain for the first-run tutorial (DESIGN_SPEC §5). It is not
 * part of `chains` and never touches stats or history.
 */
export const tutorialLinks: readonly [Link, Link] = [
  { clue: 'A yellow fruit monkeys love', answer: 'banana' },
  { clue: 'A {BANANA} split is served in this cold treat', answer: 'ice cream', accept: ['icecream'] },
];

/**
 * A complete 5-link example for the Guide tab's illustrations. It is never
 * played, so showing its answers spoils nothing.
 */
export const guideExampleLinks: readonly Link[] = [
  ...tutorialLinks,
  { clue: '{ICE CREAM} is often served in this crunchy holder', answer: 'cone' },
  { clue: 'A {CONE} falls from this evergreen tree', answer: 'pine' },
  { clue: 'Add this fruit to {PINE} for a tropical treat', answer: 'apple' },
];
