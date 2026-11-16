import { addCheckedGuess, checkLetters, coerceCheckedGuesses, countMarks, MAX_CHECKED_GUESSES } from '../letters';
import type { Link } from '../types';

const link = (answer: string, accept?: string[]): Link => ({ clue: 'x', answer, accept });
/** Marks as a compact string: R right, E elsewhere, . absent. */
const marks = (guess: string, l: Link) =>
  checkLetters(guess, l)
    ?.map((c) => (c.mark === 'right' ? 'R' : c.mark === 'elsewhere' ? 'E' : '.'))
    .join('') ?? null;

describe('checkLetters (GAME_RULES worked examples)', () => {
  it('kitten / titles: a repeated letter is right once and elsewhere once', () => {
    expect(marks('titles', link('kitten'))).toBe('ERR.R.');
    expect(checkLetters('titles', link('kitten'))!.map((c) => c.letter).join('')).toBe('TITLES');
  });

  it('honey / hoops: an extra copy of a letter is absent', () => {
    expect(marks('hoops', link('honey'))).toBe('RR...');
  });

  it('puddle / paddle', () => {
    expect(marks('paddle', link('puddle'))).toBe('R.RRRR');
  });

  it('returns null for a correct guess, including accept forms and plurals', () => {
    expect(checkLetters('wellies', link('boots', ['wellies']))).toBeNull();
    expect(checkLetters('boots', link('boots'))).toBeNull();
    expect(checkLetters('Kitten', link('kitten'))).toBeNull();
  });

  it('returns null for a different length or an empty guess', () => {
    expect(checkLetters('pill', link('pillow'))).toBeNull();
    expect(checkLetters('  ', link('pillow'))).toBeNull();
  });

  it('marks every letter absent when nothing matches', () => {
    expect(marks('xyz', link('owl'))).toBe('...');
  });

  it('marks an anagram all elsewhere', () => {
    expect(marks('tca', link('cat'))).toBe('EEE');
  });

  it('compares multi-word answers without the space, and normalizes the guess', () => {
    expect(marks('Ice Creme', link('ice cream'))).toBe('RRRRRRE.');
    expect(marks('ice-crame', link('ice cream'))).toBe('RRRRREEE');
  });

  it('counts right and elsewhere letters', () => {
    expect(countMarks(checkLetters('titles', link('kitten'))!)).toEqual({ right: 3, elsewhere: 1 });
  });
});

describe('checked guess list', () => {
  it('keeps the newest guesses, normalized, without copies', () => {
    let list: string[] = [];
    for (const g of ['Aaa', 'bbb', 'ccc', 'ddd']) list = addCheckedGuess(list, g);
    expect(list).toEqual(['bbb', 'ccc', 'ddd']);
    expect(list).toHaveLength(MAX_CHECKED_GUESSES);
    expect(addCheckedGuess(list, 'BBB')).toEqual(['ccc', 'ddd', 'bbb']);
  });

  it('loads malformed saved values safely', () => {
    expect(coerceCheckedGuesses(undefined)).toEqual([]);
    expect(coerceCheckedGuesses('abc')).toEqual([]);
    expect(coerceCheckedGuesses(['Ab-c', 3, '', null, 'def'])).toEqual(['abc', 'def']);
    expect(coerceCheckedGuesses(['a', 'b', 'c', 'd'])).toEqual(['b', 'c', 'd']);
  });
});
