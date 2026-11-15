# Phase 07 — Accessibility pass and full QA

You are an accessibility specialist and QA lead. Read `CLAUDE.md`, `docs/DESIGN_SPEC.md` §10 and `docs/UX_REVIEW.md`. All earlier phases are done.

## 1. Accessibility audit and fixes (E3)
Go through every screen and component and fix as you go:
- Roles, labels and hints on every interactive element (§10 list). No unlabelled icons.
- Announcements: feedback outcomes, each new link ("Link 3 of 5. …"), and chain complete with stars and score.
- Touch targets of at least 44×44 (use `hitSlop` where needed).
- Font scaling: test with the largest Dynamic Type / font scale. Nothing is clipped; tiles and slots are capped at 1.3× and the clue at 1.6×; the Play screen stays usable (the content may scroll).
- Contrast: grep for any colour pair not in `theme.ts` and fix it. There are no text-on-gradient cases except the landing title, which sits over the scrim.
- Reduced motion is honoured in the carry-over, shake, pulses, stars, score count-up and tutorial.
- Web: full keyboard play (Enter submits; Tab order per §10; visible focus ring using `color.focus`). Confirm sheets trap focus and close on Escape.

## 2. QA run
Write `docs/QA_CHECKLIST.md`, then execute it. Record pass/fail for each item:
- Every acceptance criterion from phases 01–06.
- Edge cases: a 12-letter answer at 360 wide; a two-word answer with a space; a guess with trailing spaces or caps; rapid double submit; backgrounding mid-animation; killing the app mid-chain and relaunching; corrupt storage; removing a chain that the save points to; finishing the last chain.
- Score math: play one chain with 2 hints, 3 misses and 1 reveal, and check the recap total against `GAME_RULES.md` by hand.
- Run `npx tsc --noEmit`, `npm test`, `npm run validate:chains` and `npm run build:web`, and do a final lint (`npm run lint`).

## 3. Visual QA
Check every screen and state at 390×844 and 360×740 as a designer: spacing rhythm, alignment, type hierarchy, colour consistency. Fix the issues you find. Don't save screenshots to the repo.

## 4. Wrap up
- Update `docs/UX_REVIEW.md` with a "Status" column (Done / Partial / Deferred) for every item.
- Commit: `phase 07: accessibility and QA`.
- Give a final summary for the owner: what shipped, known issues, and suggested next steps (for example, daily chain, sound effects, an app-store icon refresh).
