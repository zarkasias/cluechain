export type Difficulty = 'easy' | 'medium' | 'hard';

export type Link = {
  /** Shown to the player. Links 2–5 contain exactly one `{MARKER}`. */
  clue: string;
  /** Canonical answer: lowercase letters, at most one space. */
  answer: string;
  /** Other answers accepted as correct. */
  accept?: string[];
};

export type Chain = {
  id: string;
  title: string;
  difficulty: Difficulty;
  theme?: string;
  links: [Link, Link, Link, Link, Link];
};

export type LinkState = {
  hintLetters: number;
  wrongGuesses: number;
  revealed: boolean;
  solved: boolean;
  /** Current value of this link, per the scoring rules. */
  value: number;
};

export type Stars = 1 | 2 | 3;

export type Outcome = 'correct' | 'near' | 'wrong';

export type Stats = {
  chainsCompleted: number;
  perfectChains: number;
  totalPoints: number;
  wordsSolved: number;
  hintsUsed: number;
  wordsRevealed: number;
  bestTimeMs: number | null;
  totalTimeMs: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDay: string | null;
};

export type HistoryEntry = {
  stars: Stars;
  bestScore: number;
  bestTimeMs: number;
  firstCompletedAt: string;
};

export type History = Record<string, HistoryEntry>;

export type Settings = {
  seenTutorial: boolean;
  haptics: boolean;
  /** Override for reduced motion. `null` follows the system setting. */
  reduceMotion: boolean | null;
};

/**
 * What a completion meant, worked out when the last link is solved (before
 * `history` and `stats` are updated, so the recap can compare against them).
 */
export type Completion = {
  /** True the first time this chain is completed; false for a replay. */
  first: boolean;
  /** First completion with 3 stars. */
  perfect: boolean;
  /** First completion that beat the previous overall best time (`stats.bestTimeMs`). */
  newBestTime: boolean;
  /** Replay only: the chain's history entry before this run. */
  previous: HistoryEntry | null;
};

export type Progress = {
  chainId: string;
  linkIndex: number;
  links: LinkState[];
  elapsedMs: number;
  /** Present once the chain is complete, so the recap survives an app restart. */
  completion?: Completion | null;
};

export type SaveV2 = {
  version: 2;
  progress: Progress | null;
  history: History;
  stats: Stats;
  settings: Settings;
};

/** The result of a completed chain. */
export type ChainResult = {
  chainId: string;
  score: number;
  stars: Stars;
  timeMs: number;
  hintLetters: number;
  wrongGuesses: number;
  wordsRevealed: number;
  wordsSolved: number;
  /** Per-link outcomes, in order. */
  links: LinkState[];
};

export type GameState = {
  /** `null` once every chain has been completed (the "All chains complete" state). */
  chainId: string | null;
  /** 0–4. Stays at 4 once the chain is complete. */
  linkIndex: number;
  links: LinkState[];
  elapsedMs: number;
  lastOutcome: Outcome | null;
  /** Set when the current chain is complete; `null` otherwise. */
  completion: Completion | null;
  history: History;
  stats: Stats;
  settings: Settings;
  /** True once the save has been loaded from storage. */
  hydrated: boolean;
};

export type GameAction =
  /** `now` (epoch ms) is only for tests; it defaults to `Date.now()`. */
  | { type: 'SUBMIT_GUESS'; guess: string; now?: number }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'HINT' }
  | { type: 'REVEAL'; now?: number }
  | { type: 'RESTART' }
  | { type: 'NEXT_CHAIN' }
  | { type: 'REPLAY_CHAIN'; id: string }
  | { type: 'TICK'; ms: number }
  | { type: 'HYDRATE'; save: SaveV2 }
  | { type: 'COMPLETE_TUTORIAL' };
