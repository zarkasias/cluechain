import { isCorrect, isNearMiss, normalize } from '../answers';
import type { Link } from '../types';

const banana: Link = { clue: '', answer: 'banana' };
const hourglass: Link = { clue: '', answer: 'hourglass', accept: ['hour glass', 'sand timer', 'egg timer'] };
const bus: Link = { clue: '', answer: 'bus' };
const chords: Link = { clue: '', answer: 'chords', accept: ['chord'] };
const box: Link = { clue: '', answer: 'boxes' };

describe('normalize', () => {
  it('lowercases, trims and strips punctuation and spaces', () => {
    expect(normalize('Hour-glass ')).toBe('hourglass');
    expect(normalize("  It's  ")).toBe('its');
  });
  it('removes diacritics', () => {
    expect(normalize('Café')).toBe('cafe');
  });
});

describe('isCorrect', () => {
  it('matches the answer regardless of case and spacing', () => {
    expect(isCorrect('  BANANA ', banana)).toBe(true);
  });
  it('accepts simple plurals and singulars (B4)', () => {
    expect(isCorrect('bananas', banana)).toBe(true);
    expect(isCorrect('chord', chords)).toBe(true);
    expect(isCorrect('box', box)).toBe(true);
    expect(isCorrect('boxeses', box)).toBe(true);
  });
  it('does not apply plural rules to answers shorter than 4 letters', () => {
    expect(isCorrect('bu', bus)).toBe(false);
    expect(isCorrect('buss', bus)).toBe(false);
    expect(isCorrect('bus', bus)).toBe(true);
  });
  it('uses the accept list (B4)', () => {
    expect(isCorrect('hour glass', hourglass)).toBe(true);
    expect(isCorrect('Sand-Timer', hourglass)).toBe(true);
  });
  it('rejects wrong answers', () => {
    expect(isCorrect('apple', banana)).toBe(false);
  });
  it('ignores empty input', () => {
    expect(isCorrect('', banana)).toBe(false);
    expect(isCorrect('   ', banana)).toBe(false);
  });
});

describe('isNearMiss', () => {
  it('is true for one edit away', () => {
    expect(isNearMiss('banan', banana)).toBe(true);
    expect(isNearMiss('bonana', banana)).toBe(true);
    expect(isNearMiss('hourglads', hourglass)).toBe(true);
  });
  it('is false when correct', () => {
    expect(isNearMiss('bananas', banana)).toBe(false);
  });
  it('is false for two edits away', () => {
    expect(isNearMiss('bonane', banana)).toBe(false);
  });
  it('is false for short answers', () => {
    expect(isNearMiss('bat', bus)).toBe(false);
  });
  it('is false for empty input', () => {
    expect(isNearMiss('', banana)).toBe(false);
  });
});
