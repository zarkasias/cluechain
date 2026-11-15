# Phase 04 — Recap screen and Share

Read `CLAUDE.md`, `docs/DESIGN_SPEC.md` §4 and `docs/GAME_RULES.md` (scoring, stars, replay rules). Phases 01–03 are done.

## Implement `components/recap/RecapView.tsx`
- Layout as in §4: the "Chain complete!" title, the chain title, stars popping in (120 ms stagger; a static display with reduced motion), and the vertical chain of word pills with connectors and per-link results (✓ value, hints, misses, 👁 0 for revealed).
- Score breakdown: link values, perfect bonus (or "—"), time (m:ss), and the total.
- Badges on a first completion: "Perfect chain!" and "New best time!".
- Buttons: **Next chain** (primary `linkFill`), **Share** (secondary outline), and **Replay** (tertiary text, with the caption "Replays don't change your stats").
- The "All chains complete" end state, per §4.

## Share
- `lib/share.ts`: `buildShareText(chain, result, chainNumber)` returns exactly the format in §4 (🟩 clean, 🟨 hints or misses, 🟥 revealed). Unit-test it, including that **no answers or clue text appear** in the output.
- Native: `Share.share({ message })`. Web: use `navigator.share` if present; otherwise `expo-clipboard` `setStringAsync` (install with `npx expo install expo-clipboard`) and a small toast "Copied!".

## Wiring
- `GameScreen` shows `RecapView` when the chain is complete. **Next chain** dispatches `NEXT_CHAIN`; **Replay** dispatches `REPLAY_CHAIN`.
- A replay shows a small "Replay" tag in the PlayHeader, and the recap shows "Personal best" comparisons instead of the first-completion badges.

## Verify
- Run `npx tsc --noEmit` and `npm test`.
- Check at 390×844 and 360×740 against §4: a perfect run, a run with hints, a reveal and misses, a replay, and the all-complete state. Don't save screenshots to the repo.
- Commit: `phase 04: recap screen and share`.
