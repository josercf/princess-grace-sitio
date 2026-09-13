import { writeFileSync } from 'node:fs';

type Grid = string[][];
type Direction = 'down' | 'left' | 'right' | 'up';

const DIRECTION_ORDER: readonly Direction[] = ['down', 'left', 'right', 'up'];

function blank(width: number, height: number): Grid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => '.'));
}

function set(grid: Grid, x: number, y: number, color: string): void {
  const row = grid[y];
  if (row && x >= 0 && x < row.length) row[x] = color;
}

function rect(grid: Grid, x0: number, y0: number, x1: number, y1: number, color: string): void {
  for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) set(grid, x, y, color);
}

function ellipse(grid: Grid, cx: number, cy: number, rx: number, ry: number, color: (x: number, y: number) => string): void {
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < (grid[0]?.length ?? 0); x += 1) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(grid, x, y, color(x, y));
    }
  }
}

function outline(grid: Grid): Grid {
  const out = grid.map((row) => [...row]);
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < (grid[0]?.length ?? 0); x += 1) {
      if (grid[y]![x] !== '.') continue;
      const touches = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => {
        const value = grid[y + dy!]?.[x + dx!];
        return value !== undefined && value !== '.' && value !== 'k';
      });
      if (touches) out[y]![x] = 'k';
    }
  }
  return out;
}

function mirror(grid: Grid): Grid {
  return grid.map((row) => [...row].reverse());
}

// Grace, 24×32: coroa, cabelo castanho claro comprido, óculos lilás, vestido rosa com flores.
// Contorno é adicionado depois, então o desenho usa x de 1 a 22 e y de 1 a 30.
function graceFrame(direction: Direction, step: number): Grid {
  const g = blank(24, 32);
  const leftLegDown = step === 1 ? 1 : 0;
  const rightLegDown = step === 3 ? 1 : 0;
  const bob = step === 1 || step === 3 ? 1 : 0;
  const hair = (x: number) => (x === 9 || x === 15 ? 'y' : 'h');

  // Pernas e sapatos.
  if (direction === 'left' || direction === 'right') {
    const front = step === 1 ? 2 : step === 3 ? -2 : 0;
    rect(g, 11 + front, 26, 12 + front, 29, 's');
    rect(g, 11 + front, 30, 13 + front, 30, 'P');
    rect(g, 11 - front, 26, 12 - front, 29, 'S');
    rect(g, 11 - front, 30, 13 - front, 30, 'P');
  } else {
    rect(g, 9, 26, 10, 29 - rightLegDown, 's');
    rect(g, 9, 30 - rightLegDown, 10, 30 - rightLegDown, 'P');
    rect(g, 13, 26, 14, 29 - leftLegDown, 's');
    rect(g, 13, 30 - leftLegDown, 14, 30 - leftLegDown, 'P');
  }

  const top = bob;

  // Cabelo longo atrás, até a cintura.
  if (direction === 'down') {
    rect(g, 4, 6 + top, 6, 20 + top, 'h');
    rect(g, 17, 6 + top, 19, 20 + top, 'h');
    set(g, 5, 12 + top, 'y');
    set(g, 18, 12 + top, 'y');
  } else if (direction === 'up') {
    rect(g, 5, 6 + top, 18, 20 + top, 'h');
    for (let y = 6 + top; y <= 20 + top; y += 1) {
      set(g, 9, y, 'y');
      set(g, 14, y, 'y');
      set(g, 5, y, 'H');
      set(g, 18, y, 'H');
    }
  } else {
    rect(g, 12, 6 + top, 17, 20 + top, 'h');
    for (let y = 6 + top; y <= 20 + top; y += 1) set(g, 15, y, 'y');
    rect(g, 16, 8 + top, 17, 20 + top, 'H');
  }


  // Vestido em trapézio, com florzinhas brancas.
  for (let y = 14 + top; y <= 26; y += 1) {
    const spread = Math.floor((y - 14 - top) / 3);
    const x0 = direction === 'left' || direction === 'right' ? 8 - Math.min(spread, 2) : 7 - spread;
    const x1 = direction === 'left' || direction === 'right' ? 15 + Math.min(spread, 2) : 16 + spread;
    for (let x = x0; x <= x1; x += 1) {
      const edge = x === x0 || x === x1;
      const flower = (x * 3 + y * 5) % 11 === 0 && y > 16 + top && !edge;
      set(g, x, y, edge ? 'P' : flower ? 'w' : 'p');
    }
  }

  // Braços.
  if (direction === 'down' || direction === 'up') {
    rect(g, 5, 16 + top, 6, 21 + top, direction === 'up' ? 'S' : 's');
    rect(g, 17, 16 + top, 18, 21 + top, direction === 'up' ? 'S' : 's');
  } else {
    const swing = step === 1 ? 1 : step === 3 ? -1 : 0;
    rect(g, 11 + swing, 16 + top, 12 + swing, 22 + top, 's');
  }

  // Cabeça.
  ellipse(g, 12, 8 + top, 7, 6.5, (x) => hair(x));

  if (direction === 'down') {
    ellipse(g, 12, 10 + top, 5, 4, () => 's');
    rect(g, 7, 5 + top, 16, 6 + top, 'h');
    set(g, 7, 7 + top, 'h');
    rect(g, 13, 7 + top, 16, 7 + top, 'h');
    // Óculos e olhos.
    rect(g, 7, 8 + top, 10, 8 + top, 'l');
    rect(g, 13, 8 + top, 16, 8 + top, 'l');
    set(g, 7, 9 + top, 'l');
    set(g, 10, 9 + top, 'l');
    set(g, 13, 9 + top, 'l');
    set(g, 16, 9 + top, 'l');
    rect(g, 7, 10 + top, 10, 10 + top, 'l');
    rect(g, 13, 10 + top, 16, 10 + top, 'l');
    rect(g, 11, 8 + top, 12, 8 + top, 'L');
    set(g, 8, 9 + top, 'U');
    set(g, 9, 9 + top, 'U');
    set(g, 14, 9 + top, 'U');
    set(g, 15, 9 + top, 'U');
    // Bochechas e sorriso.
    set(g, 8, 11 + top, 'm');
    set(g, 15, 11 + top, 'm');
    rect(g, 10, 12 + top, 13, 12 + top, 'R');
  } else if (direction === 'left') {
    ellipse(g, 9, 10 + top, 4, 4, () => 's');
    rect(g, 6, 5 + top, 12, 6 + top, 'h');
    set(g, 5, 9 + top, 's');
    // Uma lente de perfil.
    rect(g, 6, 8 + top, 9, 8 + top, 'l');
    set(g, 6, 9 + top, 'l');
    set(g, 9, 9 + top, 'l');
    rect(g, 6, 10 + top, 9, 10 + top, 'l');
    rect(g, 10, 8 + top, 12, 8 + top, 'L');
    set(g, 7, 9 + top, 'U');
    set(g, 8, 11 + top, 'm');
    rect(g, 6, 12 + top, 7, 12 + top, 'R');
  }

  // Pescoço.
  if (direction !== 'up') rect(g, 11, 13 + top, 12, 13 + top, 's');

  // Coroa pequena.
  rect(g, 9, 1 + top, 14, 2 + top, 'Y');
  set(g, 9, 0 + top, 'Y');
  set(g, 11, 0 + top, 'Y');
  set(g, 12, 0 + top, 'Y');
  set(g, 14, 0 + top, 'Y');
  set(g, 11, 1 + top, 'r');

  return outline(g);
}

// Coelha, 16×16: pelúcia caramelo, orelhas compridas, óculos rosa, vestido de lantejoulas e patins.
function bunnyFrame(direction: Direction, step: number): Grid {
  const g = blank(16, 16);
  const hop = step === 1 ? 1 : 0;
  const up = -hop;

  // Patins.
  rect(g, 4, 13 + up, 11, 13 + up, 'u');
  set(g, 4, 14 + up, 'Y');
  set(g, 7, 14 + up, 'r');
  set(g, 8, 14 + up, 'Y');
  set(g, 11, 14 + up, 'r');

  // Vestido rosa com brilho.
  rect(g, 5, 10 + up, 10, 12 + up, 'p');
  set(g, 6, 11 + up, 'w');
  set(g, 9, 12 + up, 'm');
  set(g, 8, 10 + up, 'm');

  // Cabeça e orelhas.
  if (direction === 'left' || direction === 'right') {
    ellipse(g, 7, 7 + up, 3.5, 3, () => 't');
    rect(g, 8, 1 + up, 9, 5 + up, 't');
    rect(g, 10, 2 + up, 11, 6 + up, 'b');
    set(g, 8, 3 + up, 'm');
    rect(g, 4, 6 + up, 6, 6 + up, 'P');
    set(g, 4, 7 + up, 'P');
    set(g, 6, 7 + up, 'P');
    set(g, 5, 7 + up, 'k');
    set(g, 3, 8 + up, 'm');
  } else {
    ellipse(g, 7.5, 7 + up, 4, 3, () => 't');
    rect(g, 4, 1 + up, 5, 5 + up, 't');
    rect(g, 10, 1 + up, 11, 5 + up, 't');
    if (direction === 'down') {
      set(g, 4, 3 + up, 'm');
      set(g, 11, 3 + up, 'm');
      rect(g, 4, 6 + up, 11, 6 + up, 'P');
      set(g, 4, 7 + up, 'P');
      set(g, 7, 7 + up, 'P');
      set(g, 8, 7 + up, 'P');
      set(g, 11, 7 + up, 'P');
      set(g, 5, 7 + up, 'k');
      set(g, 10, 7 + up, 'k');
      set(g, 7, 9 + up, 'm');
      set(g, 8, 9 + up, 'm');
    } else {
      set(g, 4, 3 + up, 'b');
      set(g, 11, 3 + up, 'b');
      rect(g, 7, 11 + up, 8, 12 + up, 'w');
    }
  }

  return outline(g);
}

function sheet(frames: Grid[], width: number, height: number, title: string): string {
  const lines = [`# ${title}`, '# Gerado por tools/draw/map-sprites.ts', '# Ordem dos quadros: baixo, esquerda, direita, cima', `@size ${width} ${height}`];
  for (const frame of frames) lines.push('@frame', ...frame.map((row) => row.join('')));
  return `${lines.join('\n')}\n`;
}

function build(frameFor: (d: Direction, step: number) => Grid, steps: number): Grid[] {
  return DIRECTION_ORDER.flatMap((direction) =>
    Array.from({ length: steps }, (_, step) =>
      direction === 'right' ? mirror(frameFor('left', step)) : frameFor(direction, step),
    ),
  );
}

writeFileSync('art/sprites/grace.txt', sheet(build(graceFrame, 4), 24, 32, 'Princess Grace no mapa, 4 quadros por direção'));
writeFileSync('art/sprites/companion.txt', sheet(build(bunnyFrame, 2), 16, 16, 'Coelha de pelúcia no mapa, 2 quadros por direção'));
console.log('art/sprites/grace.txt e art/sprites/companion.txt escritos');
