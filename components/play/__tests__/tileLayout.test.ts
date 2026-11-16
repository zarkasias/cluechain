import { GAP, READABLE_TILE, tileLayout, WORD_GAP } from '../tileLayout';

// The tile row's width inside the clue card at 360 wide: 360 − 2×16 gutter − 2×24 card padding.
const W360 = 280;

describe('tileLayout', () => {
  it('keeps a short answer on one row at full size', () => {
    expect(tileLayout(W360, ['HEART'])).toEqual({ size: 44, rows: [['HEART']] });
  });

  it('wraps a 12-letter word into two readable rows at 360 wide', () => {
    const { size, rows } = tileLayout(W360, ['ABCDEFGHIJKL']);
    expect(rows).toEqual([['ABCDEF'], ['GHIJKL']]);
    expect(size).toBeGreaterThanOrEqual(READABLE_TILE);
  });

  it('breaks two words at the space', () => {
    const { rows, size } = tileLayout(W360, ['WATERMELON', 'SEEDS']);
    expect(rows).toEqual([['WATERMELON'], ['SEEDS']]);
    expect(size).toBeGreaterThanOrEqual(READABLE_TILE);
  });

  it('fits the 20-letter maximum without overflowing', () => {
    const word = 'ABCDEFGHIJKLMNOPQRST';
    const { size, rows } = tileLayout(W360, [word]);
    expect(rows.flat().join('')).toBe(word);
    for (const row of rows) {
      const letters = row.join('').length;
      const width = letters * size + (letters - row.length) * GAP + (row.length - 1) * WORD_GAP;
      expect(width).toBeLessThanOrEqual(W360);
    }
    expect(size).toBeGreaterThanOrEqual(READABLE_TILE);
  });

  it('keeps ICE CREAM on one row', () => {
    expect(tileLayout(W360, ['ICE', 'CREAM']).rows).toEqual([['ICE', 'CREAM']]);
  });
});

describe('tileLayout with real content', () => {
  it('keeps every answer up to 10 letters on one row at 360 wide', () => {
    for (const word of ['HOURGLASS', 'CHOCOLATE', 'WATERMELON']) {
      expect(tileLayout(W360, [word]).rows).toEqual([[word]]);
    }
  });
});
