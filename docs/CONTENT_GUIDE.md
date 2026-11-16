# Clue Chains — content guide: how to write great chains

Audience: **everyone, family-friendly.** A 10-year-old and their grandparent should both enjoy an easy chain, and both should be able to finish a hard one with a hint or two.

---

## 1. What makes a chain great

A chain is 5 links. Each answer must be **needed** to make sense of the next clue. The best chains feel like a little journey ("Ice to Eggs"), where each step makes the player think "oh, of course!"

**The four tests** that every link must pass:

1. **One answer.** A fair solver lands on exactly one word. If two words fit equally well, rewrite the clue or put the other word in `accept`.
2. **A real link.** The previous answer does real work in the clue. Remove the `{MARKER}` and the clue should become harder or meaningless.
   - ✅ `"Birds build these in a {TREE}"` → nest. The tree is where the nests are.
   - ❌ `"When the {WEST} meets the east, you need this instrument"` → compass. WEST is just decoration, and the clue doesn't really point to compass.
3. **Fair knowledge.** Everyday vocabulary, common phrases and widely known facts. No brand names, celebrities, current events, regional slang or specialist jargon.
4. **Family-friendly.** No violence, weapons, alcohol, drugs, romance, bodily humour, scary themes, politics or religion. If in doubt, leave it out.

## 2. Kinds of link (mix them)

| Link type | Example (prev → answer) | Clue |
|---|---|---|
| Compound / phrase | ice → cone | "{ICE} cream is served in this crunchy holder" |
| Where / habitat | tree → nest | "Birds build these in a {TREE}" |
| Part → whole, whole → part | glass → hourglass | "Sand trickles through two bulbs of {GLASS} in this old timer" |
| What it does | horse → saddle | "You sit on this leather seat when riding a {HORSE}" |
| Opposite / pair | day → night | "{DAY} and this are opposites" |
| Saying / idiom | milk → proverb | "Don't cry over spilled {MILK}, says this kind of saying" |
| Wordplay (hard only) | dove → splash | "When you {DOVE} into the pool, you made this" |
| Category / property | banana → canary | "{BANANA}-yellow, this little bird is famous for singing" |

Use **at least 3 different link types** per chain. Five "compound word" links in a row feels mechanical.

## 3. Difficulty

| | Easy | Medium | Hard |
|---|---|---|---|
| Answers | very common, 3–7 letters | common, up to 9 letters | up to 12, may be less frequent words |
| Clues | literal, one step of thinking | one twist (a phrase, an idiom, a property) | wordplay, double meanings, sayings, two-step thinking |
| Link 1 | a picture-book clue | a straightforward definition | can be a riddle |
| Target | solved with no hints by most players | 1–2 hints for most players | hints are expected; never unfair |

A chain should **rise gently**: link 1 is the easiest, and links 4–5 are the hardest for that difficulty.

## 4. Writing rules (the validator checks the ones marked ✔︎)

- ✔︎ Exactly 5 links. Link 1 has no marker. Links 2–5 have exactly one `{MARKER}`.
- ✔︎ The marker equals the previous answer (or an accepted form or plural). Write it in the form that reads naturally: `{BANANAS}` is fine for the answer `banana`.
- The marker is a **whole word**. Never write `{WEEK}end`.
- ✔︎ A clue never contains its own answer, and no answer repeats in a chain.
- Clues are 90 characters or fewer, written in plain sentence case, with no trailing full stop.
- Answers are lowercase and one word wherever possible. For a true two-word answer (`ice cream`), add the joined form to `accept` (`icecream`).
- Use `accept` for genuine alternatives (`hour glass`, `sand timer`). Don't use it for partly-right answers.
- Use American spelling and add British spellings to `accept` (`color`/`colour`).
- Give each chain a title in the form "First to Last" or a playful phrase, 40 characters or fewer: "Ice to Eggs", "Cocoa to Chords". Players only see the title once they've finished the chain (on the recap screen and in Stats history), so a title may name the first and last answers. It's never shown during play or in the share text.
- Answers at 10+ letters are allowed but rare (they make the tiles small).
- Don't reuse an answer that already appears in 2 other chains.

## 5. Worked examples

### Easy — "Ice to Eggs"
```json
{ "id": "example-easy", "title": "Ice to Eggs", "difficulty": "easy", "theme": "nature",
  "links": [
    { "clue": "Frozen water that clinks in your drink", "answer": "ice" },
    { "clue": "{ICE} cream is served in this crunchy holder", "answer": "cone" },
    { "clue": "A pine {CONE} falls from this tall plant", "answer": "tree" },
    { "clue": "Birds build these in a {TREE}", "answer": "nest" },
    { "clue": "A bird's {NEST} keeps these warm until they hatch", "answer": "egg" }
  ] }
```
Why it works: concrete, picturable words; four different link types; each marker is essential.

### Medium — "Week to Five"
```json
{ "id": "example-medium", "title": "Week to Five", "difficulty": "medium", "theme": "time",
  "links": [
    { "clue": "Seven days in a row", "answer": "week" },
    { "clue": "Every {WEEK} is made of seven of these", "answer": "day" },
    { "clue": "{DAY} and this are opposites", "answer": "night" },
    { "clue": "On a clear {NIGHT}, these twinkle above you", "answer": "star" },
    { "clue": "Count the points on a classic {STAR} drawing", "answer": "five", "accept": ["5"] }
  ] }
```

### Hard — "Dove to Worm"
```json
{ "id": "example-hard", "title": "Dove to Worm", "difficulty": "hard", "theme": "wordplay",
  "links": [
    { "clue": "White bird that stands for peace", "answer": "dove" },
    { "clue": "When you {DOVE} into the pool, you made one of these", "answer": "splash" },
    { "clue": "A {SPLASH} of this goes into a cup of tea", "answer": "milk" },
    { "clue": "\"Don't cry over spilled {MILK}\" is this kind of wise saying", "answer": "proverb", "accept": ["idiom", "adage"] },
    { "clue": "A {PROVERB} says the early bird catches this", "answer": "worm" }
  ] }
```
Why it works: link 2 turns "dove" from a bird into a verb, a classic hard-mode twist that's still fair, and links 4–5 rely on well-known sayings.

## 6. Common mistakes

| Mistake | Example | Fix |
|---|---|---|
| Many answers fit | "A type of fruit" → apple | Add a detail: "Red or green fruit that keeps the doctor away" |
| Decorative link | "{BANANAS} are yellow, just like this bird" | Make the link do the work: "{BANANA}-yellow, this little bird is famous for singing" |
| The clue gives away the answer | "This {SNOW}man is made of snow" → snowman | Never put the answer, or its root, in the clue |
| Specialist trivia | "Latin name for the North Star" → polaris | Keep to common knowledge, or save it for hard chains with a fair clue |
| Marker inside a word | "{WEEK}end" | Rephrase so the marker is a whole word |
| Plural mismatch | clue says {BANANAS}, answer "banana" | Fine: the matcher accepts simple plurals. Irregular plurals (mouse/mice) go in `accept` |

## 7. Review checklist (for a human or for Claude)

- [ ] Each clue has one clear answer. I asked "what else could it be?" for every link.
- [ ] Removing each marker makes its clue worse.
- [ ] At least 3 link types are used.
- [ ] The difficulty label matches the vocabulary and the twist level, and it rises across the chain.
- [ ] Everything is family-friendly and free of brands, people and current events.
- [ ] The title is fun and doesn't spoil the middle answers.
- [ ] `npm run validate:chains` passes.
