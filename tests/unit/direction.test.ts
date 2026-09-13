import { describe, expect, it } from 'vitest';
import { directionOf, frameIndex, WALK_DIRECTIONS } from '../../src/core/direction';

describe('directionOf', () => {
  it.each([
    [{ x: 1, y: 1 }, { x: 2, y: 1 }, 'right'],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, 'left'],
    [{ x: 1, y: 1 }, { x: 1, y: 2 }, 'down'],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, 'up'],
  ] as const)('de %o para %o olha para %s', (from, to, expected) => {
    expect(directionOf(from, to)).toBe(expected);
  });

  it('no movimento diagonal prevalece o eixo com maior deslocamento', () => {
    expect(directionOf({ x: 0, y: 0 }, { x: 3, y: 1 })).toBe('right');
    expect(directionOf({ x: 0, y: 0 }, { x: 1, y: -3 })).toBe('up');
  });

  it('sem deslocamento mantém a direção anterior', () => {
    expect(directionOf({ x: 2, y: 2 }, { x: 2, y: 2 }, 'left')).toBe('left');
    expect(directionOf({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe('down');
  });
});

describe('frameIndex', () => {
  it('segue a ordem baixo, esquerda, direita, cima', () => {
    expect(WALK_DIRECTIONS).toEqual(['down', 'left', 'right', 'up']);
  });

  it('calcula o quadro dentro da faixa da direção', () => {
    expect(frameIndex('down', 4, 0)).toBe(0);
    expect(frameIndex('left', 4, 1)).toBe(5);
    expect(frameIndex('right', 2, 1)).toBe(5);
    expect(frameIndex('up', 4, 3)).toBe(15);
  });

  it('volta ao primeiro passo depois do último', () => {
    expect(frameIndex('up', 4, 4)).toBe(12);
  });
});
