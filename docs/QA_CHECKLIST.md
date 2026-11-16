# Clue Chains — QA checklist

Run on 15 November 2026 for phase 07, on branch `ux-overhaul`. Browser checks drove the web export (`npm run build:web`) in headless Chrome through Playwright, at 390×844 and, where marked, 360×740. Each check asserts on visible text, accessibility labels or the saved `cluechain:v2` state. No screenshots are kept in the repo.

**Result: 46 of 46 run items pass. 3 items need a real device and were not run (see the end).**

## Commands

| # | Check | Result |
|---|---|---|
| C1 | `npx tsc --noEmit` | Pass |
| C2 | `npm test`: 10 suites, 99 tests | Pass |
| C3 | `npm run validate:chains`: 3 chains, 0 errors (1 warning: pack difficulty mix, expected until phase 08) | Pass |
| C4 | `npm run build:web` | Pass |
| C5 | `npm run lint`: 0 errors, 0 warnings | Pass |

## Phase acceptance criteria

| # | Phase | Check | Result |
|---|---|---|---|
| P1 | 01 | Answer matching: normalisation, plurals, accepted forms, near-miss rules (unit tests) | Pass |
| P2 | 01 | Scoring per link, 10 floor, perfect bonus, stars (unit tests) | Pass |
| P3 | 01 | Stats only on first completion; replays update personal bests only (unit tests) | Pass |
| P4 | 01 | Save/load, legacy migration, corrupt save → fresh (unit tests) | Pass |
| P5 | 02 | Play screen: wrong guess, near miss, hints fill tiles, Reveal and Restart confirm sheets | Pass |
| P6 | 03 | Carry-over runs and the next link becomes playable; reduced motion skips the flight | Pass |
| P7 | 04 | Recap: stars, per-link results, breakdown, badges, Next / Share / Replay | Pass |
| P8 | 04 | Share text matches the spec format and has no answers (unit test + clipboard) | Pass |
| P9 | 04 | Replay shows the Replay tag and Personal best on the recap; stats unchanged | Pass |
| P10 | 05 | Tutorial steps 1–3; answer appears in the tiles after 2 misses; no time or stats recorded (390 and 360) | Pass |
| P11 | 05 | Skip and "Let's play" go to chain 1; the tutorial never shows twice (390 and 360) | Pass |
| P12 | 05 | Guide "Replay tutorial" shows it again (390 and 360) | Pass |
| P13 | 05 | Landing "Continue chain 2" resumes at link 3; Back doesn't return to the landing | Pass |
| P14 | 06 | Stats hero, cards, average time, history newest first (390 and 360) | Pass |
| P15 | 06 | Streak shows 0 after a gap; the saved streak is not changed | Pass |
| P16 | 06 | History replay warns about unfinished progress, starts the replay on Play, stats unchanged (390 and 360) | Pass |
| P17 | 06 | Empty state (390 and 360) | Pass |

## Accessibility (§10)

| # | Check | Result |
|---|---|---|
| A1 | Every touchable has a role and label (audit of all `Pressable`s) | Pass |
| A2 | Wrong-guess feedback is in a polite live region | Pass |
| A3 | New link announced: "Link 2 of 5. An ELEPHANT never forgets…" | Pass (fixed: see note 1) |
| A4 | Chain complete announced with stars, score and time | Pass (fixed: see note 1) |
| A5 | Tile row has one label ("Answer, 12 letters."), tiles aren't individually focusable | Pass |
| A6 | Touch targets ≥ 44×44 (code audit: buttons 44–56 high; Skip and Replay use min sizes and `hitSlop`) | Pass |
| A7 | Contrast: no hard-coded colours in components; legacy `Colors.ts` removed; not-found screen fixed (was default black on navy) | Pass (fixed) |
| A8 | Reduced motion: a full chain plays to the recap with no flight; stars, count-up, shake, pulses, glow, sheets, toast and tutorial all check `useReduceMotion` | Pass |
| A9 | Font-scale caps in code: tiles and slots 1.3×, clue 1.6× | Pass |

## Web keyboard

| # | Check | Result |
|---|---|---|
| K1 | Tab order: input → submit → hint → reveal → restart | Pass |
| K2 | Visible focus ring in `color.focus` | Pass (added) |
| K3 | Enter submits | Pass |
| K4 | Confirm sheet traps focus; Escape closes it | Pass |

## Edge cases

| # | Check | Result |
|---|---|---|
| E1 | 12-letter answer at 360 wide: tiles wrap to 2 rows inside the card (temporary QA chain, not committed) | Pass (fixed: see note 2) |
| E2 | Two-word answer "Olympic Games " (caps, space, trailing space) accepted | Pass |
| E3 | "  ELEPHANT  " accepted | Pass |
| E4 | Rapid repeated Enter after a correct answer counts once; no miss on the next link | Pass |
| E5 | Backgrounding mid-animation jumps to the end state; play continues normally | Pass |
| E6 | Reload mid-chain resumes at the same link; landing offers "Continue chain 1" | Pass |
| E7 | Corrupt storage → fresh start (tutorial, then chain 1), no crash | Pass |
| E8 | Save points to a removed chain → first unfinished chain | Pass |
| E9 | Last chain → recap → Next → "You finished every chain!" → History | Pass |

## Letter check (phase 09)

Run in the web build with Playwright (no screenshots kept).

| # | Check | Result |
|---|---|---|
| L1 | Same-length wrong guess: row appears with correct marks; copy "Not quite — {n} right, {m} elsewhere." | Pass |
| L2 | Different-length guess: "Not quite — the answer has {N} letters.", no row | Pass |
| L3 | No letters match: "No letters match — try another word." | Pass |
| L4 | Same-length near miss: "So close!" copy, row added, no penalty | Pass |
| L5 | Repeated letters (KITTEN/TITLES, HONEY/HOOPS) | Pass (unit tests) |
| L6 | At most 3 rows; the oldest drops off | Pass |
| L7 | Rows survive a reload mid-link and clear on solve, Reveal and Restart | Pass (reload in browser; Reveal and Restart in unit tests) |
| L8 | Save from before phase 09 (no `checkedGuesses`) loads without error | Pass (unit test) |
| L9 | Row label and live-region detail ("Your guess ANTELOPE. Elsewhere: …") | Pass (DOM) |
| L10 | 9-letter answer with 3 rows at 390×844, 430×932 and 360×740: rows inside the card, no horizontal scroll | Pass |
| L11 | Compact card (360×560): newest row only | Pass |
| L12 | 12-letter answer at 360×740 and 320×640 (temporary QA chain, not committed): rows inside the card, input above the tab bar | Pass (fixed: see note 4) |
| L13 | Guide shows the Letter check section with the TITLES example | Pass |

## Score math (by hand against `GAME_RULES.md`)

Chain 1 played with 2 hints, 3 misses and 1 reveal:

| Link | Play | Value |
|---|---|---|
| 1 ELEPHANT | 2 hint letters | 100 − 2×20 = 60 |
| 2 BRAIN | 3 wrong guesses | 100 − 3×10 = 70 |
| 3 HEART | Revealed | 0 |
| 4 GLASS | Clean | 100 |
| 5 HOURGLASS | Clean | 100 |
| Perfect bonus | Hints and a reveal were used | 0 |
| **Total** | | **330**, 1 star (a reveal rules out ★★) |

| # | Check | Result |
|---|---|---|
| S1 | Recap shows 330 points and 1 of 3 stars | Pass |
| S2 | Stats: 330 points, 2 hints, 1 word revealed, 4 words solved | Pass |

## Not run (needs a real device)

| # | Check | Why |
|---|---|---|
| D1 | Largest Dynamic Type / Android font scale: nothing clipped, Play screen usable | React Native Web ignores OS font scaling. The caps (A9) are in place, but this needs an iOS and an Android check. |
| D2 | VoiceOver / TalkBack read-through of every screen | Needs a device. Labels, roles and announcements were checked in the DOM. Use the script in "Device check: VoiceOver / TalkBack" below. |
| D3 | Haptics on wrong / near / correct | Haptics are a no-op on web by design. Covered by V14 below. |

## Device check: VoiceOver / TalkBack

Run this in Expo Go on a real phone, once on iOS (VoiceOver) and once on Android (TalkBack). Fill in the Result columns. For anything that fails, note what you heard and on which screen.

### Setup (do this first)

Screen readers change how every tap works, so set up the on/off shortcut **before** turning one on.

- **iPhone:** go to Settings → Accessibility → Accessibility Shortcut and choose VoiceOver. After that, **triple-click the side button** to turn VoiceOver on or off.
- **Android:** go to Settings → Accessibility → TalkBack and turn on the TalkBack shortcut. After that, **hold both volume keys for about 3 seconds** to turn TalkBack on or off.
- To start from a fresh game, clear Expo Go's storage for the app, or use Restart on the Play screen.

### Gestures

| Action | VoiceOver | TalkBack |
|---|---|---|
| Hear an item | tap it once | tap it once |
| Next / previous item | swipe right / left | swipe right / left |
| Activate (press) | double-tap anywhere | double-tap anywhere |
| Read the whole screen | two-finger swipe up | swipe down then right, then "Read from top" |
| Scroll | three-finger swipe | two-finger swipe |
| Stop talking | two-finger tap | tap with one finger |

**Typing:** double-tap the answer box to focus it. Then slide your finger across the keyboard and **lift your finger to type** the letter under it. Press Return/Go, or swipe to "Submit answer" and double-tap.

### Script

The examples use chain 1, "Trunk to Time" (answers: elephant, brain, heart, glass, hourglass).

| # | Do | Expect to hear | iOS | Android |
|---|---|---|---|---|
| V1 | Open the app (landing page) | "Clue Chains", heading; then the "Play" button (or "Continue chain N, link X of 5") | | |
| V2 | Activate Play, then swipe right from the top of the Play screen | In order: "Chain 1 of 33, Easy" (heading) · "Chain score 0 points" · "Chain progress: 0 of 5 solved" · the clue as one sentence · "Answer, 8 letters" · "Your answer" · "Submit answer" · "Hint, costs 20 points" · "Reveal word". **No chain title anywhere.** | | |
| V3 | Listen to the clue on link 2 or later | The pink word is read as a normal word inside the sentence, not spelled out or read separately | | |
| V4 | Type `antelope` and submit | "Not quite — 0 right, 7 elsewhere." then "Your guess ANTELOPE. Elsewhere: A, N, T, E, L, P, E. Not in the word: O." | | |
| V5 | Swipe to the new guess row | The row is one item with the same "Your guess ANTELOPE…" label; individual tiles aren't focusable | | |
| V6 | Type `cat` and submit | "Not quite — the answer has 8 letters." and no new row | | |
| V7 | Type `elephanf` and submit | "So close! Check your spelling." then "Your guess ELEPHANF. Right: E in spot 1, …" | | |
| V8 | Activate Hint | "Hint used: −20"; the tiles now read "Answer, 8 letters. Revealed: E" | | |
| V9 | Type `elephant` and submit | "Nice! ELEPHANT joins the chain." then "Link 2 of 5. An elephant never forgets — thanks to this organ". Focus returns to the answer box. | | |
| V10 | Activate Reveal word | The sheet is announced ("Reveal this word? You'll score 0 for this link."); Cancel and Reveal are both reachable; Cancel closes it | | |
| V11 | Finish the chain | "Chain complete. N of 3 stars. N points. Time m:ss." The recap shows the title "Trunk to Time". | | |
| V12 | On the recap, activate Share | Label "Share your result. Answers aren't included."; then the share sheet opens, or "Copied!" is announced | | |
| V13 | Guide and Stats tabs: read the whole screen | Headings and text in order; the example illustrations are silent (not read as stray letters); every button is reachable | | |
| V14 | Screen reader **off**: a wrong guess, a near miss, a correct answer | Haptics: a buzz for wrong, a light tap for "So close!", a success pulse for correct | | |

## Notes on fixes made during QA

1. **Announcements on web.** React Native Web's `AccessibilityInfo.announceForAccessibility` is a no-op, so link changes, chain complete, tutorial steps and "Copied!" were never announced on web. `lib/announce.ts` now uses the native API on iOS and Android, and a hidden `aria-live` region on web.
2. **Long answers.** Content allows answers of up to 20 letters, but tiles only shrank to 12 px: a 12-letter answer got 17 px tiles at 360 wide, and a 20-letter one overflowed the card. Tiles now wrap onto up to 3 rows (at word boundaries when possible) when one row would drop below 22 px (`components/play/tileLayout.ts`, unit-tested). Answers up to 10 letters stay on one row.
3. **Lint.** ESLint (`eslint-config-expo`) is now set up and clean. Fixes covered a ref written during render, `Date.now()` during render, effect-driven state in the toast, sheet and tiles, and shared values now use `.set()`. The two effects that turn the reducer's verdict into feedback keep a documented `eslint-disable`.
4. **Long answers with letter check.** With a 12-letter answer at 360 wide, each guess wraps onto two lines, and 3 guesses pushed the answer input under the tab bar. When a guess has to wrap, only the newest row is shown now (`components/play/GuessRows.tsx`, DESIGN_SPEC §2.4).
