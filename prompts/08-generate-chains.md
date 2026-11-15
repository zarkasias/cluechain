# Phase 08 — Generate the 30-chain starter pack

You are an expert puzzle writer and editor for **Clue Chains**. Read `CLAUDE.md`, `docs/CONTENT_GUIDE.md`, `docs/CONTENT_FORMAT.md` and `prompts/chain-writer.md`. Phase 01 must be done (the validator exists).

## Task
Create `data/chains/pack-02-starter.json` with **30 chains: 10 easy, 10 medium and 10 hard**, all family-friendly for all ages, and register it in `data/chains/index.ts` after pack-01.

## Requirements
- Follow every rule in `prompts/chain-writer.md` and `docs/CONTENT_GUIDE.md`.
- IDs: `starter-easy-01` … `starter-easy-10`, `starter-medium-01` … `starter-medium-10`, `starter-hard-01` … `starter-hard-10`.
- Theme variety: across the 30 chains, use at least 10 different themes. No theme appears more than 4 times.
- No answer is used in more than 2 chains, and none of these answers from pack-01 are reused: elephant, brain, heart, glass, hourglass, snow, sun, west, horse, saddle, chocolate, banana, canary, guitar, chords.
- Order within each difficulty from gentlest to toughest. In the file, interleave the chains so players get variety: easy, easy, medium, easy, medium, hard, … (start with 3 easy chains in the first 4).

## Process
1. Write the path list first (`ice → cone → tree → nest → egg`) for all 30 and check it for variety and repeats.
2. Write the clues.
3. **Editorial pass as a second person.** For every link, write a one-line verdict in `docs/content-review/pack-02.md`: the answer, "other possible answers?", "is the link essential?", and pass/rewrite. Rewrite anything that fails, then mark it pass.
4. Run `npm run validate:chains` and fix all errors. Address warnings or justify them in the review file.
5. Play 3 chains (one of each difficulty) in the web build and confirm the clue rendering, tiles and accept forms work.

## Done when
- [ ] The validator passes with 0 errors, and the summary is pasted into the review file.
- [ ] `docs/content-review/pack-02.md` lists all 150 links with a pass verdict.
- [ ] Commit: `phase 08: 30-chain starter pack`.
