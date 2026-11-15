// Pure layout maths for LetterTiles (no React Native imports, so it's unit-testable).

export const GAP = 6;
export const WORD_GAP = 16;

/** Tile size = min(max, floor((width − gaps) / letters)) for one row of words. */
export function tileSize(width: number, words: string[], max = 44): number {
  const letters = words.reduce((n, w) => n + w.length, 0);
  if (!letters || width <= 0) return max;
  const gaps = (letters - words.length) * GAP + (words.length - 1) * WORD_GAP;
  return Math.max(MIN_TILE, Math.min(max, Math.floor((width - gaps) / letters)));
}

/** Below this, a single row is hard to read, so the tiles wrap. */
export const READABLE_TILE = 22;
const MIN_TILE = 12;
const MAX_ROWS = 3;

export type TileLayout = { size: number; rows: string[][] };

/** Width of a row of word pieces at tile size `size`. */
function rowWidth(pieces: string[], size: number): number {
  const letters = pieces.reduce((n, p) => n + p.length, 0);
  return letters * size + (letters - pieces.length) * GAP + (pieces.length - 1) * WORD_GAP;
}

/** Splits `word` into `parts` chunks of near-equal length. */
function chunk(word: string, parts: number): string[] {
  const size = Math.ceil(word.length / parts);
  const out: string[] = [];
  for (let i = 0; i < word.length; i += size) out.push(word.slice(i, i + size));
  return out;
}

/**
 * Fills rows greedily at the readable size, breaking at word boundaries. A word
 * too long for one row is split into near-equal chunks, each on its own row.
 */
function wrapRows(width: number, words: string[]): string[][] {
  const perRow = Math.max(1, Math.floor((width + GAP) / (READABLE_TILE + GAP)));
  const rows: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    if (word.length > perRow) {
      if (current.length) rows.push(current);
      current = [];
      for (const piece of chunk(word, Math.ceil(word.length / perRow))) rows.push([piece]);
      continue;
    }
    if (current.length && rowWidth([...current, word], READABLE_TILE) > width) {
      rows.push(current);
      current = [];
    }
    current.push(word);
  }
  if (current.length) rows.push(current);
  return rows;
}

/**
 * The tile size and rows for an answer: one row when the tiles stay readable,
 * otherwise wrapped (at most 3 rows). Exported for tests.
 */
export function tileLayout(width: number, words: string[], max = 44): TileLayout {
  const single = tileSize(width, words, max);
  if (single >= READABLE_TILE || width <= 0 || words.length === 0) return { size: single, rows: [words] };
  let rows = wrapRows(width, words);
  if (rows.length > MAX_ROWS) rows = chunk(words.join(''), MAX_ROWS).map((p) => [p]);
  return { size: Math.min(...rows.map((r) => tileSize(width, r, max))), rows };
}
