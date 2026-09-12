import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/rng';

describe('createRng', () => {
  it('repete a sequência com a mesma semente', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });

  it('muda a sequência com outra semente', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });

  it('next fica em [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int inclui os dois limites e nada fora deles', () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 5_000; i += 1) seen.add(rng.int(2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('shuffle devolve uma permutação sem alterar a entrada', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = createRng(9).shuffle(input);
    expect([...output].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('pick em lista vazia lança erro', () => {
    expect(() => createRng(1).pick([])).toThrow(/vazia/);
  });
});
