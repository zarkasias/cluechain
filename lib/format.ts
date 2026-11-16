import type { Difficulty } from '@/lib/game';
/**
 * A duration as m:ss, or h:mm:ss from an hour up, rounded to the nearest second.
 * 102_000 → "1:42", 725_000 → "12:05", 3_730_000 → "1:02:10".
 */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Display names for chain difficulties. */
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
