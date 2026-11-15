import { defaultSettings } from './reducer';
import { emptyStats } from './stats';
import type { History, SaveV2, Settings, Stats } from './types';

export const SAVE_KEY = 'cluechain:v2';
export const LEGACY_KEY = 'gameStats';
export const SAVE_DEBOUNCE_MS = 300;

/**
 * The subset of AsyncStorage this module needs. Injected so `lib/game` stays
 * free of React Native imports and is easy to test.
 */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function freshSave(): SaveV2 {
  return { version: 2, progress: null, history: {}, stats: emptyStats(), settings: defaultSettings() };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function coerceStats(raw: unknown): Stats {
  const base = emptyStats();
  if (!isObject(raw)) return base;
  return {
    chainsCompleted: num(raw.chainsCompleted),
    perfectChains: num(raw.perfectChains),
    totalPoints: num(raw.totalPoints),
    wordsSolved: num(raw.wordsSolved),
    hintsUsed: num(raw.hintsUsed),
    wordsRevealed: num(raw.wordsRevealed),
    bestTimeMs: typeof raw.bestTimeMs === 'number' ? raw.bestTimeMs : null,
    totalTimeMs: num(raw.totalTimeMs),
    currentStreak: num(raw.currentStreak),
    bestStreak: num(raw.bestStreak),
    lastPlayedDay: typeof raw.lastPlayedDay === 'string' ? raw.lastPlayedDay : null,
  };
}

function coerceSettings(raw: unknown): Settings {
  const base = defaultSettings();
  if (!isObject(raw)) return base;
  return {
    seenTutorial: typeof raw.seenTutorial === 'boolean' ? raw.seenTutorial : base.seenTutorial,
    haptics: typeof raw.haptics === 'boolean' ? raw.haptics : base.haptics,
  };
}

function coerceHistory(raw: unknown): History {
  if (!isObject(raw)) return {};
  const out: History = {};
  for (const [id, e] of Object.entries(raw)) {
    if (!isObject(e)) continue;
    const s = e.stars;
    out[id] = {
      stars: s === 1 || s === 2 || s === 3 ? s : 1,
      bestScore: num(e.bestScore),
      bestTimeMs: num(e.bestTimeMs),
      firstCompletedAt: typeof e.firstCompletedAt === 'string' ? e.firstCompletedAt : '',
    };
  }
  return out;
}

/** Validates a parsed v2 save, filling in anything missing. Throws if it isn't a v2 save. */
export function parseSave(json: string): SaveV2 {
  const raw: unknown = JSON.parse(json);
  if (!isObject(raw) || raw.version !== 2) throw new Error('Not a v2 save');
  return {
    version: 2,
    // The reducer validates progress against the content on HYDRATE.
    progress: isObject(raw.progress) ? (raw.progress as SaveV2['progress']) : null,
    history: coerceHistory(raw.history),
    stats: coerceStats(raw.stats),
    settings: coerceSettings(raw.settings),
  };
}

/** Maps the legacy `gameStats` blob to a v2 save. */
export function migrateLegacy(json: string): SaveV2 {
  const save = freshSave();
  const raw: unknown = JSON.parse(json);
  if (!isObject(raw)) return save;
  save.stats.chainsCompleted = num(raw.chainsCompleted);
  save.stats.hintsUsed = num(raw.hintsUsed);
  save.stats.wordsSolved = num(raw.wordsGuessed);
  save.stats.totalPoints = num(raw.totalPoints);
  return save;
}

/** Loads the save. Never throws: corrupt data is logged and replaced with a fresh save. */
export async function loadSave(store: KeyValueStore): Promise<SaveV2> {
  let json: string | null;
  try {
    json = await store.getItem(SAVE_KEY);
  } catch (e) {
    console.warn('[storage] could not read save', e);
    return freshSave();
  }

  if (json !== null) {
    try {
      return parseSave(json);
    } catch (e) {
      console.warn('[storage] corrupt save, starting fresh', e);
      return freshSave();
    }
  }

  try {
    const legacy = await store.getItem(LEGACY_KEY);
    if (legacy === null) return freshSave();
    let save: SaveV2;
    try {
      save = migrateLegacy(legacy);
    } catch (e) {
      console.warn('[storage] corrupt legacy stats, starting fresh', e);
      save = freshSave();
    }
    // Write the new save before deleting the legacy key, so nothing is lost.
    await store.setItem(SAVE_KEY, JSON.stringify(save));
    await store.removeItem(LEGACY_KEY);
    return save;
  } catch (e) {
    console.warn('[storage] legacy migration failed', e);
    return freshSave();
  }
}

export async function writeSave(store: KeyValueStore, save: SaveV2): Promise<void> {
  try {
    await store.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('[storage] could not write save', e);
  }
}

/** A debounced saver: `schedule` waits `delayMs` after the last call; `flush` writes now. */
export function createSaver(store: KeyValueStore, delayMs = SAVE_DEBOUNCE_MS) {
  let pending: SaveV2 | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    if (timer) clearTimeout(timer);
    timer = null;
    const save = pending;
    pending = null;
    if (save) await writeSave(store, save);
  };

  const schedule = (save: SaveV2) => {
    pending = save;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), delayMs);
  };

  return { schedule, flush };
}
