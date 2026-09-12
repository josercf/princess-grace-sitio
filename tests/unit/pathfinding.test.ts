import { describe, expect, it } from 'vitest';
import { findPath, pathToNeighbor, type Grid } from '../../src/core/pathfinding';

function grid(rows: string[]): Grid {
  return rows.map((row) => Array.from(row).map((ch) => ch === '#'));
}

describe('findPath', () => {
  it('anda em linha reta', () => {
    expect(findPath(grid(['...']), { x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  it('contorna obstáculo com o menor número de passos', () => {
    const path = findPath(grid(['.#.', '...']), { x: 0, y: 0 }, { x: 2, y: 0 });
    expect(path).toHaveLength(4);
    expect(path.at(-1)).toEqual({ x: 2, y: 0 });
    expect(path.some((p) => p.x === 1 && p.y === 0)).toBe(false);
  });

  it('retorna vazio sem caminho, com destino bloqueado, fora da grade ou no mesmo ponto', () => {
    const g = grid(['.#.', '.#.']);
    expect(findPath(g, { x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 9, y: 9 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 0, y: 0 })).toEqual([]);
  });
});

describe('pathToNeighbor', () => {
  it('vai até o lado de um alvo bloqueado', () => {
    const path = pathToNeighbor(grid(['....#']), { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path?.at(-1)).toEqual({ x: 3, y: 0 });
  });

  it('retorna vazio quando já está ao lado', () => {
    expect(pathToNeighbor(grid(['.#']), { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([]);
  });

  it('retorna null quando nenhum vizinho é alcançável', () => {
    expect(pathToNeighbor(grid(['.#.#.']), { x: 0, y: 0 }, { x: 2, y: 0 })).toBeNull();
  });
});
