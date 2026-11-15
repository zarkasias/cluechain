# Phase 03 — The carry-over animation (signature moment)

Read `CLAUDE.md` and `docs/DESIGN_SPEC.md` §3. Phases 01–02 are done.

The moment a player solves a link, they should *see* their answer travel into the chain and become part of the next clue. This is the most important piece of motion in the game. Make it feel great at 60 fps.

## Implement
- `components/play/CarryOverLayer.tsx`: an absolutely positioned overlay, above the screen content, that renders the flying "ghost" word chip.
- Measure the source (the LetterTiles row) and the target (the current ChainTrack slot) in window coordinates. Use `measure()` via Reanimated `useAnimatedRef` or `onLayout` + `measureInWindow`. Account for the ChainTrack's horizontal scroll offset: scroll the target slot into view **before** measuring.
- Follow the timeline in §3 exactly (0 / 350 / 750 / 950 ms). Drive it with Reanimated shared values (`withTiming`, `withDelay`, `withSequence`). Call JS callbacks with `runOnJS`.
- Block input while it runs: no submit, hint or reveal. The reducer's state is already correct; the animation is presentation only. If the app goes to the background mid-animation, jump to the end state.
- The score pill `+N` float and the slot fill happen at 750 ms. The new clue's LinkChip pulses after the crossfade.
- The Reveal flow reuses the same animation, with an outlined/muted ghost chip and the slot shown in its revealed state.
- On link 5: run up to the slot fill, hold 400 ms, then go to the completion view.

## Reduced motion
`useReducedMotion()` true → no flight, pulse or shake; a 150 ms crossfade only. Haptics still fire. Add a `settings.reduceMotion` override as well (default: follow the system).

## Web
On web, the ghost chip uses the same code. Confirm it works in Chrome at 390×844. If `measure()` is unreliable on web, fall back to `getBoundingClientRect` through `onLayout` + `measureInWindow`.

## Verify
- Run `npx tsc --noEmit` and `npm test`.
- Check that the chip travels from the tiles to the correct slot, for link 1→2 and for link 4→5 (when the track has scrolled). Don't save screenshots to the repo.
- Commit: `phase 03: carry-over animation`.
