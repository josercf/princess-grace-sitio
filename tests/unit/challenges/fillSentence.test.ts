import { describe, expect, it } from 'vitest';
import { fillSentence, SENTENCES } from '../../../src/core/challenges/fillSentence';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('frases', () => {
  it('cada frase tem lacuna, resposta entre três opções distintas, nos dois idiomas', () => {
    for (const sentence of SENTENCES) {
      for (const locale of ['pt', 'en'] as const) {
        const s = sentence[locale];
        expect(s.text).toContain('___');
        expect(s.options).toHaveLength(3);
        expect(new Set(s.options).size).toBe(3);
        expect(s.options).toContain(s.answer);
      }
    }
  });

  it('existem pelo menos duas frases por nível', () => {
    for (const level of [1, 2, 3] as Level[]) {
      expect(SENTENCES.filter((s) => s.level === level).length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('fillSentence', () => {
  it('gera no idioma pedido e confere a resposta', () => {
    const q = fillSentence.generate(1, createRng(2), 'en');
    expect(q.options).toContain(q.answer);
    expect(SENTENCES.some((s) => s.en.text === q.text)).toBe(true);
    expect(fillSentence.check(q, q.answer)).toBe(true);
    expect(fillSentence.check(q, q.options.find((o) => o !== q.answer)!)).toBe(false);
  });

  it('dica cita a primeira letra em maiúscula', () => {
    expect(fillSentence.hint({ text: '', answer: 'onça', options: [] }, 'pt')).toBe('A palavra começa com "O".');
  });
});
