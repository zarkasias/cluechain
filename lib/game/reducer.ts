import { isCorrect, isNearMiss, maxHintLetters, normalize } from './answers';
import { chainScore, linkValue, newLinkState, stars } from './scoring';
import { applyFirstCompletion, emptyStats, localDayISO } from './stats';
import type { Chain, ChainResult, GameAction, GameState, LinkState, SaveV2, Settings } from './types';

export const LINKS_PER_CHAIN = 5;

export function defaultSettings(): Settings {
  return { seenTutorial: false, haptics: true };
}

function freshLinks(): LinkState[] {
  return Array.from({ length: LINKS_PER_CHAIN }, newLinkState);
}

/** The first chain, in content order, that isn't in `history`; `null` if all are done. */
export function firstUnfinishedChainId(chains: Chain[], history: GameState['history']): string | null {
  return chains.find((c) => !history[c.id])?.id ?? null;
}

export function createInitialState(chains: Chain[]): GameState {
  return {
    chainId: chains[0]?.id ?? null,
    linkIndex: 0,
    links: freshLinks(),
    elapsedMs: 0,
    lastOutcome: null,
    history: {},
    stats: emptyStats(),
    settings: defaultSettings(),
    hydrated: false,
  };
}

// ---------- selectors ----------

export function currentChain(chains: Chain[], state: GameState): Chain | null {
  return chains.find((c) => c.id === state.chainId) ?? null;
}

export function isChainComplete(state: GameState): boolean {
  return state.chainId !== null && state.links.length > 0 && state.links.every((l) => l.solved);
}

export function chainResult(state: GameState): ChainResult | null {
  if (!isChainComplete(state) || state.chainId === null) return null;
  const { links } = state;
  return {
    chainId: state.chainId,
    score: chainScore(links),
    stars: stars(links),
    timeMs: state.elapsedMs,
    hintLetters: links.reduce((n, l) => n + l.hintLetters, 0),
    wrongGuesses: links.reduce((n, l) => n + l.wrongGuesses, 0),
    wordsRevealed: links.filter((l) => l.revealed).length,
    wordsSolved: links.filter((l) => l.solved && !l.revealed).length,
  };
}

export function canHint(chains: Chain[], state: GameState): boolean {
  const chain = currentChain(chains, state);
  if (!chain || isChainComplete(state)) return false;
  return state.links[state.linkIndex].hintLetters < maxHintLetters(chain.links[state.linkIndex]);
}

/** Build the persisted save from the game state. */
export function toSave(state: GameState): SaveV2 {
  return {
    version: 2,
    progress:
      state.chainId === null
        ? null
        : { chainId: state.chainId, linkIndex: state.linkIndex, links: state.links, elapsedMs: state.elapsedMs },
    history: state.history,
    stats: state.stats,
    settings: state.settings,
  };
}

// ---------- reducer ----------

function startChain(state: GameState, chainId: string | null): GameState {
  return { ...state, chainId, linkIndex: 0, links: freshLinks(), elapsedMs: 0, lastOutcome: null };
}

function updateLink(links: LinkState[], index: number, patch: Partial<LinkState>): LinkState[] {
  return links.map((l, i) => {
    if (i !== index) return l;
    const next = { ...l, ...patch };
    return { ...next, value: linkValue(next) };
  });
}

/** Marks the current link solved, then either advances or records the completion. */
function solveCurrentLink(state: GameState, revealed: boolean, now: number): GameState {
  const links = updateLink(state.links, state.linkIndex, { solved: true, revealed });
  const isLast = state.linkIndex >= LINKS_PER_CHAIN - 1;
  const next: GameState = {
    ...state,
    links,
    linkIndex: isLast ? state.linkIndex : state.linkIndex + 1,
    lastOutcome: revealed ? null : 'correct',
  };
  if (!isLast) return next;

  const result = chainResult(next);
  if (!result) return next;
  const previous = state.history[result.chainId];

  if (!previous) {
    return {
      ...next,
      stats: applyFirstCompletion(state.stats, result, localDayISO(now)),
      history: {
        ...state.history,
        [result.chainId]: {
          stars: result.stars,
          bestScore: result.score,
          bestTimeMs: result.timeMs,
          firstCompletedAt: new Date(now).toISOString(),
        },
      },
    };
  }

  // Replay: personal bests only. Stats are untouched.
  return {
    ...next,
    history: {
      ...state.history,
      [result.chainId]: {
        ...previous,
        stars: Math.max(previous.stars, result.stars) as typeof previous.stars,
        bestScore: Math.max(previous.bestScore, result.score),
        bestTimeMs: Math.min(previous.bestTimeMs, result.timeMs),
      },
    },
  };
}

function isValidLinkState(l: unknown): l is LinkState {
  if (typeof l !== 'object' || l === null) return false;
  const o = l as Record<string, unknown>;
  return (
    typeof o.hintLetters === 'number' &&
    typeof o.wrongGuesses === 'number' &&
    typeof o.revealed === 'boolean' &&
    typeof o.solved === 'boolean'
  );
}

function hydrate(chains: Chain[], state: GameState, save: SaveV2): GameState {
  const base: GameState = {
    ...state,
    history: save.history,
    stats: save.stats,
    settings: save.settings,
    hydrated: true,
    lastOutcome: null,
  };
  const p = save.progress;
  const chain = p ? chains.find((c) => c.id === p.chainId) : undefined;
  const progressOk =
    p &&
    chain &&
    Number.isInteger(p.linkIndex) &&
    p.linkIndex >= 0 &&
    p.linkIndex < LINKS_PER_CHAIN &&
    Array.isArray(p.links) &&
    p.links.length === LINKS_PER_CHAIN &&
    p.links.every(isValidLinkState);

  if (!progressOk || !p) {
    return startChain(base, firstUnfinishedChainId(chains, save.history));
  }
  return {
    ...base,
    chainId: p.chainId,
    linkIndex: p.linkIndex,
    links: p.links.map((l) => ({ ...l, value: linkValue(l) })),
    elapsedMs: Math.max(0, Number(p.elapsedMs) || 0),
  };
}

export function createReducer(chains: Chain[]) {
  return function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'SUBMIT_GUESS': {
        const chain = currentChain(chains, state);
        if (!chain || isChainComplete(state)) return state;
        if (!normalize(action.guess)) return state; // empty input is ignored, not a miss
        const link = chain.links[state.linkIndex];
        if (isCorrect(action.guess, link)) {
          return solveCurrentLink(state, false, action.now ?? Date.now());
        }
        if (isNearMiss(action.guess, link)) {
          return { ...state, lastOutcome: 'near' };
        }
        const wrongGuesses = state.links[state.linkIndex].wrongGuesses + 1;
        return {
          ...state,
          links: updateLink(state.links, state.linkIndex, { wrongGuesses }),
          lastOutcome: 'wrong',
        };
      }

      case 'CLEAR_FEEDBACK':
        return state.lastOutcome === null ? state : { ...state, lastOutcome: null };

      case 'HINT': {
        if (!canHint(chains, state)) return state;
        const hintLetters = state.links[state.linkIndex].hintLetters + 1;
        return { ...state, links: updateLink(state.links, state.linkIndex, { hintLetters }), lastOutcome: null };
      }

      case 'REVEAL': {
        if (!currentChain(chains, state) || isChainComplete(state)) return state;
        return solveCurrentLink(state, true, action.now ?? Date.now());
      }

      case 'RESTART':
        if (state.chainId === null) return state;
        return startChain(state, state.chainId);

      case 'NEXT_CHAIN':
        return startChain(state, firstUnfinishedChainId(chains, state.history));

      case 'REPLAY_CHAIN':
        if (!chains.some((c) => c.id === action.id)) return state;
        return startChain(state, action.id);

      case 'TICK':
        if (state.chainId === null || isChainComplete(state) || action.ms <= 0) return state;
        return { ...state, elapsedMs: state.elapsedMs + action.ms };

      case 'HYDRATE':
        return hydrate(chains, state, action.save);

      case 'COMPLETE_TUTORIAL':
        return { ...state, settings: { ...state.settings, seenTutorial: true } };

      default:
        return state;
    }
  };
}
