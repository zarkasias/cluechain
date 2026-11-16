# Phase 09 — Letter check (Wordle-style feedback)

Read `CLAUDE.md`, `docs/proposals/letter-check.md`, the "Letter check" section of `docs/GAME_RULES.md`, and `docs/DESIGN_SPEC.md` §1, §2.4 (Guess rows), §2.6, §7 and §10.

## Task
When a wrong guess has the same length as the answer, mark each letter right / elsewhere / absent and show the guess as a row of tiles in the ClueCard.

## Steps
1. `lib/game/letters.ts`: `checkLetters(guess, link)`, plus unit tests for the worked examples in GAME_RULES, all-absent, an anagram (all elsewhere) and a multi-word answer.
2. `LinkState.checkedGuesses` (the last 3, normalized). Reducer: append on a checked wrong guess or near miss; a repeat moves to the end; clear on solve, Reveal and Restart. Hydrate loads a missing or malformed value as `[]` (test it with an old save).
3. Tokens `successDeep`, `elsewhere`, `elsewhereSoft` in `constants/theme.ts`.
4. `components/play/GuessRows.tsx`: tile states, markers, flip-in with stagger, reduced motion, one accessible label per row. Compact cards show the newest row only.
5. Feedback copy (§2.6) and announcing the row label after the feedback line (§10). The tutorial is unchanged.
6. Guide: a "Letter check" section with a KITTEN / TITLES example.
7. `docs/QA_CHECKLIST.md`: add letter-check items.

## Done when
- [ ] `npx tsc --noEmit`, `npm test` and `npm run validate:chains` pass.
- [ ] In the web build: checked rows render with the right marks, different-length guesses show the length copy, rows clear on solve, rows survive a reload mid-link, and a 12-letter answer with 3 rows fits at 360 px wide.
- [ ] Commit: `phase 09: letter check`.
