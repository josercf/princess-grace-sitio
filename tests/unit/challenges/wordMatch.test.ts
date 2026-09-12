import { describe, expect, it } from 'vitest';
import { VOCABULARY } from '../../../src/core/challenges/vocabulary';
import { MAX_EN_LENGTH, PAIRS_BY_LEVEL, wordMatch } from '../../../src/core/challenges/wordMatch';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('wordMatch', () => {
  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: pares distintos, do nível ou abaixo, embaralhados nas duas colunas`, () => {
      for (let seed = 0; seed < 300; seed += 1) {
        const q = wordMatch.generate(level, createRng(seed), 'pt');
        expect(q.pairs).toHaveLength(PAIRS_BY_LEVEL[level]);
        expect(new Set(q.pairs.map((p) => p.pt)).size).toBe(q.pairs.length);
        for (const pair of q.pairs) {
          const entry = VOCABULARY.find((v) => v.pt === pair.pt);
          expect(entry?.en).toBe(pair.en);
          expect(entry!.level).toBeLessThanOrEqual(level);
          expect(pair.en.length).toBeLessThanOrEqual(MAX_EN_LENGTH);
        }
        expect([...q.left].sort()).toEqual(q.pairs.map((p) => p.pt).sort());
        expect([...q.right].sort()).toEqual(q.pairs.map((p) => p.en).sort());
      }
    });
  }

  it('aceita todos os pares certos e rejeita troca ou falta', () => {
    const q = wordMatch.generate(1, createRng(5), 'pt');
    const right = Object.fromEntries(q.pairs.map((p) => [p.pt, p.en]));
    expect(wordMatch.check(q, right)).toBe(true);
    const [a, b] = q.pairs;
    expect(wordMatch.check(q, { ...right, [a!.pt]: b!.en, [b!.pt]: a!.en })).toBe(false);
    const missing = { ...right };
    delete missing[a!.pt];
    expect(wordMatch.check(q, missing)).toBe(false);
  });

  it('dica mostra o primeiro par', () => {
    const q = { pairs: [{ pt: 'LUA', en: 'MOON' }], left: ['LUA'], right: ['MOON'] };
    expect(wordMatch.hint(q, 'pt')).toBe('Comece por "LUA". Em inglês: "MOON".');
  });
});
