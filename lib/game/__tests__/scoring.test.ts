import { chains } from '../../../data/chains';
import { chainScore, linkValue, newLinkState, stars } from '../scoring';
import { createInitialState, createReducer } from '../reducer';
import type { LinkState } from '../types';

const link = (p: Partial<LinkState> = {}): LinkState => {
  const l = { ...newLinkState(), solved: true, ...p };
  return { ...l, value: linkValue(l) };
};
const five = (p: Partial<LinkState> = {}) => Array.from({ length: 5 }, () => link(p));

describe('linkValue', () => {
  it('starts at 100', () => {
    expect(linkValue(newLinkState())).toBe(100);
  });
  it('costs 10 per wrong guess and 20 per hint letter', () => {
    expect(linkValue({ hintLetters: 1, wrongGuesses: 2, revealed: false })).toBe(60);
  });
  it('never drops below the floor of 10', () => {
    expect(linkValue({ hintLetters: 4, wrongGuesses: 5, revealed: false })).toBe(10);
  });
  it('is 0 when revealed', () => {
    expect(linkValue({ hintLetters: 0, wrongGuesses: 0, revealed: true })).toBe(0);
  });
});

describe('chainScore', () => {
  it('adds the perfect bonus with no hints or reveals', () => {
    expect(chainScore(five())).toBe(600);
    expect(chainScore(five({ wrongGuesses: 1 }))).toBe(450 + 100);
  });
  it('drops the bonus when a hint is used', () => {
    const links = five();
    links[2] = link({ hintLetters: 1 });
    expect(chainScore(links)).toBe(480);
  });
  it('a reveal scores 0 for that link and drops the bonus', () => {
    const links = five();
    links[0] = link({ revealed: true });
    expect(chainScore(links)).toBe(400);
  });
  it('counts only solved links while in progress', () => {
    const links = [link(), link(), newLinkState(), newLinkState(), newLinkState()];
    expect(chainScore(links)).toBe(200);
  });
});

describe('hints on link 1 (B2 regression)', () => {
  it('lower the score even when the score is 0', () => {
    const reducer = createReducer(chains);
    let s = createInitialState(chains);
    s = reducer(s, { type: 'HINT' });
    expect(s.links[0].value).toBe(80);
    s = reducer(s, { type: 'SUBMIT_GUESS', guess: 'elephant' });
    expect(chainScore(s.links)).toBe(80);
  });
});

describe('stars', () => {
  it('3 stars: no hints, no reveals, at most 2 wrong', () => {
    const links = five();
    links[0] = link({ wrongGuesses: 2 });
    expect(stars(links)).toBe(3);
  });
  it('2 stars: 3 wrong guesses', () => {
    const links = five();
    links[0] = link({ wrongGuesses: 3 });
    expect(stars(links)).toBe(2);
  });
  it('2 stars: up to 3 hint letters', () => {
    const links = five();
    links[0] = link({ hintLetters: 2 });
    links[1] = link({ hintLetters: 1 });
    expect(stars(links)).toBe(2);
  });
  it('1 star: 4 hint letters', () => {
    const links = five({ hintLetters: 1 });
    links[0] = link({ hintLetters: 0 }); // 4 hint letters in total
    expect(stars(links)).toBe(1);
  });
  it('1 star: any reveal', () => {
    const links = five();
    links[4] = link({ revealed: true });
    expect(stars(links)).toBe(1);
  });
});
