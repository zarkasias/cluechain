# Clue Chains — prompts for Claude Code

These prompts implement the approved review (`docs/UX_REVIEW.md`), one phase at a time.
Each phase is designed to fit in one Claude Code session and ends with checks and a commit on the branch `ux-overhaul`.

## How to run a phase

From the repo root:

```bash
claude "Read CLAUDE.md, then do prompts/01-foundation.md"
```

…or start `claude` and paste the contents of a prompt file. After each phase, review the result (`npm run dev`), then run the next one. Run `/clear` between phases so each one starts with fresh context. Every prompt tells Claude which docs to read.

| # | Prompt | Delivers | Review items |
|---|---|---|---|
| 01 | `01-foundation.md` | Content format, validator, pure game logic + tests, persistence, bug fixes, cleanup | B1–B7, E1, E2 |
| 02 | `02-play-screen.md` | New Play screen: header, chain track, clue card, letter tiles, input, feedback, action bar | D1, D3, D4, D5, D7, D8 |
| 03 | `03-carry-over-animation.md` | The signature "answer flies into the chain" moment | D2 |
| 04 | `04-recap-and-share.md` | Completion recap, stars, score breakdown, Share | D6 |
| 05 | `05-onboarding-guide-landing.md` | First-run tutorial, new Guide tab, landing polish | D9, B7 |
| 06 | `06-stats.md` | Streaks, perfect chains, averages, history, replay | D9 |
| 07 | `07-accessibility-and-qa.md` | Accessibility pass and full QA | E3 |
| 08 | `08-generate-chains.md` | 30 new family-friendly chains, validated and reviewed | Content |

Phase 08 depends only on 01, so you can run it any time after 01, even in parallel in a separate worktree.

`chain-writer.md` is a **standalone** prompt for writing more chains later. Paste it into Claude (CLI or chat) with a count, difficulty and theme.

## If something goes wrong

- Ask Claude to "re-read docs/DESIGN_SPEC.md section X and compare it to the implementation".
- To undo a phase: `git reset --hard HEAD~1` on `ux-overhaul` (main is never touched).
