# Clue Chains — content format and validator

## Files

```
data/chains/
  index.ts            imports each pack, concatenates them in order, exports `chains: Chain[]`
  pack-01-classic.json  the 3 original chains, fixed
  pack-02-starter.json  30 new chains (10 easy, 10 medium, 10 hard)
```

JSON keeps the content editable by non-developers and by generation prompts. `index.ts` gives the chains their type.

## Schema

```ts
type Difficulty = 'easy' | 'medium' | 'hard';

type Link = {
  clue: string;       // shown to the player; links 2–5 contain exactly one {MARKER}
  answer: string;     // canonical answer, lowercase, letters (and single spaces if truly multi-word)
  accept?: string[];  // other answers accepted as correct (spellings, synonyms that fit the clue exactly)
};

type Chain = {
  id: string;          // kebab-case, unique forever (stats are keyed by it), e.g. "starter-easy-04"
  title: string;       // short, fun, shown on the recap screen: "Jungle to Jukebox"
  difficulty: Difficulty;
  theme?: string;      // optional tag: "food", "nature", "music"…
  links: [Link, Link, Link, Link, Link]; // exactly 5
};
```

### The `{MARKER}`

- In links 2–5, the previous answer appears in the clue wrapped in curly braces, written in the form that reads naturally: `"An {ELEPHANT} never forgets…"`.
- The marker's text, once normalized, must equal the previous link's `answer`, one of its `accept` values, or a simple plural/singular of either (same rule as in `GAME_RULES.md`).
- The UI renders the marker as a pink chip and removes the braces. **Never use uppercase alone to mark links.**
- Link 1 has no marker.

### Example

```json
{
  "id": "classic-01",
  "title": "Trunk to Time",
  "difficulty": "easy",
  "theme": "animals",
  "links": [
    { "clue": "Large gray animal with a trunk", "answer": "elephant" },
    { "clue": "An {ELEPHANT} never forgets — thanks to this organ", "answer": "brain" },
    { "clue": "The {BRAIN} sends signals to this organ that pumps blood", "answer": "heart" },
    { "clue": "A broken {HEART} might be mended, but this see-through material shatters for good", "answer": "glass" },
    { "clue": "Sand trickles through two bulbs of {GLASS} in this old timer", "answer": "hourglass", "accept": ["hour glass", "sand timer", "egg timer"] }
  ]
}
```

## Validator — `scripts/validate-chains.ts`

Run it with `npm run validate:chains` (`tsx scripts/validate-chains.ts`). It exits non-zero on any **error**, and prints **warnings** without failing.

**Errors**
1. Each file parses and matches the schema. Exactly 5 links; `difficulty` is valid; `title` is between 3 and 40 characters.
2. `id` is unique across all packs and is kebab-case.
3. Link 1 has no `{…}`. Links 2–5 have exactly one `{…}`, and it matches the previous answer as described above.
4. `answer` is non-empty, 2–20 characters after normalizing, and contains only letters plus at most one space.
5. A clue doesn't contain its own answer, or any of its `accept` values, as a whole word (case-insensitive).
6. No answer repeats within a chain.
7. The `accept` list has no duplicates and doesn't include the answer itself.

**Warnings**
1. An answer is longer than 10 letters (the tiles get small).
2. A clue is longer than 90 characters (too long for the card).
3. An answer appears in more than 2 chains across all packs (repetitive).
4. The difficulty mix isn't balanced in a pack.
5. The clue contains a word from the family-friendly watch list in `scripts/watchlist.txt` (for human review; not a hard block).

Print a summary like `33 chains · 165 links · 0 errors · 2 warnings`.
