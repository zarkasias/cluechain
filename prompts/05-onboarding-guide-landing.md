# Phase 05 — Onboarding tutorial, Guide tab and landing page

Read `CLAUDE.md` and `docs/DESIGN_SPEC.md` §5, §6 and §7. Phases 01–04 are done.

## 1. First-run tutorial (§5)
- Add a built-in demo chain in `data/tutorial.ts` (2 links: banana → ice cream, exactly as in the spec). It isn't part of `chains` and never touches stats or history.
- `components/tutorial/CoachMark.tsx`: a dimmed overlay with a cut-out highlight around a measured target, a speech bubble (title + one sentence), step dots, and a "Skip" link. Reuse the real Play components (ClueCard, LetterTiles, AnswerInput, ChainTrack) in a tutorial mode so the player learns the real UI.
- Flow: steps 1→3 as in the spec. After 2 wrong attempts on a tutorial link, the tiles show the answer as a hint. "Let's play" or "Skip" dispatches `COMPLETE_TUTORIAL` and starts the first unfinished chain.
- It shows automatically only when `settings.seenTutorial` is false.

## 2. Guide tab (§7)
- Rewrite `app/(tabs)/how-to-play.tsx` with the 3 numbered steps, each with a mini illustration built from real components at a small scale. Add the Scoring and Stars sections and a **Replay tutorial** button.
- Remove `assets/images/example.jpg` if nothing else uses it.
- Copy must match `GAME_RULES.md` numbers exactly. Import the constants from `lib/game/scoring.ts` instead of hard-coding them.

## 3. Landing page (§6)
- Add the scrim gradient, the lower-third layout, the tagline "Every answer is the next clue.", the **Play** button, and the "Continue chain {n}" button when progress exists.
- Use `router.replace` into tabs. Use `useWindowDimensions` instead of `Dimensions.get` at module load.

## Verify
- Run `npx tsc --noEmit` and `npm test`.
- Clear storage (on web, `localStorage.clear()`), then check the landing page (fresh and with progress), each tutorial step, and the Guide tab. Confirm Skip works and the tutorial never shows twice. Don't save screenshots to the repo.
- Commit: `phase 05: onboarding, guide, landing`.
