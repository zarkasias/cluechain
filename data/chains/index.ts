import type { Chain } from '../../lib/game/types';
import pack01 from './pack-01-classic.json';
import pack02 from './pack-02-starter.json';

// JSON imports infer `links` as an array, not a 5-tuple. `npm run validate:chains`
// enforces the schema, so the cast is safe.
const packs = [pack01, pack02] as unknown as Chain[][];

export const chains: Chain[] = packs.flat();
