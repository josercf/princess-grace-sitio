import { describe, expect, it } from 'vitest';
import { lettersOf, VOCABULARY } from '../../../src/core/challenges/vocabulary';
import { DISTRACTORS_BY_LEVEL, wordBuild } from '../../../src/core/challenges/wordBuild';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

const LEVELS: Level[] = [1, 2, 3];

describe('vocabulário', () => {
  it('tem pelo menos 5 palavras por nível e nenhuma repetida', () => {
    for (const level of LEVELS) expect(VOCABULARY.filter((v) => v.level === level).length).toBeGreaterThanOrEqual(5);
    expect(new Set(VOCABULARY.map((v) => v.pt)).size).toBe(VOCABULARY.length);
    expect(new Set(VOCABULARY.map((v) => v.en)).size).toBe(VOCABULARY.length);
  });

  it('lettersOf mantém acentos e cedilha como uma letra', () => {
    expect(lettersOf('PAÇOCA')).toEqual(['P', 'A', 'Ç', 'O', 'C', 'A']);
  });
});

describe('wordBuild', () => {
  for (const level of LEVELS) {
    it(`nível ${level}: as peças contêm a palavra e os distratores certos`, () => {
      for (let seed = 0; seed < 300; seed += 1) {
        const q = wordBuild.generate(level, createRng(seed), 'pt');
        expect(VOCABULARY.find((v) => v.pt === q.word)?.level).toBe(level);
        expect(q.tiles).toHaveLength(q.letters.length + DISTRACTORS_BY_LEVEL[level]);
        const remaining = [...q.tiles];
        for (const letter of q.letters) {
          const index = remaining.indexOf(letter);
          expect(index).toBeGreaterThanOrEqual(0);
          remaining.splice(index, 1);
        }
      }
    });
  }

  it('aceita a ordem certa e rejeita outra', () => {
    const q = wordBuild.generate(2, createRng(1), 'pt');
    expect(wordBuild.check(q, q.letters)).toBe(true);
    expect(wordBuild.check(q, [...q.letters].reverse())).toBe(false);
    expect(wordBuild.check(q, q.letters.slice(1))).toBe(false);
  });

  it('dica cita a primeira letra e o tamanho nos dois idiomas', () => {
    const q = { word: 'SAPO', letters: ['S', 'A', 'P', 'O'], clue: 'FROG', tiles: [] };
    expect(wordBuild.hint(q, 'pt')).toBe('A palavra começa com "S" e tem 4 letras.');
    expect(wordBuild.hint(q, 'en')).toBe('The word starts with "S" and has 4 letters.');
  });
});
