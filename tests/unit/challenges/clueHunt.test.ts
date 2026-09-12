import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CANDIDATES_BY_LEVEL, clueHunt, HIDEOUTS } from '../../../src/core/challenges/clueHunt';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';
import { DICTIONARIES } from '../../../src/core/strings';
import { parseAsciiMap } from '../../../tools/maps/parse';

describe('esconderijos', () => {
  it('cada esconderijo tem três pistas nos dois idiomas e nome traduzido', () => {
    for (const hideout of HIDEOUTS) {
      expect(hideout.clues.pt).toHaveLength(3);
      expect(hideout.clues.en).toHaveLength(3);
      expect(DICTIONARIES.pt[`hideout.${hideout.id}`]).toBeDefined();
    }
  });

  it('os esconderijos do conteúdo são os mesmos do mapa do pomar', () => {
    const map = parseAsciiMap('pomar', readFileSync('maps/pomar.txt', 'utf8'));
    const onMap = map.objects.filter((o) => o.type === 'hideout').map((o) => o.name).sort();
    expect(HIDEOUTS.map((h) => h.id).sort()).toEqual(onMap);
  });
});

describe('clueHunt', () => {
  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: candidatos distintos incluem o alvo`, () => {
      for (let seed = 0; seed < 200; seed += 1) {
        const q = clueHunt.generate(level, createRng(seed), 'pt');
        expect(q.candidates).toHaveLength(CANDIDATES_BY_LEVEL[level]);
        expect(new Set(q.candidates).size).toBe(q.candidates.length);
        expect(q.candidates).toContain(q.targetId);
        expect(q.clues).toEqual(HIDEOUTS.find((h) => h.id === q.targetId)!.clues.pt);
      }
    });
  }

  it('confere o esconderijo e dá a última pista como dica', () => {
    const q = clueHunt.generate(2, createRng(4), 'en');
    expect(clueHunt.check(q, q.targetId)).toBe(true);
    expect(clueHunt.check(q, q.candidates.find((c) => c !== q.targetId)!)).toBe(false);
    expect(clueHunt.hint(q, 'en')).toBe(`Read this clue carefully again: ${q.clues[2]}`);
  });
});
