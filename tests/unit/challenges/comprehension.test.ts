import { describe, expect, it } from 'vitest';
import { comprehension, LEGEND, QUESTIONS_PER_ROUND } from '../../../src/core/challenges/comprehension';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('lenda', () => {
  it('a palavra-chave de cada pergunta aparece no texto do mesmo idioma', () => {
    for (const question of LEGEND.questions) {
      for (const locale of ['pt', 'en'] as const) {
        expect(LEGEND[locale].paragraphs.join(' ')).toContain(question[locale].keyword);
      }
    }
  });
});

describe('comprehension', () => {
  const optionsByLevel: Record<Level, number> = { 1: 2, 2: 3, 3: 3 };

  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: duas perguntas distintas com ${optionsByLevel[level]} opções`, () => {
      for (let seed = 0; seed < 100; seed += 1) {
        const q = comprehension.generate(level, createRng(seed), 'pt');
        expect(q.questions).toHaveLength(QUESTIONS_PER_ROUND);
        expect(new Set(q.questions.map((i) => i.prompt)).size).toBe(QUESTIONS_PER_ROUND);
        for (const item of q.questions) {
          expect(item.options).toHaveLength(optionsByLevel[level]);
          expect(item.options).toContain(item.answer);
        }
      }
    });
  }

  it('só aceita todas as respostas certas', () => {
    const q = comprehension.generate(2, createRng(8), 'pt');
    const right = q.questions.map((i) => i.answer);
    expect(comprehension.check(q, right)).toBe(true);
    expect(comprehension.check(q, [right[0]!, q.questions[1]!.options.find((o) => o !== right[1])!])).toBe(false);
    expect(comprehension.check(q, [right[0]!])).toBe(false);
  });

  it('dica aponta a palavra-chave da primeira pergunta', () => {
    const q = comprehension.generate(1, createRng(3), 'pt');
    expect(comprehension.hint(q, 'pt')).toBe(`A resposta está no texto. Procure a palavra "${q.questions[0]!.keyword}".`);
  });
});

describe('comprehension.hint com resposta', () => {
  it('aponta a palavra-chave da primeira pergunta errada', () => {
    const q = comprehension.generate(2, createRng(8), 'pt');
    const first = q.questions[0]!;
    const second = q.questions[1]!;
    const wrongSecond = second.options.find((o) => o !== second.answer)!;
    const hint = comprehension.hint(q, 'pt', [first.answer, wrongSecond]);
    expect(hint).toContain(second.keyword);
    expect(hint).not.toContain(`"${first.keyword}"`);
  });
});
