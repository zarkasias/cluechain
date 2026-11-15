import type { TextStyle } from 'react-native';

// Design tokens from docs/DESIGN_SPEC.md §1.

export const color = {
  bg: '#15233D', // app background (existing primary)
  bgDeep: '#0E1830', // tab bar, recap backdrop
  card: '#FFFFFF', // clue card (solid — no gradient)
  cardInk: '#14213D', // text on card            (16.0:1 on card)
  cardMuted: '#5B6478', // labels on card          (5.9:1 on card)
  ink: '#F8FAFC', // text on bg              (15.0:1 on bg)
  inkMuted: '#A9B4CC', // secondary text on bg    (7.5:1 on bg)
  link: '#EC4899', // pink accent: borders, connectors, icons, glow (NOT a fill behind small white text — only 3.5:1)
  linkFill: '#DB2777', // pink fill behind white text: solved slots, primary buttons, submit (4.6:1)
  linkDeep: '#BE185D', // chip text on linkSoft (5.1:1), pressed states
  linkSoft: '#FCE7F3', // chip background on card
  gold: '#F59E0B', // score, stars
  goldSoft: '#FEF3C7',
  success: '#10B981',
  successSoft: '#D1FAE5',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
  tile: '#EEF1F7', // empty letter tile
  tileBorder: '#C9D1E3',
  slotEmpty: '#24375C', // future chain slot on bg
  focus: '#60A5FA',
  // Not in DESIGN_SPEC §1's table, but named in the spec text (§2.3 shadow, §2.7 scrim, §9 tab border).
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.25)',
  scrim: 'rgba(0,0,0,0.5)',
  scrimStrong: 'rgba(14,24,48,0.82)', // tutorial dim (bgDeep at 82%)
  landingScrim: 'rgba(14,24,48,0.85)', // §6 landing gradient end
  transparent: 'rgba(14,24,48,0)', // §6 landing gradient start
  hairline: 'rgba(255,255,255,0.06)',
} as const;

/** Content max width (tablet / web), centred. */
export const layout = { maxWidth: 560, gutter: 16 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const type = {
  display: { fontFamily: 'Play-Bold', fontSize: 28, lineHeight: 34 },
  title: { fontFamily: 'Play-Bold', fontSize: 22, lineHeight: 28 },
  clue: { fontSize: 22, lineHeight: 30, fontWeight: '600' }, // system font for readability
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  tile: { fontFamily: 'Play-Bold', fontSize: 22 },
} satisfies Record<string, TextStyle>;

export const motion = { fast: 150, base: 250, slow: 450, spring: { damping: 16, stiffness: 180 } } as const;
