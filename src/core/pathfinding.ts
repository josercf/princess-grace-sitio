export interface Point {
  x: number;
  y: number;
}

export type Grid = readonly (readonly boolean[])[];

const DIRECTIONS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function neighbors(point: Point): Point[] {
  return DIRECTIONS.map((d) => ({ x: point.x + d.x, y: point.y + d.y }));
}

function isFree(grid: Grid, p: Point): boolean {
  const row = grid[p.y];
  return row !== undefined && p.x >= 0 && p.x < row.length && row[p.x] === false;
}

export function findPath(grid: Grid, start: Point, goal: Point): Point[] {
  const width = grid[0]?.length ?? 0;
  if (width === 0 || !isFree(grid, goal)) return [];
  if (start.x === goal.x && start.y === goal.y) return [];

  const key = (p: Point) => p.y * width + p.x;
  const fromKey = (k: number): Point => ({ x: k % width, y: Math.floor(k / width) });
  const heuristic = (p: Point) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);

  const startKey = key(start);
  const goalKey = key(goal);
  const open: number[] = [startKey];
  const cameFrom = new Map<number, number>();
  const cost = new Map<number, number>([[startKey, 0]]);
  const score = new Map<number, number>([[startKey, heuristic(start)]]);
  const closed = new Set<number>();

  while (open.length > 0) {
    open.sort((a, b) => (score.get(a) ?? Infinity) - (score.get(b) ?? Infinity));
    const current = open.shift() as number;

    if (current === goalKey) {
      const path: Point[] = [];
      let step: number | undefined = current;
      while (step !== undefined && step !== startKey) {
        path.unshift(fromKey(step));
        step = cameFrom.get(step);
      }
      return path;
    }

    closed.add(current);
    for (const next of neighbors(fromKey(current))) {
      if (!isFree(grid, next)) continue;
      const nextKey = key(next);
      if (closed.has(nextKey)) continue;
      const tentative = (cost.get(current) ?? Infinity) + 1;
      if (tentative < (cost.get(nextKey) ?? Infinity)) {
        cameFrom.set(nextKey, current);
        cost.set(nextKey, tentative);
        score.set(nextKey, tentative + heuristic(next));
        if (!open.includes(nextKey)) open.push(nextKey);
      }
    }
  }

  return [];
}

export function pathToNeighbor(grid: Grid, start: Point, target: Point): Point[] | null {
  let best: Point[] | null = null;
  for (const spot of neighbors(target)) {
    if (spot.x === start.x && spot.y === start.y) return [];
    const path = findPath(grid, start, spot);
    if (path.length > 0 && (best === null || path.length < best.length)) best = path;
  }
  return best;
}
