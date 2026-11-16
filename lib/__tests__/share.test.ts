import { chains } from '../../data/chains';
import { clueText } from '../game';
import type { ChainResult, LinkState } from '../game';
import { buildShareText } from '../share';

const link = (patch: Partial<LinkState> = {}): LinkState => ({
  hintLetters: 0,
  wrongGuesses: 0,
  revealed: false,
  solved: true,
  value: 100,
  checkedGuesses: [],
  ...patch,
});

const result = (patch: Partial<ChainResult> = {}): ChainResult => ({
  chainId: chains[0].id,
  score: 370,
  stars: 3,
  timeMs: 102_000,
  hintLetters: 1,
  wrongGuesses: 1,
  wordsRevealed: 1,
  wordsSolved: 4,
  links: [link(), link({ hintLetters: 1 }), link(), link({ revealed: true, value: 0 }), link()],
  ...patch,
});

describe('buildShareText', () => {
  it('matches the format in DESIGN_SPEC §4 exactly', () => {
    expect(buildShareText({ title: 'Trunk to Time' }, result(), 4)).toBe(
      'Clue Chains #4 · Trunk to Time\n★★★  370 pts  ⏱ 1:42\n🟩🟨🟩🟥🟩',
    );
  });

  it('shows empty stars for fewer than 3', () => {
    expect(buildShareText({ title: 'T' }, result({ stars: 1 }), 1).split('\n')[1]).toBe('★☆☆  370 pts  ⏱ 1:42');
    expect(buildShareText({ title: 'T' }, result({ stars: 2 }), 1).split('\n')[1]).toBe('★★☆  370 pts  ⏱ 1:42');
  });

  it('formats short and long times as m:ss', () => {
    expect(buildShareText({ title: 'T' }, result({ timeMs: 7_400 }), 1)).toContain('⏱ 0:07');
    expect(buildShareText({ title: 'T' }, result({ timeMs: 754_000 }), 1)).toContain('⏱ 12:34');
  });

  it('marks hints and misses yellow, reveals red, clean solves green', () => {
    const r = result({
      links: [
        link({ hintLetters: 2, wrongGuesses: 3 }),
        link({ revealed: true, hintLetters: 2, value: 0 }),
        link(),
        link({ wrongGuesses: 1 }),
        link({ hintLetters: 1 }),
      ],
    });
    expect(buildShareText({ title: 'T' }, r, 1).split('\n')[2]).toBe('🟨🟥🟩🟨🟨');
  });

  it.each(chains.map((c, i) => [c.id, c, i] as const))('contains no answers or clue text (%s)', (_id, chain, i) => {
    const text = buildShareText(chain, result({ chainId: chain.id }), i + 1).toLowerCase();
    // Strip the title, which is meant to be shared, then look for any answer or clue.
    const body = text.replace(chain.title.toLowerCase(), '');
    for (const l of chain.links) {
      for (const answer of [l.answer, ...(l.accept ?? [])]) {
        expect(body).not.toContain(answer.toLowerCase());
      }
      expect(body).not.toContain(clueText(l.clue).toLowerCase());
    }
    expect(text.split('\n')).toHaveLength(3);
  });
});
