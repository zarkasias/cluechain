import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { Chain, ChainResult, LinkState } from '@/lib/game';
import { DIFFICULTY_LABEL, formatDuration } from '@/lib/format';

/** 🟩 clean solve · 🟨 solved with hints or misses · 🟥 revealed. */
export function linkSquare(link: LinkState): string {
  if (link.revealed) return '🟥';
  if (link.hintLetters > 0 || link.wrongGuesses > 0) return '🟨';
  return '🟩';
}

/**
 * The spoiler-free share text (DESIGN_SPEC §4). It never contains an answer,
 * any clue text or the chain title (titles name the first and last answers),
 * only the chain number, difficulty, stars, score, time and squares.
 *
 *   Clue Chains #4 · Easy
 *   ★★★  370 pts  ⏱ 1:42
 *   🟩🟨🟩🟥🟩
 */
export function buildShareText(chain: Pick<Chain, 'difficulty'>, result: ChainResult, chainNumber: number): string {
  const stars = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
  return [
    `Clue Chains #${chainNumber} · ${DIFFICULTY_LABEL[chain.difficulty]}`,
    `${stars}  ${result.score} pts  ⏱ ${formatDuration(result.timeMs)}`,
    result.links.map(linkSquare).join(''),
  ].join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'dismissed' | 'failed';

type WebNavigator = { share?: (data: { text: string }) => Promise<void> };

/**
 * Native: the system share sheet. Web: `navigator.share` when the browser has
 * it, otherwise copy to the clipboard (the caller shows "Copied!").
 */
export async function shareText(message: string): Promise<ShareOutcome> {
  if (Platform.OS !== 'web') {
    try {
      const r = await Share.share({ message });
      return r.action === Share.dismissedAction ? 'dismissed' : 'shared';
    } catch {
      return 'failed';
    }
  }

  const nav = (globalThis as { navigator?: WebNavigator }).navigator;
  if (nav?.share) {
    try {
      await nav.share({ text: message });
      return 'shared';
    } catch (e) {
      // The user closed the sheet; anything else falls through to the clipboard.
      if (e instanceof Error && e.name === 'AbortError') return 'dismissed';
    }
  }
  try {
    await Clipboard.setStringAsync(message);
    return 'copied';
  } catch {
    return 'failed';
  }
}
