import { describe, expect, it } from 'vitest';
import { formatCompanionName } from '../../src/core/names';

describe('formatCompanionName', () => {
  it.each([
    ['MEL', 'Mel'],
    ['  pipoca ', 'Pipoca'],
    ['ÉRICA', 'Érica'],
    ['ABCDEFGHIJKLMNOP', 'Abcdefghijkl'],
    ['', ''],
  ])('%s vira %s', (raw, expected) => {
    expect(formatCompanionName(raw)).toBe(expected);
  });
});
