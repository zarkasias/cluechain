# Clue Chains — project guide for Claude

Clue Chains is a word-puzzle game built with Expo (SDK 58), React Native 0.88, expo-router and TypeScript.

**The game in one sentence:** the player gets a clue, guesses the answer, and that answer becomes part of the next clue. A chain has exactly 5 links.

```
Clue 1: "Large gray animal with a trunk"                    → ELEPHANT
Clue 2: "An {ELEPHANT} never forgets; this organ remembers" → BRAIN
Clue 3: "The {BRAIN} sends signals to this blood pump"      → HEART
...
```

## Read these before changing anything

| Doc | What it covers |
|---|---|
| `docs/UX_REVIEW.md` | Findings from the expert review, with the improvements the owner approved |
| `docs/DESIGN_SPEC.md` | Screens, components, visual tokens, motion and copy. **This is the source of truth for UI work.** |
| `docs/GAME_RULES.md` | Scoring, hints, answer matching, stars, stats and persistence. **This is the source of truth for game logic.** |
| `docs/CONTENT_FORMAT.md` | The chain data schema and the validator rules |
| `docs/CONTENT_GUIDE.md` | How to write good chains (tone, difficulty, link quality) |
| `prompts/` | The ordered implementation phases. Do them one at a time. |

## Conventions

- TypeScript strict. No `any` except at third-party boundaries.
- Game rules live in `lib/game` (no React or React Native imports) and nowhere else. Components never compare answers themselves.
- Styles go in `StyleSheet.create` at the bottom of each file. Use tokens from `constants/theme.ts`. Don't hard-code hex values in components.
- Animations: use `react-native-reanimated` (already installed). Respect reduced motion (`useReducedMotion()`).
- Haptics: use `expo-haptics` (already installed) through the `lib/haptics.ts` wrapper, which is a no-op on web.
- Every touchable needs `accessibilityRole` and `accessibilityLabel`, and a hit area of at least 44×44.
- Content is family-friendly and for all ages (see `docs/CONTENT_GUIDE.md`).
- Run `npx tsc --noEmit`, `npm test` and `npm run validate:chains` before you say a phase is done.

## Git

- Work on the branch `ux-overhaul`. Create it from `main` if it doesn't exist.
- Commit at the end of each phase with the message `phase NN: <summary>`. Don't push unless asked.
