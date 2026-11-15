# Clue Chains — UX/UI and code review

Review date: November 2026. The reviewers built the web export, played a full chain at phone size (390×844), and read every source file.
Screenshots of the game before the changes: `docs/screenshots/review-before.png`.
**Status: every item below was APPROVED by the owner.**

## What works

- A strong core mechanic: each answer becomes part of the next clue, which is easy to explain and satisfying.
- A distinctive brand: deep navy, hot pink and gold, with the Play typeface and good landing art.
- A simple 3-tab structure (Play / Guide / Stats).

## Bugs (fix in phase 01)

| ID | Problem | Cause |
|---|---|---|
| B1 | The first letter of every clue ("L" in "Large", "T" in "The") is highlighted purple as if it were a link word | `ClueDisplay.processClue` treats any uppercase letter as a highlight |
| B2 | Points can be farmed. Hints are free when points are 0, and Restart on a finished chain counts it again in Chains Completed and Total Points | Score floors at 0 globally; the reducer adds to stats on every completion |
| B3 | Best Time always shows "--" | `bestTime` is never written |
| B4 | Answer matching is exact. "bananas" is wrong although the clue says BANANAS, and "hour glass" is wrong | `===` on a lowercased string |
| B5 | Progress isn't saved. Closing the app mid-chain restarts at chain 1 | Only `stats` are persisted |
| B6 | The submit arrow is clipped on web and narrow screens | `TextInput` has no `minWidth: 0` inside a row with `overflow: hidden` |
| B7 | How to Play describes a different game ("find a common clue") | Copy |

Code smells: answer checking is duplicated in `GameScreen` and the reducer; `hintDisabled={hintLevel >= 3}` is hard-coded; `react-native-paper` is used without a provider; there are many unused dependencies; the app scheme is `myapp`; `useFrameworkReady` is unused; there are dead styles in most files.

## Design findings and approved improvements

| ID | Finding | Approved change |
|---|---|---|
| D1 | The chain, which is the game's identity, appears only as a row of pink checkmarks. You can't see the words you've built. | A **chain track**: 5 linked slots showing solved words, the current slot highlighted, and future slots showing letter counts |
| D2 | The "answer becomes the next clue" moment has no visual payoff. The card just fades. | A **carry-over animation**: the solved word moves into the track and appears as a highlighted chip in the next clue |
| D3 | The answer length is unknown, and hints appear in a separate pink badge | **Letter tiles** under the clue. Hints fill tiles in place. |
| D4 | Dark text on a white-to-blue gradient fails contrast on the right side of the card | A solid card, a larger clue font, and the link word as a pink chip |
| D5 | Feedback is binary and the error stays while you retype | "So close!" for one-letter misses, the error clears on typing, haptics, and a live region for screen readers |
| D6 | The completion card is a grey box with one number | A **recap screen**: the full chain, 1–3 stars, a score breakdown, time, a Wordle-style **Share** button, and Next Chain |
| D7 | Players can get stuck, and Restart wipes progress without warning | A **Reveal word** button (scores 0 for that link) and a confirmation for Restart |
| D8 | The bottom half of the screen is empty and the header is plain | A balanced layout, a "Chain 4 of 40 · Easy" label, and an animated "+100" on the score pill |
| D9 | The tutorial is a static stock image and the stats are thin | A 3-step interactive first-run tutorial, plus streaks, perfect chains, average time and chain history |

## Developer improvements (approved)

| ID | Change |
|---|---|
| E1 | A structured content format (`docs/CONTENT_FORMAT.md`) with explicit `{LINK}` markers, accepted alternates and difficulty, plus `npm run validate:chains` |
| E2 | Pure, unit-tested game logic in `lib/game`; one source of truth for answer checking; removal of unused dependencies and dead code; scheme set to `cluechain` |
| E3 | Accessibility: labels and roles, contrast AA, reduced motion, Dynamic Type limits, live regions |

## Content (approved)

- Fix the 3 existing chains. "When the WEST meets the east → compass" is a weak link, and "BANANAS → banana" mismatches.
- Add a **starter pack of 30 family-friendly chains** (10 easy, 10 medium, 10 hard) using `prompts/08-generate-chains.md`.
