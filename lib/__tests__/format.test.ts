import { formatDuration } from '../format';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [7_400, '0:07'],
    [102_000, '1:42'],
    [725_000, '12:05'],
    [3_599_000, '59:59'],
    [3_600_000, '1:00:00'],
    [3_730_000, '1:02:10'],
    [-5, '0:00'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
