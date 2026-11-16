# Proposal: letter check (Wordle-style feedback on wrong guesses)

**Status:** approved 2026-11-16 with every recommended option. The text below has been copied into `docs/GAME_RULES.md` and `docs/DESIGN_SPEC.md`, which are now the source of truth. Built in phase 09 (`prompts/09-letter-check.md`).

## The idea

Today a wrong guess gets one of two messages: "Not quite" or, if one letter is off, "So close!". The player learns nothing about which letters were right.

With **letter check**, a wrong guess of the right length is shown back as a row of tiles that mark each letter:

| Mark | Meaning |
|---|---|
| **Right** | this letter is in the answer, in this spot |
| **Elsewhere** | this letter is in the answer, but in a different spot |
| **Not in word** | this letter isn't in the answer (or every copy of it is already marked) |

```
Clue: "A baby {CAT} is called this"            tiles: [ ][ ][ ][ ][ ][ ]

Guess: TITLES                                  [T][I][T][L][E][S]
                                                ·  ✓  ✓  ✗  ✓  ✗
                                         T elsewhere · I right · T right ·
                                         L not in word · E right · S not in word
                                                                    → KITTEN
```

Why it fits Clue Chains: a player who has half the idea ("some kind of baby animal ending in -EN?") gets a nudge from their own thinking instead of having to buy a hint. It turns near-misses into progress, which suits a relaxed family game.

## Decisions for the owner

Each question has a recommendation. The rest of this document assumes the recommended option.

| # | Question | Recommended | Alternative |
|---|---|---|---|
| 1 | What happens when the guess is a different length? | **No letter check.** The feedback line says "Not quite — the answer has 6 letters." The tiles already show the length, so this teaches the rule. | Compare letters from the left anyway. This is confusing: position marks mean nothing when the lengths differ. |
| 2 | What does a checked wrong guess cost? | **−10, the same as today.** One rule for every wrong guess is easy to explain. The per-link floor (10 points) and the star rule (at most 2 wrong guesses for 3 stars) already limit fishing for letters with nonsense guesses. | **−15 for a checked guess.** This keeps a hint (−20, a guaranteed letter in place) closer in value, but it adds a second wrong-guess number to the Guide. |
| 3 | How many checked guesses are shown? | **The last 3** for the current link, newest at the bottom. Older ones drop off. | Only the last one. This is simpler, but players lose the information they paid for. |
| 4 | Can players turn it off? | **No toggle in v1.** If it proves divisive, we can add one in Settings later. | A Settings switch, on by default. |
| 5 | Should the guess tiles have to be real words? | **No.** We have no dictionary, and adding one (≈ 1–3 MB) is out of proportion for a relaxed game. | Bundle a word list and reject non-words without a penalty, like Wordle does. |

**On fishing:** without a dictionary, a player could type `aeiouy` to test vowels. A deliberately weird guess costs the same −10 as any wrong guess and counts against the 3-star limit, so the game still rewards honest play. We don't think it's worth closing this further.

## Not in this proposal

- **An emoji grid in the share text.** Share text stays answer-free and unchanged. A grid could be a nice follow-up, but it changes the recap design.
- **Letter feedback on the main answer tiles.** The main tiles keep showing length and hints only. Copying "right" letters into them would act as free hints and undercut the Hint button.
- **Any change to hints, Reveal, stars or stats.**

---

## Proposed text for `docs/GAME_RULES.md`

### New section, after "Answer matching"

```md
## Letter check (`lib/game/letters.ts`)

checkLetters(guess, link): LetterMark[] | null
  // type LetterMark = { letter: string; mark: 'right' | 'elsewhere' | 'absent' }
  // g = normalize(guess), a = normalize(link.answer)      (canonical answer only, never accept[])
  // returns null if isCorrect(guess, link), or if g.length !== a.length
  // otherwise, Wordle rules:
  //   1. every position where g[i] === a[i] is 'right'
  //   2. count the answer letters NOT matched in step 1
  //   3. left to right, each remaining g[i] is 'elsewhere' if that letter's count is > 0
  //      (then decrement the count); otherwise 'absent'
  // multi-word answers compare their letters with spaces removed ("ice cream" → "icecream")
```

Worked examples (these become unit tests):

| Answer | Guess | Marks |
|---|---|---|
| kitten | titles | T elsewhere, I right, T right, L absent, E right, S absent |
| honey | hoops | H right, O right, O absent (only one O), P absent, S absent |
| puddle | paddle | P right, A absent, D right, D right, L right, E right |
| boots | wellies | `null` (an accepted form, so it's correct, not checked) |
| pillow | pill | `null` (different length) |

### Changes to "Scoring"

Add one row under "Wrong guess" (no change to any number):

```md
| Wrong guess, same length as the answer | −10, and the letter check is shown (see "Letter check") |
```

### Changes to "Persistence"

Add one field to each `LinkState` in `progress.links`:

```md
checkedGuesses: string[];   // normalized guesses that got a letter check, last 3 only;
                            // cleared when the link is solved or revealed, and on Restart
```

The save stays at `version: 2`. A missing or malformed `checkedGuesses` loads as `[]`, so existing saves keep working and need no migration.

---

## Proposed text for `docs/DESIGN_SPEC.md`

### §1 Tokens: add

```ts
  successDeep:   '#047857', // "right" letter border        (5.5:1 on card; `success` is only 2.5:1)
  elsewhere:     '#2563EB', // "elsewhere" letter border     (5.2:1 on card)
  elsewhereSoft: '#DBEAFE', // "elsewhere" letter fill       (cardInk on it: 13.1:1)
```

### §2.4 LetterTiles: add a "Guess rows" subsection

```md
#### Guess rows (letter check)
- Below the answer tiles and inside the ClueCard, show up to 3 rows: the checked guesses for this
  link, oldest at the top. Each row uses the same layout as the answer tiles, at 80% of their size
  (minimum 22).
- A new row's tiles flip in left to right (60 ms stagger). With reduced motion they appear at once.
- Tile states. The fills alone don't tell the states apart (successSoft and elsewhereSoft are only
  1.1:1), so each state also has its own border and marker:
  | Mark | Fill | Border | Marker | Letter |
  |---|---|---|---|---|
  | right | successSoft | 2 px solid successDeep | ✓ in the bottom-right corner (9 px) | cardInk |
  | elsewhere | elsewhereSoft | 2 px **dashed** elsewhere | ● in the top-right corner (6 px) | cardInk |
  | absent | tile | none | none | cardMuted (5.2:1) |
- The rows clear when the link is solved, revealed or restarted.
- On a short screen (compact ClueCard), show only the newest row.
```

Also change the existing line "Tiles don't mirror what the player types" to add: "Guess rows are the one exception: they show *submitted* guesses, never live typing."

### §2.6 Feedback: change the "Wrong" row and add one row

```md
| Wrong, same length | "Not quite — {n} right, {m} elsewhere." (with no matches: "No letters match — try another word.") | the shake as now, plus the new guess row flips in | as now |
| Wrong, different length | "Not quite — the answer has {N} letters." | as now | as now |
```

A near miss keeps its "So close!" copy. If it's the same length, its guess row is shown too.

### §7 Guide tab: add a section after hints

> **Letter check.** Guess a word with the right number of letters and we'll mark each one:
> ✓ right spot, ● in the word but somewhere else, plain means not in the word.

Show the KITTEN / TITLES example rendered with real tiles.

### §10 Accessibility: add

```md
- A guess row is one element, not individually focusable tiles. Its label is
  "Your guess TITLES. Right: I in spot 2, T in spot 3, E in spot 5. Elsewhere: T. Not in the word: L, S."
- After a checked guess, the announcement is the feedback line followed by the row label.
- Nothing depends on colour alone: right and elsewhere differ in border style (solid / dashed)
  and marker (✓ / ●) as well as fill.
```

---

## Implementation outline (phase 09, once approved)

1. `lib/game/letters.ts`: `checkLetters` with unit tests covering the table above, plus all-absent, all-elsewhere (anagram) and multi-word answers.
2. Reducer: on a wrong same-length guess, append to `checkedGuesses` (keep the last 3). Clear it on solve, Reveal and Restart. Storage: load a missing field as `[]`, with a test for loading an old save.
3. `components/play/GuessRows.tsx`: renders the rows from `checkLetters`, with the flip-in animation and reduced-motion handling.
4. Feedback copy and announcements (§2.6, §10).
5. Guide section and tile example (§7).
6. Add QA checklist items: duplicate letters, a 12-letter answer at 360 px wide with 3 rows, compact card, VoiceOver/TalkBack labels, resuming a saved game mid-link.

The tutorial (coach marks) doesn't change. Players will meet letter check naturally on their first wrong guess, and the Guide explains it.
