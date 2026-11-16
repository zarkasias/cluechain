export type ClueSegment = { text: string; isLink: boolean };

const MARKER = /\{([^{}]*)\}/g;

/**
 * Splits a clue on `{…}` markers. Marker text becomes an `isLink` segment with
 * the braces removed. Capital letters alone never mark a link.
 */
export function parseClue(clue: string): ClueSegment[] {
  const segments: ClueSegment[] = [];
  let last = 0;
  for (const match of clue.matchAll(MARKER)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: clue.slice(last, start), isLink: false });
    segments.push({ text: match[1], isLink: true });
    last = start + match[0].length;
  }
  if (last < clue.length) segments.push({ text: clue.slice(last), isLink: false });
  return segments;
}

/** The marker texts in a clue, without braces. */
export function clueMarkers(clue: string): string[] {
  return parseClue(clue)
    .filter((s) => s.isLink)
    .map((s) => s.text);
}

/** The clue as the player reads it (braces removed). */
export function clueText(clue: string): string {
  return parseClue(clue)
    .map((s) => s.text)
    .join('');
}
