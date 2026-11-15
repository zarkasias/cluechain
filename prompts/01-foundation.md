# Phase 01 — Foundation: content format, game logic, persistence, bug fixes, cleanup

You are a senior React Native / Expo engineer working on **Clue Chains**. Read `CLAUDE.md`, `docs/UX_REVIEW.md`, `docs/GAME_RULES.md` and `docs/CONTENT_FORMAT.md` first.

This phase makes the game *correct* and builds the foundation for the redesign. **Don't redesign the UI yet** (that's phase 02): keep the existing screens working on top of the new logic.

## 0. Setup
- Run `git checkout -b ux-overhaul` (or check it out if it exists). The only uncommitted changes should be the new `CLAUDE.md`, `docs/` and `prompts/`. Commit them first as `docs: review, specs and implementation prompts`. If anything else is uncommitted, stop and ask.
- Run `npm install`, then confirm `npx tsc --noEmit` and `npm run build:web` work before you change anything. Note any pre-existing errors.

## 1. Content format (E1)
1. Create `data/chains/pack-01-classic.json` with exactly this content (the 3 original chains, fixed):

```json
[
  { "id": "classic-01", "title": "Trunk to Time", "difficulty": "easy", "theme": "animals",
    "links": [
      { "clue": "Large gray animal with a trunk", "answer": "elephant" },
      { "clue": "An {ELEPHANT} never forgets — thanks to this organ", "answer": "brain" },
      { "clue": "The {BRAIN} sends signals to this organ that pumps blood", "answer": "heart" },
      { "clue": "A broken {HEART} can mend, but this see-through material shatters for good", "answer": "glass" },
      { "clue": "Sand trickles through two bulbs of {GLASS} in this old timer", "answer": "hourglass", "accept": ["hour glass", "sand timer", "egg timer"] }
    ] },
  { "id": "classic-02", "title": "Snow to Saddle", "difficulty": "easy", "theme": "outdoors",
    "links": [
      { "clue": "Fluffy white flakes that fall in winter", "answer": "snow", "accept": ["snowflake"] },
      { "clue": "{SNOW} melts when this bright star comes out", "answer": "sun" },
      { "clue": "The {SUN} sets in this direction", "answer": "west" },
      { "clue": "Cowboys of the Wild {WEST} rode these animals", "answer": "horse" },
      { "clue": "You sit on this leather seat when riding a {HORSE}", "answer": "saddle" }
    ] },
  { "id": "classic-03", "title": "Cocoa to Chords", "difficulty": "medium", "theme": "music",
    "links": [
      { "clue": "Sweet treat made from cocoa beans", "answer": "chocolate" },
      { "clue": "Melted {CHOCOLATE} is drizzled over a split made with this yellow fruit", "answer": "banana" },
      { "clue": "{BANANA}-yellow, this little bird is famous for singing", "answer": "canary" },
      { "clue": "A {CANARY} sings along while you strum this six-stringed instrument", "answer": "guitar" },
      { "clue": "Strum a {GUITAR} and you play these, like C, G and D", "answer": "chords", "accept": ["chord"] }
    ] }
]
```

2. Create `data/chains/index.ts` that imports the pack JSON files in order and exports `chains: Chain[]` (with types from `lib/game/types.ts`). Enable `resolveJsonModule` in `tsconfig.json` if needed.
3. Delete `data/wordChains.ts` once nothing imports it.

## 2. Pure game logic in `lib/game/` (E2)
No React or React Native imports in this folder.
- `types.ts`: `Chain`, `Link`, `Difficulty`, `LinkState`, `GameState`, `Stats`, `SaveV2`, `GameAction`.
- `clue.ts`: `parseClue(clue): Array<{ text: string; isLink: boolean }>`, which splits on `{…}` and strips the braces. **This fixes B1.**
- `answers.ts`: `normalize`, `isCorrect`, `isNearMiss`, exactly as in `GAME_RULES.md`. **This fixes B4.**
- `scoring.ts`: link value rules, `chainScore`, `stars`. **This fixes B2.**
- `stats.ts`: `applyFirstCompletion(stats, result, todayISO)`, including the streak logic.
- `reducer.ts`: actions `SUBMIT_GUESS {guess}` (returns the outcome in state: `lastOutcome: 'correct'|'near'|'wrong'|null`), `CLEAR_FEEDBACK`, `HINT`, `REVEAL`, `RESTART`, `NEXT_CHAIN`, `REPLAY_CHAIN {id}`, `TICK {ms}`, `HYDRATE {save}`, `COMPLETE_TUTORIAL`. The reducer is the **only** place answers are checked.
- `storage.ts`: `loadSave()`, `saveGame(state)` (debounced), migration from the legacy `gameStats` key, and safe fallback on corrupt data. **This fixes B5.**
- Time is tracked in the reducer from `TICK`s sent by the provider (a 1 s interval while the Play tab is focused and the app is active). Record `bestTimeMs` on first completion. **This fixes B3.**

## 3. Tests
- Install with `npx expo install jest-expo jest @types/jest -- --save-dev`. Add `"test": "jest"` and the `"jest": { "preset": "jest-expo" }` config to `package.json`.
- Write tests in `lib/game/__tests__/` for at least:
  - normalize, plurals, accept list, near miss, empty input ignored
  - parseClue: markers, a clue with no marker, the first letter is NOT highlighted (regression test for B1)
  - Scoring: the per-link floor, hints on link 1 cost points (regression test for B2), reveal = 0, perfect bonus, stars
  - Stats: replaying a completed chain doesn't change stats (regression test for B2); streak same day / next day / gap
  - Storage: migration from legacy `gameStats`; corrupt JSON → fresh save
  - Reducer: a full 5-link playthrough reaches complete; NEXT_CHAIN picks the first unfinished chain

## 4. Validator
- Add `scripts/validate-chains.ts` implementing every error and warning in `docs/CONTENT_FORMAT.md`. It reuses `normalize` and `parseClue` from `lib/game`.
- Add `scripts/watchlist.txt` with a short list of words to flag for family-friendliness review.
- Add the script `"validate:chains": "tsx scripts/validate-chains.ts"` (install `tsx` as a dev dependency). It must pass on pack-01.

## 5. Wire up the existing UI (minimal changes)
- Rewrite `context/GameContext.tsx` as a thin provider: `useReducer(reducer)`, hydrate from storage before rendering (keep the splash screen up via `expo-splash-screen` until both fonts and the save are loaded), autosave, and the tick interval.
- Update `GameScreen`, `ClueDisplay`, `AnswerInput` and `WordChain` to use the new state and actions. `ClueDisplay` uses `parseClue`. Remove the duplicated answer check from `GameScreen`.
- **B6:** add `minWidth: 0` to the TextInput style and `flexShrink: 0` to the submit button container.
- **B7:** replace the How to Play "Objective" copy with: "Solve the clue. Your answer becomes part of the next clue. Link five answers to complete the chain." (The full Guide redesign is in phase 05.)
- Stats screen: read the new `Stats` shape; show Best Time from `bestTimeMs`.

## 6. Cleanup (E2)
- Before removing anything, `grep` to confirm it's unused. Expected to be unused: `expo-camera`, `expo-blur`, `react-native-webview`, `react-native-linear-gradient`, `react-native-vector-icons`, `@lucide/lab`, `react-native-url-polyfill`, and `hooks/useFrameworkReady.ts`. Remove `react-native-paper` once `WordChain` no longer uses it.
- `sharp`: if only `generate_icons.js` uses it, move it to `devDependencies`.
- In `app.json`: set `"scheme": "cluechain"` and `"name": "Clue Chains"`.
- Create `constants/theme.ts` with the tokens from `docs/DESIGN_SPEC.md` §1 (phase 02 adopts them).
- Remove dead styles and unused imports in the files you touch.

## Acceptance criteria
- [ ] `npx tsc --noEmit` passes, `npm test` passes, `npm run validate:chains` passes, and `npm run build:web` succeeds.
- [ ] Playing in the browser: no clue shows a highlighted first letter; "bananas" and "hour glass" are accepted; a hint on link 1 lowers the score; reloading mid-chain resumes at the same link; completing a chain sets Best Time; replaying a finished chain doesn't change Stats.
- [ ] No component compares answers directly.
- [ ] Commit: `phase 01: content format, pure game logic, persistence, bug fixes`.

Finish with a short summary: what changed, anything you couldn't do, and anything that differs from the docs and why.
