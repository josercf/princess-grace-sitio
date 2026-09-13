import type { Point } from './pathfinding';

export type Direction = 'down' | 'left' | 'right' | 'up';

// Ordem das faixas de quadros nas folhas de sprite do mapa.
export const WALK_DIRECTIONS: readonly Direction[] = ['down', 'left', 'right', 'up'];

export function directionOf(from: Point, to: Point, fallback: Direction = 'down'): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

export function frameIndex(direction: Direction, framesPerDirection: number, step: number): number {
  return WALK_DIRECTIONS.indexOf(direction) * framesPerDirection + (step % framesPerDirection);
}
