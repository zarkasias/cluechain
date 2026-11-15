import type { Link } from './types';

/**
 * Lowercase, strip diacritics, and drop everything that isn't a–z or 0–9.
 * "Hour-glass " → "hourglass", "Café" → "cafe".
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const PLURAL_MIN_LENGTH = 4;

/**
 * True when the normalized `candidate` equals the normalized `form`, or is a
 * simple plural/singular of it (only for forms of at least 4 letters).
 */
export function matchesForm(candidate: string, form: string): boolean {
  const c = normalize(candidate);
  const f = normalize(form);
  if (!c || !f) return false;
  if (c === f) return true;
  if (f.length < PLURAL_MIN_LENGTH) return false;
  return (
    c === f + 's' ||
    c === f + 'es' ||
    (f.endsWith('es') && c === f.slice(0, -2)) ||
    (f.endsWith('s') && c === f.slice(0, -1))
  );
}

function forms(link: Link): string[] {
  return [link.answer, ...(link.accept ?? [])];
}

export function isCorrect(guess: string, link: Link): boolean {
  if (!normalize(guess)) return false;
  return forms(link).some((form) => matchesForm(guess, form));
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

export function isNearMiss(guess: string, link: Link): boolean {
  const g = normalize(guess);
  if (!g || isCorrect(guess, link)) return false;
  return forms(link).some((form) => {
    const f = normalize(form);
    return f.length >= PLURAL_MIN_LENGTH && levenshtein(g, f) === 1;
  });
}

/** The letters shown in the tiles: the normalized canonical answer, uppercased. */
export function answerLetters(link: Link): string {
  return normalize(link.answer).toUpperCase();
}

/** The canonical answer split into words of tile letters: "ice cream" → ["ICE", "CREAM"]. */
export function answerWords(link: Link): string[] {
  return link.answer
    .split(/\s+/)
    .map((w) => normalize(w).toUpperCase())
    .filter(Boolean);
}

/** The most hint letters a link allows: every letter but the last. */
export function maxHintLetters(link: Link): number {
  return Math.max(0, answerLetters(link).length - 1);
}
