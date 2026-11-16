# Clue Chains — game rules (source of truth for `lib/game`)

## Structure

- A **chain** has exactly 5 **links**. Each link has a clue and an answer.
- The clue for link N (N ≥ 2) contains the answer to link N−1, marked as `{WORD}` in the data (see `CONTENT_FORMAT.md`).
- Chains are played in the order given by `data/chains/index.ts`. After the last chain, show the "All chains complete" state, which offers a replay of any chain from Stats → History.

## Answer matching (`lib/game/answers.ts`)

```ts
normalize(s): string
  // lowercase, trim, remove diacritics (NFD + strip combining marks),
  // remove every character that isn't a–z or 0–9 (so spaces, hyphens and apostrophes vanish)
  // "Hour-glass " → "hourglass", "Café" → "cafe"

isCorrect(guess, link): boolean
  // true if normalize(guess) equals normalize(link.answer) or normalize() of any link.accept[]
  // also true for a simple plural/singular of the answer:
  //   guess === answer + "s" | answer + "es" | answer without a trailing "s"/"es"
  //   (only when the answer is at least 4 letters, so "bus" doesn't accept "bu")

isNearMiss(guess, link): boolean
  // false if isCorrect. Otherwise true when the Levenshtein distance to the normalized
  // answer (or any accept form) is exactly 1 and the answer has at least 4 letters.
```

Empty or whitespace-only guesses are ignored: they aren't counted as a miss.

## Letter check (`lib/game/letters.ts`)

A wrong guess with the same number of letters as the answer is checked letter by letter, as in Wordle.

```ts
checkLetters(guess, link): CheckedLetter[] | null
  // type CheckedLetter = { letter: string; mark: 'right' | 'elsewhere' | 'absent' }
  // g = normalize(guess), a = normalize(link.answer)      (canonical answer only, never accept[])
  // returns null if isCorrect(guess, link), or if g.length !== a.length
  // otherwise:
  //   1. every position where g[i] === a[i] is 'right'
  //   2. count the answer letters NOT matched in step 1
  //   3. left to right, each remaining g[i] is 'elsewhere' if that letter's count is > 0
  //      (then decrement the count); otherwise 'absent'
  // multi-word answers compare their letters with spaces removed ("ice cream" → "icecream")
```

| Answer | Guess | Marks |
|---|---|---|
| kitten | titles | T elsewhere, I right, T right, L absent, E right, S absent |
| honey | hoops | H right, O right, O absent (only one O), P absent, S absent |
| puddle | paddle | P right, A absent, D right, D right, L right, E right |
| boots | wellies | `null` (an accepted form, so it's correct, not checked) |
| pillow | pill | `null` (different length) |

- Checked guesses, wrong or near miss, are kept per link in `checkedGuesses` (normalized, newest last, at most **3**). Typing a guess that's already in the list moves it to the end instead of adding a copy.
- They are cleared when the link is solved or revealed, and on Restart.
- There's no dictionary check: any letters are checked.
- Letter check never changes the main answer tiles. They still show the length and hints only.

## Scoring (`lib/game/scoring.ts`)

The score is calculated **per link**, so it can never go negative or be farmed.

| Event | Effect on that link's value |
|---|---|
| Link starts | value = **100** |
| Wrong guess (not a near miss) | −10 |
| Wrong guess, same length as the answer | −10, and the letter check is shown (see "Letter check") |
| Near miss | no penalty (it's encouragement) |
| Hint (reveals the next letter in the tiles) | −20 per letter |
| Reveal word | value = **0** and the link is marked `revealed` |
| Floor | A link's value never drops below **10** unless revealed (then it's 0) |

Hints:
- Each hint reveals one more letter, left to right. The maximum is `answer.length − 1` letters; after that the only option is Reveal word.
- The first letter revealed by a hint is always tile 1.

Chain score = sum of the link values + **perfect bonus 100** if no hints and no reveals were used.

Stars:
- ★★★ no hints, no reveals, and at most 2 wrong guesses in total
- ★★ no reveals, and at most 3 hint letters in total
- ★ completed (anything else)

## Timing

- The timer starts when link 1 is first shown, and **pauses** when the app goes to the background (`AppState`) or the player leaves the Play tab.
- The timer stops when link 5 is solved. Store `timeMs`.
- The timer isn't shown during play (it's a relaxed game). It appears on the recap screen and in Stats.

## Restart, replay and stats integrity

- **Restart** (with confirmation) resets the current chain's links, score and timer. It doesn't touch stats.
- A chain counts toward stats **only the first time it is completed**. A replay records a new personal best (`bestScore`, `bestTimeMs`, `bestStars`) but doesn't add to `chainsCompleted`, `totalPoints`, `hintsUsed` or the streak.
- `wordsSolved` counts links solved without Reveal, on first completion only.

## Stats (`stats` in storage)

```ts
type Stats = {
  chainsCompleted: number;
  perfectChains: number;      // 3 stars on first completion
  totalPoints: number;
  wordsSolved: number;
  hintsUsed: number;          // hint letters
  wordsRevealed: number;
  bestTimeMs: number | null;
  totalTimeMs: number;        // for the average: totalTimeMs / chainsCompleted
  currentStreak: number;      // consecutive local calendar days with ≥1 first completion
  bestStreak: number;
  lastPlayedDay: string | null; // 'YYYY-MM-DD' in local time
};
```

Streak rule: on a first completion on day D, if `lastPlayedDay` is D, the streak doesn't change; if it's D−1, add 1; otherwise set it to 1. Update `bestStreak`.

## Persistence (`lib/game/storage.ts`)

- One AsyncStorage key: `cluechain:v2`. JSON shape:

```ts
type SaveV2 = {
  version: 2;
  progress: {
    chainId: string;
    linkIndex: number;            // 0–4
    links: LinkState[];           // per link: { hintLetters, wrongGuesses, revealed, solved, value, checkedGuesses }
    elapsedMs: number;
  } | null;
  history: Record<string, { stars: 1|2|3; bestScore: number; bestTimeMs: number; firstCompletedAt: string }>;
  stats: Stats;
  settings: { seenTutorial: boolean; haptics: boolean };
};
```

- `checkedGuesses: string[]` was added in phase 09 without a version bump. A missing or malformed value loads as `[]`, so older saves need no migration.
- Save is debounced (300 ms) after any state change, and also on `AppState` → background.
- **Migration:** if `cluechain:v2` is missing and the legacy key `gameStats` exists, map `chainsCompleted`, `hintsUsed`, `wordsGuessed → wordsSolved` and `totalPoints`, then delete the legacy key.
- Corrupt JSON → log it, start fresh, and never crash.
- If the saved `chainId` no longer exists in the content, start at the first unfinished chain.

## Next chain selection

The next chain is the first chain, in content order, that isn't in `history`. If every chain is done, show "All chains complete".
