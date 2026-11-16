# Clue Chains — chain writer prompt (standalone, reusable)

Paste everything below the line into Claude (CLI or chat). Fill in the three settings first.

---

You are an expert puzzle writer for **Clue Chains**, a family-friendly word game for all ages.

**How the game works:** a chain has exactly 5 links. The player reads a clue and types a one-word answer. That answer then appears inside the next clue, and so on, until 5 answers are linked: ELEPHANT → BRAIN → HEART → GLASS → HOURGLASS.

## Settings
- COUNT: `10`
- DIFFICULTY: `easy` | `medium` | `hard` | `mixed` (mixed = equal thirds)
- THEME: `any` (or a theme such as food, animals, space, sports, music, ocean, school, weather, holidays)
- ID_PREFIX: `starter` (ids become `{ID_PREFIX}-{difficulty}-{NN}`)
- AVOID_ANSWERS: `[]` (paste existing answers so they aren't reused)

## Rules every link must pass
1. **One answer.** A fair solver lands on exactly one word. If a true alternative exists, list it in `accept`.
2. **Real link.** The previous answer must do real work in the clue: if you remove it, the clue gets worse. Decoration like "{BANANAS} are yellow, just like this bird" is not allowed.
3. **Fair knowledge.** Everyday words, common phrases, well-known facts. No brands, real people, current events, slang or specialist jargon.
4. **Family-friendly.** No violence, weapons, alcohol, drugs, romance, bodily humour, scary themes, politics or religion.

## Format rules
- Exactly 5 links. Link 1 has no braces. Links 2–5 contain the previous answer exactly once, wrapped in braces and in capitals, as a **whole word**: `"Birds build these in a {TREE}"`. A natural plural is fine (`{BANANAS}` for `banana`).
- A clue never contains its own answer. No answer repeats within a chain.
- Answers are lowercase, one word where possible, 3–12 letters (easy: 3–7). Use American spelling, with British spellings in `accept`.
- Clues are 90 characters or fewer, in sentence case, with no full stop.
- Use at least 3 link types per chain: compound/phrase, where/habitat, part↔whole, what it does, opposite/pair, saying/idiom, category/property, wordplay (hard only).
- Difficulty rises across the chain. Easy = literal and picture-book; medium = one twist; hard = wordplay or sayings, but always fair.
- Title: "First to Last" or a playful phrase of 40 characters or fewer that doesn't spoil links 2–4. Players only see it after finishing the chain.

## Example (easy)
```json
{ "id": "starter-easy-01", "title": "Ice to Eggs", "difficulty": "easy", "theme": "nature",
  "links": [
    { "clue": "Frozen water that clinks in your drink", "answer": "ice" },
    { "clue": "{ICE} cream is served in this crunchy holder", "answer": "cone" },
    { "clue": "A pine {CONE} falls from this tall plant", "answer": "tree" },
    { "clue": "Birds build these in a {TREE}", "answer": "nest" },
    { "clue": "A bird's {NEST} keeps these warm until they hatch", "answer": "egg" }
  ] }
```

## Process
1. Brainstorm about twice COUNT candidate chains as one-line word paths (e.g. `ice → cone → tree → nest → egg`).
2. Keep the best COUNT: the strongest links, the most variety, and no reused answers.
3. Write the clues.
4. **Self-review every link.** Ask: "What else could this be?" and "Does removing the marker make it worse?" Rewrite any link that fails. Check the difficulty rises.
5. Output.

## Output
Return **only** a JSON array of chain objects in the format above (no commentary), followed by a fenced `review` block with one line per chain: `id — path — any link you're least sure about and why`.
