import { AccessibilityInfo, Platform } from 'react-native';

let region: HTMLElement | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

/** A visually hidden polite live region, created once (web only). */
function webRegion(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (region && document.body.contains(region)) return region;
  region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('data-testid', 'announcer');
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });
  document.body.appendChild(region);
  return region;
}

/**
 * Announce a message to screen readers. React Native Web's
 * `AccessibilityInfo.announceForAccessibility` is a no-op, so on web this
 * writes to a hidden live region instead.
 */
export function announce(message: string) {
  if (!message) return;
  if (Platform.OS !== 'web') {
    AccessibilityInfo.announceForAccessibility(message);
    return;
  }
  const el = webRegion();
  if (!el) return;
  // Clear first so repeating the same text is announced again.
  el.textContent = '';
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    el.textContent = message;
  }, 50);
}
