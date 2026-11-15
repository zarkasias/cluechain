import { createSaver, freshSave, KeyValueStore, LEGACY_KEY, loadSave, SAVE_KEY } from '../storage';

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => void data.set(k, v),
    removeItem: async (k) => void data.delete(k),
  };
  return { store, data };
}

describe('loadSave', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('returns a fresh save when nothing is stored', async () => {
    const { store } = memoryStore();
    expect(await loadSave(store)).toEqual(freshSave());
  });

  it('migrates the legacy gameStats key and deletes it', async () => {
    const legacy = { chainsCompleted: 2, hintsUsed: 3, wordsGuessed: 10, bestTime: null, totalPoints: 900 };
    const { store, data } = memoryStore({ [LEGACY_KEY]: JSON.stringify(legacy) });
    const save = await loadSave(store);
    expect(save.stats).toMatchObject({ chainsCompleted: 2, hintsUsed: 3, wordsSolved: 10, totalPoints: 900 });
    expect(data.has(LEGACY_KEY)).toBe(false);
    expect(JSON.parse(data.get(SAVE_KEY)!).version).toBe(2);
  });

  it('starts fresh on corrupt JSON without throwing', async () => {
    const { store } = memoryStore({ [SAVE_KEY]: '{not json' });
    expect(await loadSave(store)).toEqual(freshSave());
    expect(console.warn).toHaveBeenCalled();
  });

  it('starts fresh on a save with the wrong version', async () => {
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify({ version: 1 }) });
    expect(await loadSave(store)).toEqual(freshSave());
  });

  it('round-trips a v2 save', async () => {
    const save = freshSave();
    save.stats.totalPoints = 42;
    save.history['classic-01'] = { stars: 2, bestScore: 400, bestTimeMs: 1000, firstCompletedAt: 'x' };
    const { store } = memoryStore({ [SAVE_KEY]: JSON.stringify(save) });
    expect(await loadSave(store)).toEqual(save);
  });
});

describe('createSaver', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('debounces writes', async () => {
    const { store } = memoryStore();
    const setItem = jest.spyOn(store, 'setItem');
    const saver = createSaver(store, 300);
    saver.schedule(freshSave());
    saver.schedule(freshSave());
    expect(setItem).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it('flush writes immediately', async () => {
    const { store, data } = memoryStore();
    const saver = createSaver(store, 300);
    saver.schedule(freshSave());
    await saver.flush();
    expect(data.has(SAVE_KEY)).toBe(true);
  });
});
