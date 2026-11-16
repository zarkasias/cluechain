# Clue Chains

A family-friendly word puzzle for phones (and the web). Solve a clue, and your answer becomes part of the next clue. Link five answers together to complete the chain.

```
Clue 1  Large gray animal with a trunk                         → ELEPHANT
Clue 2  An ELEPHANT never forgets — thanks to this organ       → BRAIN
Clue 3  The BRAIN sends signals to this organ that pumps blood → HEART
Clue 4  A broken HEART can mend, but this see-through material shatters for good → GLASS
Clue 5  Sand trickles through two bulbs of GLASS in this old timer             → HOURGLASS
```

## How to play

- **Read the clue and type your answer.** The tiles show how many letters it has. Spelling, capitals, spaces and simple plurals are forgiven.
- **Your answer carries over.** It appears in the next clue as a pink word, so every link depends on the one before.
- **Letter check.** Guess a word of the right length and each letter is marked: ✓ right spot, ● in the word but elsewhere, plain means not in the word.
- **Stuck?** A hint reveals the next letter (−20 points), or you can reveal the whole word (that link scores 0).
- **Score and stars.** Each link is worth up to 100 points. A wrong guess costs 10, and a near miss ("So close!") costs nothing. Finish without hints or reveals for a +100 perfect bonus and up to three stars.
- **Stats.** Streaks, best times and a history of every chain you've finished, which you can replay.

The chain's title (such as "Trunk to Time") stays hidden until you finish, because it names the first and last answers. Sharing a result never includes answers either:

```
Clue Chains #1 · Easy
★★★  600 pts  ⏱ 1:42
🟩🟩🟩🟩🟩
```

There are currently 33 chains: the 3 originals and a 30-chain starter pack (10 easy, 10 medium, 10 hard).

## Getting started

You need Node.js (developed on 22) and the [Expo Go](https://expo.dev/go) app on your phone.

```bash
npm install
npm run dev        # starts Expo; scan the QR code with Expo Go (iOS camera / Android Expo Go)
```

Press `w` in the Expo terminal to open the web version instead.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Expo dev server |
| `npm run build:web` | Export the web build to `dist/` |
| `npm test` | Unit tests (Jest) |
| `npx tsc --noEmit` | Type check |
| `npm run lint` | ESLint |
| `npm run validate:chains` | Check every chain pack against the content rules |

Before calling any change done, run the type check, the tests and the chain validator.

## Project layout

```
app/                  screens (expo-router): landing page, and the Play, Guide and Stats tabs
components/           UI: GameScreen, play/ (clue card, tiles, guess rows, …), recap/, tutorial/
lib/game/             pure game rules, no React: answer matching, letter check, scoring,
                      stats, the game reducer and saved-game storage (unit-tested)
context/              GameContext: wires the reducer to storage
data/chains/          chain content as JSON, one file per pack, loaded in order by index.ts
constants/theme.ts    colours, spacing, type and motion tokens
scripts/              the chain validator and its family-friendly watch list
docs/                 specs, content guides and review notes (see below)
prompts/              the step-by-step implementation phases
```

Built with Expo (SDK 58), React Native, expo-router, TypeScript (strict), Reanimated and expo-haptics. Progress is saved on the device with AsyncStorage. Nothing is sent anywhere.

## Writing new chains

Chains live in `data/chains/*.json`. Each chain has an id, a title, a difficulty and exactly five links. From link 2 on, each clue marks the previous answer with braces:

```json
{ "clue": "Birds build these in a {TREE}", "answer": "nest" }
```

1. Read `docs/CONTENT_GUIDE.md` (what makes a good link) and `docs/CONTENT_FORMAT.md` (the schema).
2. `prompts/chain-writer.md` is a reusable prompt for drafting a batch of chains with Claude.
3. Add the pack to `data/chains/index.ts`, then run `npm run validate:chains`.
4. Write a short editorial review in `docs/content-review/` (see `pack-02.md` for the format).

## Documentation

| Doc | What it covers |
|---|---|
| `docs/GAME_RULES.md` | Source of truth for game logic: matching, letter check, scoring, stars, stats, saving |
| `docs/DESIGN_SPEC.md` | Source of truth for UI: screens, components, tokens, motion, copy, accessibility |
| `docs/CONTENT_FORMAT.md` | Chain schema and validator rules |
| `docs/CONTENT_GUIDE.md` | How to write good chains |
| `docs/QA_CHECKLIST.md` | QA results, plus the VoiceOver/TalkBack device check |
| `docs/UX_REVIEW.md` | The expert review the redesign came from |
| `docs/proposals/` | Feature proposals and their approval status |
