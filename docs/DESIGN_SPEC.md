# Clue Chains — design spec (source of truth for UI)

Target: a portrait phone, designed at 390×844 and checked at 360×740 and on a tablet. iOS, Android and web.
Keep the existing brand: deep navy, hot pink, gold, the **Play** typeface for display text, and the system font for body text.

---

## 1. Tokens — `constants/theme.ts`

Replace `constants/Colors.ts`. Re-export `Colors` from the new file during migration, then delete the old file.

```ts
export const color = {
  bg:          '#15233D', // app background (existing primary)
  bgDeep:      '#0E1830', // tab bar, recap backdrop
  card:        '#FFFFFF', // clue card (solid — no gradient)
  cardInk:     '#14213D', // text on card            (16.0:1 on card)
  cardMuted:   '#5B6478', // labels on card          (5.9:1 on card)
  ink:         '#F8FAFC', // text on bg              (15.0:1 on bg)
  inkMuted:    '#A9B4CC', // secondary text on bg    (7.5:1 on bg)
  link:        '#EC4899', // pink accent: borders, connectors, icons, glow (NOT a fill behind small white text — only 3.5:1)
  linkFill:    '#DB2777', // pink fill behind white text: solved slots, primary buttons, submit (4.6:1)
  linkDeep:    '#BE185D', // chip text on linkSoft (5.1:1), pressed states
  linkSoft:    '#FCE7F3', // chip background on card
  gold:        '#F59E0B', // score, stars
  goldSoft:    '#FEF3C7',
  success:     '#10B981',
  successSoft: '#D1FAE5',
  error:       '#EF4444',
  errorSoft:   '#FEE2E2',
  tile:        '#EEF1F7', // empty letter tile
  tileBorder:  '#C9D1E3',
  slotEmpty:   '#24375C', // future chain slot on bg
  focus:       '#60A5FA',
  successDeep:   '#047857', // "right" letter border        (5.5:1 on card; `success` is only 2.5:1)
  elsewhere:     '#2563EB', // "elsewhere" letter border     (5.2:1 on card)
  elsewhereSoft: '#DBEAFE', // "elsewhere" letter fill       (cardInk on it: 13.1:1)
};
export const space  = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const type = {
  display: { fontFamily: 'Play-Bold', fontSize: 28, lineHeight: 34 },
  title:   { fontFamily: 'Play-Bold', fontSize: 22, lineHeight: 28 },
  clue:    { fontSize: 22, lineHeight: 30, fontWeight: '600' },  // system font for readability
  body:    { fontSize: 16, lineHeight: 24 },
  label:   { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  tile:    { fontFamily: 'Play-Bold', fontSize: 22 },
};
export const motion = { fast: 150, base: 250, slow: 450, spring: { damping: 16, stiffness: 180 } };
```

Remove every gradient from cards and buttons. The only gradient allowed is the landing background art. Flat surfaces improve contrast and look more modern.

---

## 2. Play screen layout (top to bottom)

```
┌───────────────────────────────────────┐
│ Chain 4 of 33 · Easy        ★ 1,240   │  ← Header (D8), no title
│ ●ELEPHANT━●BRAIN━◉ _ _ _ _ _━○ 5━○ 9  │  ← ChainTrack (D1)
│                                       │
│ ┌───────────────────────────────────┐ │
│ │ LINK 3 OF 5                       │ │  ← ClueCard (D4)
│ │ The [BRAIN] sends signals to this │ │     [BRAIN] = pink chip
│ │ organ that pumps blood            │ │
│ │                                   │ │
│ │  [H][ ][ ][ ][ ]                  │ │  ← LetterTiles (D3)
│ └───────────────────────────────────┘ │
│  So close! Check your spelling.       │  ← Feedback line (D5), live region
│ ┌──────────────────────────────┐┌──┐  │
│ │ Type your answer…            ││ →│  │  ← AnswerInput
│ └──────────────────────────────┘└──┘  │
│  💡 Hint (−20)   👁 Reveal   ↺ Restart │  ← ActionBar (D7)
└───────────────────────────────────────┘
```

- Vertically, the content sits at the top with `space.lg` gaps. On tall screens the ClueCard grows to a minimum height of 220 so the screen doesn't look empty, and the input + actions anchor to the bottom above the keyboard (`KeyboardAvoidingView`, with the bottom tab-bar inset from `useBottomTabBarHeight`).
- Use safe-area insets (`react-native-safe-area-context`). Delete the magic `marginTop: 35` and `paddingBottom: 100`.
- Remove the large "ClueChain" title from the Play header. The landing page carries the brand; the header shows progress instead.

### 2.1 Header (D8)
- Left: `Chain {n} of {total} · {Difficulty}` in `type.label`, colour `inkMuted`.
- **No chain title during play.** Titles usually name the first and last answers ("Frog to Pillow"), so they would spoil the chain. The title is revealed on the recap screen, and is shown in Stats → History (completed chains only).
- Right: a score pill, gold outline, star icon + the running **chain** score (not the lifetime total).
- When points are earned, a `+100` (or the actual value) floats up from the pill and fades out (`motion.slow`), and the number counts up.

### 2.2 ChainTrack (D1)
- A horizontal row of 5 **slots** joined by short connector bars (2 px, `link` colour when the left slot is solved, `slotEmpty` otherwise). Wrap it in a horizontal `ScrollView` that auto-scrolls to keep the current slot in view.
- Slot states:
  - **solved**: a `linkFill` pill with the white word in uppercase Play-Bold 14. If revealed (not solved), use an outlined pill with a muted word and an eye icon.
  - **current**: an outlined pink pill with a 1.5 s breathing glow (opacity 0.6 → 1). Content: letter count, e.g. `5`.
  - **future**: a `slotEmpty` pill showing the letter count in `inkMuted`.
- A slot is at least 44 high. Tapping a solved slot shows that link's clue in a small tooltip/popover (nice-to-have).
- Accessibility: the track is one element labelled "Chain progress: 2 of 5 solved. Elephant, brain."

### 2.3 ClueCard (D4)
- A solid `card` with `radius.lg`, padding `space.xl`, and a soft shadow (`0 6 16 rgba(0,0,0,.25)`).
- Label: `LINK {n} OF 5` (`type.label`, `cardMuted`).
- Clue text in `type.clue`, colour `cardInk`. Parse `{WORD}` markers into an inline **LinkChip**: `linkSoft` background, `linkDeep` text, `radius.sm`, horizontal padding 6, same font size, uppercase. Plain text never gets special colour (this fixes B1).
- Links 2–5: the LinkChip does a single pulse (scale 1 → 1.08 → 1) when the clue appears, so the eye catches the carry-over.

### 2.4 LetterTiles (D3)
- One tile per letter of the canonical answer. Multi-word answers show a gap between words.
- Tile size = `min(44, floor((cardInnerWidth − gaps) / letters))`, with a gap of 6. This must fit 12 letters at 360 wide.
- States: empty (`tile` fill, `tileBorder` border), hinted (`goldSoft` fill, `cardInk` letter), correct (`successSoft` fill, `success` border — briefly after solving).
- Tiles don't mirror what the player types. The input stays a normal text field: it's faster and works with autocorrect off and with screen readers. Tiles show length and hints only. Guess rows (below) are the one exception: they show *submitted* guesses, never live typing.

#### Guess rows (letter check, `components/play/GuessRows.tsx`)
- Below the answer tiles and inside the ClueCard, show up to 3 rows: the checked guesses for this link (GAME_RULES "Letter check"), oldest at the top. Each row uses the same layout as the answer tiles, at 80% of their size (minimum 22).
- A new row's tiles flip in left to right (60 ms stagger). With reduced motion they appear at once.
- Tile states. The fills alone don't tell the states apart (successSoft and elsewhereSoft are only 1.1:1), so each state also has its own border and marker:

  | Mark | Fill | Border | Marker | Letter |
  |---|---|---|---|---|
  | right | successSoft | 2 px solid successDeep | ✓ in the bottom-right corner | cardInk |
  | elsewhere | elsewhereSoft | 2 px **dashed** elsewhere | ● in the top-right corner | cardInk |
  | absent | tile | none | none | cardMuted (5.2:1) |

- The rows clear when the link is solved, revealed or restarted.
- On a short screen (compact ClueCard), or when a guess has to wrap onto more than one line (long answers on narrow screens), show only the newest row.

### 2.5 AnswerInput
- A full-width field, 52 high, `radius.md`, white with `tileBorder`; on focus the border is `focus` colour and 2 px.
- Placeholder: "Type your answer…". Settings: `autoCapitalize="none"`, `autoCorrect={false}`, `spellCheck={false}`, `returnKeyType="go"`, `blurOnSubmit={false}` so the keyboard stays up between links.
- Submit button: a 52×52 square, `linkFill` background, white arrow; disabled at 40% opacity when the field is empty. It must never be clipped (B6: `minWidth: 0` on the input, `flexShrink: 0` on the button).
- Auto-focus when each new link appears, **including on iOS** (focus after the carry-over animation completes).

### 2.6 Feedback (D5)
A single line between the card and the input, with a fixed height of 24 so the layout doesn't jump. It has `accessibilityLiveRegion="polite"` (Android) and uses `AccessibilityInfo.announceForAccessibility` (iOS).

| Situation | Copy | Visual | Haptic |
|---|---|---|---|
| Wrong, same length | "Not quite — {n} right, {m} elsewhere." (with no matches: "No letters match — try another word.") | input shakes (4 × 8 px, 240 ms), red border, and the new guess row flips in | `notificationAsync(Error)` |
| Wrong, different length | "Not quite — the answer has {N} letters." | input shakes, red border | `notificationAsync(Error)` |
| Near miss | "So close! Check your spelling." | gold border, no shake | `impactAsync(Light)` |
| Correct | "Nice! {WORD} joins the chain." | green border | `notificationAsync(Success)` |
| Hint | "Hint used: −20" | the new tile flips in | `selectionAsync()` |

The message and border colour clear **as soon as the player edits the input**. Guess rows stay until the link ends.

A near miss keeps its "So close!" copy. If it's the same length, its guess row is shown too. The tutorial keeps the rotating wrong copy ("Not quite — try again." / "Nope, keep going!" / "Not that one.") and has no letter check.

### 2.7 ActionBar (D7)
Three text+icon buttons in a row, each at least 44 high, in `inkMuted` colour on `bg`. Use lucide icons (already installed).
- **Hint** `Lightbulb` — the label shows its cost: "Hint −20". Disabled when only one letter remains hidden.
- **Reveal** `Eye` — opens a confirm sheet: "Reveal this word? You'll score 0 for this link." [Cancel] [Reveal]. On confirm, the tiles fill letter by letter (60 ms stagger), the slot becomes "revealed", then the carry-over runs.
- **Restart** `RotateCcw` — confirm: "Restart this chain? Your progress on it will be lost." Hidden on link 1 when nothing has been used yet.
Use a small custom bottom-sheet modal (RN `Modal`, slide-up, scrim `rgba(0,0,0,.5)`), not `Alert`, so it matches the style on all platforms including web.

---

## 3. Carry-over animation (D2) — the signature moment

Total about 900 ms. Input is blocked while it runs. Use Reanimated.

1. **0 ms** — Correct. The input border turns green, the tiles fill with the answer in `successSoft` (staggered 30 ms per tile), and the success haptic plays.
2. **350 ms** — A floating "ghost" chip with the word (pink pill) appears over the tiles and flies to the current ChainTrack slot (measure both with `measure()`/`onLayout`; translate + scale 1 → 0.8; 400 ms, ease-in-out).
3. **750 ms** — The slot turns solved (fill pink, word appears), and the connector to the next slot fills left to right (150 ms). The score pill shows `+{value}`.
4. **750 ms** — In parallel, the clue card content crossfades (old out 150 ms, new in 200 ms with translateY 12 → 0), and the new clue's LinkChip pulses.
5. **950 ms** — The input clears and is focused.

**Reduced motion** (`useReducedMotion()` true): no flight, no shake, no pulse. Instant state changes with a 150 ms crossfade only. Haptics stay.

On link 5: run steps 1–3, then wait 400 ms and transition to the Recap screen.

---

## 4. Recap screen (D6)

Shown in place of the Play content (same route) when the chain is complete.

```
        Chain complete!               (type.display, ink)
        Trunk to Time                 (type.title, inkMuted)
          ★ ★ ★                       (gold; stars pop in one by one, 120 ms stagger)

   ELEPHANT                            ✓ 100
      │  "An ELEPHANT never forgets…"
   BRAIN                               ✓ 80   (1 hint)
      │
   HEART                               ✓ 100
      │
   GLASS                               👁 0    (revealed)
      │
   HOURGLASS                           ✓ 90   (1 miss)

   Perfect bonus  —        Time 1:42
   ─────────────────────────────────
   Score                         370

   [  Share  ]        [ Next chain → ]
```

- The vertical chain is the hero: each word is a `linkFill` pill and the connector lines are pink. Revealed words are outlined.
- Show the link clue in small `inkMuted` text under each connector (one line, truncated). This is optional on small screens.
- **Share** uses RN `Share.share({ message })`. On web, use `navigator.share` when available, otherwise copy to the clipboard (`expo-clipboard`) and show the toast "Copied!".

Share text (no answers and no title, so it can't spoil):
```
Clue Chains #4 · Easy
★★★  370 pts  ⏱ 1:42
🟩🟨🟩🟥🟩
```
Legend: 🟩 clean solve · 🟨 solved with hints or misses · 🟥 revealed.

- **Next chain** is the primary button (`linkFill`, full width on small screens). **Replay** is a tertiary text button, with a note that replays don't change stats.
- If it's a first completion and it set a new best time or perfect: show a small gold badge "New best time!" / "Perfect chain!".
- After the last chain: the title is "You finished every chain!", with the message "New chains are coming soon." and a button to Stats → History.

---

## 5. Onboarding (D9)

The first launch after pressing Start Game, when `settings.seenTutorial` is false: a 3-step **coach-mark tutorial** over a built-in demo chain (not counted in stats), with a "Skip" link at the top right.

1. "Solve the clue." Highlight the ClueCard. Demo clue: "A yellow fruit monkeys love" (answer: banana). The player types the answer. If they type wrong twice, show the answer as the tile hint.
2. "Your answer becomes the next clue." Run the carry-over; highlight the LinkChip in "A {BANANA} split is served in this cold treat" (ice cream / accept icecream). The player solves it.
3. "Build a chain of 5. Stuck? Use a hint or reveal the word." Highlight the ActionBar and ChainTrack. The button "Let's play" starts chain 1.

The Guide tab gets a "Replay tutorial" button.

## 6. Landing page

- Keep the art. Add a bottom-to-top scrim gradient (transparent → `rgba(14,24,48,.85)`) behind the content so the title reads clearly.
- Move the title and button to the lower third. The title is Play-Bold 52. The tagline is "Every answer is the next clue." (`type.body`, ink).
- Buttons: **Play** (`linkFill`, 56 high, full width minus 48), plus "Continue chain {n}" when progress exists.
- Use `router.replace('/(tabs)')` so Back doesn't return to the landing page.

## 7. Guide tab (fixes B7)

Replace the content with:
- **How it works** — 3 numbered steps with a mini illustration built from real UI components (a small ClueCard with a LinkChip), not the stock JPG.
  1. Read the clue and type your answer.
  2. Your answer appears in the next clue, highlighted in pink.
  3. Link 5 answers to complete the chain.
- **Scoring** — Each link is worth up to 100. Hints cost 20 per letter. A wrong guess costs 10. A revealed word scores 0. Finish without hints for a +100 perfect bonus.
- **Letter check** (after Scoring) — "Guess a word with the right number of letters and we'll mark each one: ✓ right spot, ● in the word but somewhere else, plain means not in the word." Illustrate it with a real GuessRows: answer KITTEN, guess TITLES.
- **Stars** — ★★★ no hints or reveals and 2 or fewer misses · ★★ no reveals · ★ completed.
- **Replay tutorial** button.

## 8. Stats tab (D9)

- Hero row of 3 tiles: **Current streak** (flame icon) · **Chains** completed / total · **Perfect** chains.
- Grid of 2-column stat cards: Total points · Best time · Average time · Words solved · Hints used · Words revealed.
- **History** list: one row per completed chain (title, difficulty, stars, best score, best time). Tapping a row offers "Replay".
- Empty state: "No chains yet — your stats will appear here." with a Play button.
- Cards use `card` surface with `cardInk` text, `radius.lg`. No `ActivityIndicator` (stats are always defined).

## 9. Tab bar

- Same size on both platforms: icon 24, label 12, height = 56 + bottom inset. Use `bgDeep` background and a 1 px top border `rgba(255,255,255,.06)`.
- Active colour `link`; inactive `inkMuted`. Remove the Android-only 32 px icons and the 14 px label margins.

## 10. Accessibility checklist (E3)

- All text meets WCAG AA (the token pairs above are pre-checked). Don't place text on gradients.
- `allowFontScaling` stays on. Tiles and slots use `maxFontSizeMultiplier={1.3}`; the clue uses 1.6.
- Touch targets are at least 44×44. Use `hitSlop` where the visual size is smaller.
- Roles and labels:
  - Submit: role "button", label "Submit answer".
  - Hint: "Hint, costs 20 points".
  - Each tile isn't individually focusable. The tile row has the label "Answer, 5 letters. Revealed: H".
  - LinkChip: read inline as the word itself.
- A guess row is one element, not individually focusable tiles. Its label is "Your guess TITLES. Right: I in spot 2, T in spot 3, E in spot 5. Elsewhere: T. Not in the word: L, S."
- After a checked guess, the announcement is the feedback line followed by the row label.
- Nothing depends on colour alone: right and elsewhere differ in border style (solid / dashed) and marker (✓ / ●) as well as fill.
- Feedback is announced (see 2.6). On link change, announce "Link 3 of 5. {clue text without braces}".
- Reduced motion is respected everywhere (section 3).
- The web build is keyboard-operable: Enter submits, and Tab order is input → submit → hint → reveal → restart.
