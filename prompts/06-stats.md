# Phase 06 — Stats and history

Read `CLAUDE.md`, `docs/DESIGN_SPEC.md` §8 and `docs/GAME_RULES.md` (Stats, streak, replay). Phases 01–05 are done.

## Implement
- Rewrite `app/(tabs)/stats.tsx`:
  - Hero row: Current streak (with best streak as a caption), Chains completed / total, Perfect chains.
  - A 2-column card grid: Total points, Best time, Average time (`totalTimeMs / chainsCompleted`, "—" if 0), Words solved, Hints used, Words revealed.
  - History: a list of completed chains, newest first, with title, difficulty chip, stars, best score and best time. Tapping a row opens a ConfirmSheet "Replay {title}?" → dispatch `REPLAY_CHAIN` and switch to the Play tab.
  - The empty state, per spec.
- Streak display: if `lastPlayedDay` is before yesterday, show the current streak as 0 (compute it at display time; don't mutate saved data).
- `lib/format.ts`: `formatDuration(ms)` → "1:42" / "12:05" / "1:02:10". Add unit tests.
- Use tokens only. Cards use `card` / `cardInk`. Lucide icons: Flame, Link, Star, Trophy, Timer, Lightbulb, Eye.

## Verify
- Run `npx tsc --noEmit` and `npm test`. Add a test that the streak display is 0 after a gap.
- Seed storage with a test save (3 completed chains, one perfect, a streak of 2) and check the Stats tab, and also the empty state. Don't save screenshots to the repo.
- Commit: `phase 06: stats and history`.
