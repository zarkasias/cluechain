import { clueText, parseClue } from '../clue';

describe('parseClue', () => {
  it('splits on markers and strips the braces', () => {
    expect(parseClue('An {ELEPHANT} never forgets')).toEqual([
      { text: 'An ', isLink: false },
      { text: 'ELEPHANT', isLink: true },
      { text: ' never forgets', isLink: false },
    ]);
  });

  it('handles a marker at the start', () => {
    expect(parseClue('{SNOW} melts')).toEqual([
      { text: 'SNOW', isLink: true },
      { text: ' melts', isLink: false },
    ]);
  });

  it('returns one plain segment when there is no marker', () => {
    expect(parseClue('Large gray animal with a trunk')).toEqual([
      { text: 'Large gray animal with a trunk', isLink: false },
    ]);
  });

  it('does not highlight the first capital letter (B1 regression)', () => {
    const segments = parseClue('The {BRAIN} sends signals');
    expect(segments[0]).toEqual({ text: 'The ', isLink: false });
    expect(segments.filter((s) => s.isLink).map((s) => s.text)).toEqual(['BRAIN']);
    expect(parseClue('Large gray animal').some((s) => s.isLink)).toBe(false);
  });

  it('clueText removes the braces', () => {
    expect(clueText('{BANANA}-yellow bird')).toBe('BANANA-yellow bird');
  });
});
