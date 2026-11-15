# Phase 02 — The new Play screen

You are a senior product designer and React Native engineer pairing on **Clue Chains**. Read `CLAUDE.md` and `docs/DESIGN_SPEC.md` (§1, §2 and §9 especially). Skim `docs/GAME_RULES.md`. Phase 01 is done, so the game logic lives in `lib/game` and you should **not change game rules here**.

Goal: rebuild the Play tab to match `DESIGN_SPEC.md` §2. The carry-over animation is phase 03; for now, link changes can use a simple 150 ms crossfade.

## Build these components (one file each in `components/play/`)
1. `PlayHeader`: chain number/total, difficulty, title, and the score pill with the `+N` float-up and count-up (§2.1).
2. `ChainTrack`: 5 slots in solved, revealed, current and future states, connectors, horizontal auto-scroll and one accessibility label (§2.2). It replaces `components/WordChain.tsx`; delete the old file.
3. `ClueCard`: a solid card, the `LINK n OF 5` label, the clue rendered with `parseClue` and inline `LinkChip`s, and a chip pulse on mount (§2.3). It replaces `ClueDisplay`.
4. `LetterTiles`: sizing formula, multi-word gaps, empty/hinted/correct states, and a flip-in for a newly hinted tile (§2.4).
5. `AnswerInput`: restyle per §2.5. Keep the keyboard up between links. Focus on new links on **all** platforms.
6. `FeedbackLine`: a fixed-height line with the copy table, live region and announcements (§2.6). It clears on input change (dispatch `CLEAR_FEEDBACK`).
7. `ActionBar`: Hint (shows its cost), Reveal and Restart, plus a reusable `ConfirmSheet` component (RN `Modal`, slide-up, scrim) for Reveal and Restart (§2.7).
8. `lib/haptics.ts`: wraps `expo-haptics` (`success`, `error`, `light`, `selection`). It's a no-op on web or when `settings.haptics` is false.

## Screen assembly
- `components/GameScreen.tsx` composes the parts in the §2 order using safe-area insets and `useBottomTabBarHeight()`. Remove all hard-coded platform paddings and the big "ClueChain" title.
- Adopt `constants/theme.ts` tokens everywhere on this screen. **No gradients and no raw hex values.** Remove `GradientView` if nothing uses it any more.
- Update the tab bar to §9.
- Keep a placeholder completion view (the existing "Chain complete" card, restyled with tokens). The real recap is phase 04.

## Design quality bar
- Check the layout at 360×740, 390×844 and 430×932, plus a tablet width (the content max-width is 560, centred).
- With the keyboard open on a 360×740 screen, the clue, tiles, feedback and input must all be visible without scrolling.
- 12-letter answers must fit in the tiles at 360 wide.
- Text never sits on a gradient. Use only the colour pairs from §1.

## Verify
- Run `npx tsc --noEmit`, `npm test` and `npm run build:web`.
- Serve `dist/` and take screenshots at 390×844 (use Playwright if it's available; otherwise describe what you checked): link 1, a wrong guess, a near miss, 2 hints, link 3 mid-chain, the Reveal confirm sheet, and the Restart confirm sheet. Save them to `docs/screenshots/phase-02/` and look at them critically against the spec. Fix anything that doesn't match before you finish.
- Commit: `phase 02: new play screen (chain track, clue card, tiles, feedback, actions)`.

Finish with a summary and any spec deviations.
