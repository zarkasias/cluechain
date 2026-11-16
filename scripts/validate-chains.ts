/**
 * Validates every pack in data/chains/*.json against docs/CONTENT_FORMAT.md.
 * Exits non-zero on any error; warnings are printed but don't fail.
 *
 *   npm run validate:chains
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { matchesForm, normalize } from '../lib/game/answers';
import { clueText, parseClue } from '../lib/game/clue';

const ROOT = resolve(__dirname, '..');
const CHAINS_DIR = join(ROOT, 'data', 'chains');
const WATCHLIST = join(ROOT, 'scripts', 'watchlist.txt');

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ANSWER_SHAPE = /^[a-z]+( [a-z]+)?$/;

type Issue = { where: string; message: string };
const errors: Issue[] = [];
const warnings: Issue[] = [];
const error = (where: string, message: string) => errors.push({ where, message });
const warn = (where: string, message: string) => warnings.push({ where, message });

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const containsWord = (text: string, word: string) =>
  word.trim() !== '' && new RegExp(`(^|[^a-z0-9])${escapeRe(word.toLowerCase())}($|[^a-z0-9])`).test(text.toLowerCase());

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function loadWatchlist(): string[] {
  try {
    return readFileSync(WATCHLIST, 'utf8')
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith('#'));
  } catch {
    warn('scripts/watchlist.txt', 'watch list not found; skipping family-friendliness check');
    return [];
  }
}

const watchlist = loadWatchlist();
const seenIds = new Map<string, string>(); // id → file
const answerChains = new Map<string, Set<string>>(); // normalized answer → chain ids
let chainCount = 0;
let linkCount = 0;

const files = readdirSync(CHAINS_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (files.length === 0) error('data/chains', 'no pack files found');

for (const file of files) {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(join(CHAINS_DIR, file), 'utf8'));
  } catch (e) {
    error(file, `does not parse as JSON: ${(e as Error).message}`);
    continue;
  }
  if (!Array.isArray(data)) {
    error(file, 'the top level must be an array of chains');
    continue;
  }

  const difficultyCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };

  data.forEach((chain: unknown, ci) => {
    const cwhere = `${file}[${ci}]`;
    if (!isObj(chain)) return error(cwhere, 'chain must be an object');
    chainCount++;

    // Error 2: id
    const id = chain.id;
    const where = typeof id === 'string' ? `${file} ${id}` : cwhere;
    if (typeof id !== 'string' || !KEBAB.test(id)) {
      error(where, `id must be kebab-case (got ${JSON.stringify(id)})`);
    } else if (seenIds.has(id)) {
      error(where, `duplicate id (also in ${seenIds.get(id)})`);
    } else {
      seenIds.set(id, file);
    }

    // Error 1: schema
    if (typeof chain.title !== 'string' || chain.title.length < 3 || chain.title.length > 40) {
      error(where, 'title must be a string of 3–40 characters');
    }
    if (typeof chain.difficulty !== 'string' || !(DIFFICULTIES as readonly string[]).includes(chain.difficulty)) {
      error(where, `difficulty must be one of ${DIFFICULTIES.join(', ')}`);
    } else {
      difficultyCounts[chain.difficulty]++;
    }
    if (chain.theme !== undefined && typeof chain.theme !== 'string') error(where, 'theme must be a string');
    if (!Array.isArray(chain.links) || chain.links.length !== 5) {
      return error(where, 'links must be an array of exactly 5 links');
    }

    const seenAnswers = new Set<string>();
    let prev: { answer: string; accept: string[] } | null = null;

    chain.links.forEach((link: unknown, li) => {
      const lwhere = `${where} link ${li + 1}`;
      linkCount++;
      if (!isObj(link) || typeof link.clue !== 'string' || typeof link.answer !== 'string') {
        prev = null;
        return error(lwhere, 'link must have string "clue" and "answer"');
      }
      const accept = link.accept ?? [];
      if (!Array.isArray(accept) || !accept.every((a) => typeof a === 'string')) {
        prev = null;
        return error(lwhere, 'accept must be an array of strings');
      }
      const { clue, answer } = link;
      const norm = normalize(answer);

      // Error 3: markers
      const markers = parseClue(clue).filter((s) => s.isLink);
      if (li === 0) {
        if (markers.length > 0) error(lwhere, 'link 1 must not contain a {MARKER}');
      } else if (markers.length !== 1) {
        error(lwhere, `links 2–5 need exactly one {MARKER} (found ${markers.length})`);
      } else if (prev) {
        const p: { answer: string; accept: string[] } = prev;
        const marker = markers[0].text;
        if (![p.answer, ...p.accept].some((form) => matchesForm(marker, form))) {
          error(lwhere, `marker {${marker}} doesn't match the previous answer "${p.answer}"`);
        }
      }
      if (/[{}]/.test(clueText(clue))) error(lwhere, 'clue has an unbalanced brace');

      // Error 4: answer shape
      if (!answer || !ANSWER_SHAPE.test(answer)) {
        error(lwhere, `answer "${answer}" must be lowercase letters with at most one single space`);
      }
      if (norm.length < 2 || norm.length > 20) error(lwhere, `answer "${answer}" must be 2–20 letters`);

      // Error 5: clue gives the answer away
      const readable = clueText(clue);
      for (const form of [answer, ...accept]) {
        if (containsWord(readable, form)) error(lwhere, `clue contains its own answer "${form}"`);
      }

      // Error 6: repeated answer in chain
      if (seenAnswers.has(norm)) error(lwhere, `answer "${answer}" repeats within the chain`);
      seenAnswers.add(norm);

      // Error 7: accept list. Compared literally (case-insensitive), not normalized:
      // spelling variants such as "hour glass" for "hourglass" are allowed.
      const literal = (s: string) => s.trim().toLowerCase();
      const acceptLits = accept.map(literal);
      if (new Set(acceptLits).size !== acceptLits.length) error(lwhere, 'accept has duplicates');
      if (acceptLits.includes(literal(answer))) error(lwhere, 'accept includes the answer itself');

      // Warnings 1, 2, 5
      if (norm.length > 10) warn(lwhere, `answer "${answer}" is longer than 10 letters`);
      if (readable.length > 90) warn(lwhere, `clue is ${readable.length} characters (over 90)`);
      for (const word of watchlist) {
        if (containsWord(readable, word) || containsWord(answer, word)) {
          warn(lwhere, `contains watch-list word "${word}" — review for family-friendliness`);
        }
      }

      if (typeof id === 'string') {
        if (!answerChains.has(norm)) answerChains.set(norm, new Set());
        answerChains.get(norm)!.add(id);
      }
      prev = { answer, accept };
    });
  });

  // Warning 4: difficulty mix
  const counts = Object.values(difficultyCounts);
  if (data.length > 0 && Math.max(...counts) - Math.min(...counts) > 1) {
    warn(
      file,
      `difficulty mix is unbalanced (easy ${difficultyCounts.easy}, medium ${difficultyCounts.medium}, hard ${difficultyCounts.hard})`,
    );
  }
}

// Warning 3: answers reused across chains
for (const [answer, ids] of answerChains) {
  if (ids.size > 2) warn('all packs', `answer "${answer}" appears in ${ids.size} chains: ${[...ids].join(', ')}`);
}

for (const e of errors) console.error(`ERROR    ${e.where}: ${e.message}`);
for (const w of warnings) console.warn(`warning  ${w.where}: ${w.message}`);
console.log(
  `${chainCount} chains · ${linkCount} links · ${errors.length} error${errors.length === 1 ? '' : 's'} · ` +
    `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`,
);
process.exit(errors.length > 0 ? 1 : 0);
