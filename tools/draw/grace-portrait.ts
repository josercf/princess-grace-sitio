import { writeFileSync } from 'node:fs';

const SIZE = 96;
const grid: string[][] = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => '.'));

function set(x: number, y: number, color: string): void {
  if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) grid[y]![x] = color;
}

function get(x: number, y: number): string {
  return grid[y]?.[x] ?? '.';
}

function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

function fill(test: (x: number, y: number) => boolean, color: (x: number, y: number) => string): void {
  for (let y = 0; y < SIZE; y += 1) for (let x = 0; x < SIZE; x += 1) if (test(x, y)) set(x, y, color(x, y));
}

const FACE = { cx: 48, cy: 50, rx: 23, ry: 24 };
const EYE_Y = 50;

// Cabelo de trás: topo da cabeça e mechas longas e lisas até a base.
const hairColor = (x: number) => {
  if (x < 17 || x > 79) return 'H';
  if (x === 30 || x === 41 || x === 58 || x === 67) return 'y';
  if (x === 24 || x === 73) return 'H';
  return 'h';
};
fill(
  (x, y) => inEllipse(x, y, 48, 44, 34, 36) || (y >= 44 && x >= 12 + Math.max(0, (y - 72) * 0.2) && x <= 84 - Math.max(0, (y - 72) * 0.2)),
  hairColor,
);

// Blusa rosa com florzinhas brancas.
fill(
  (x, y) => inEllipse(x, y, 48, 106, 46, 26),
  (x, y) => {
    if (x < 10 || x > 86) return 'P';
    const fx = x % 12;
    const fy = (y + (Math.floor(x / 12) % 2) * 5) % 10;
    if (fx === 6 && fy === 5) return 'Y';
    if ((fx === 6 && (fy === 4 || fy === 6)) || (fy === 5 && (fx === 5 || fx === 7))) return 'w';
    return 'p';
  },
);

// Mechas da frente sobre os ombros.
fill(
  (x, y) => y >= 62 && ((x >= 15 && x <= 26 - Math.floor((y - 62) / 7)) || (x >= 70 + Math.floor((y - 62) / 7) && x <= 81)),
  hairColor,
);

// Pescoço curto.
fill((x, y) => x >= 42 && x <= 54 && y >= 70 && y <= 82, (x, y) => (y <= 73 || x <= 43 || x >= 53 ? 'S' : 's'));

// Rosto.
const face = (x: number, y: number) => inEllipse(x, y, FACE.cx, FACE.cy, FACE.rx, FACE.ry);
fill(face, (x, y) => (inEllipse(x, y, FACE.cx, FACE.cy - 1, FACE.rx - 2, FACE.ry - 2) ? 's' : 'S'));

// Franja de lado, repartida à esquerda, cobrindo a testa e caindo sobre a têmpora direita.
const fringeLine = (x: number) => 35 + Math.max(0, x - 44) * 0.22 - Math.max(0, 34 - x) * 0.1;
fill(
  (x, y) => face(x, y) && (y < fringeLine(x) || (y > 38 && (x < 27 || x > 69))),
  (x, y) => (x === 41 || x === 58 ? 'y' : y >= fringeLine(x) - 1 ? 'H' : 'h'),
);

// Sobrancelhas suaves logo abaixo da franja.
for (let x = 32; x <= 41; x += 1) set(x, 39, 'H');
for (let x = 55; x <= 64; x += 1) if (get(x, 39) === 's') set(x, 39, 'H');

// Bochechas rosadas.
fill((x, y) => inEllipse(x, y, 32, 61, 4, 2.5) || inEllipse(x, y, 64, 61, 4, 2.5), () => 'm');

// Olhos azul-acinzentados, redondos e alegres.
for (const cx of [37, 59]) {
  fill((x, y) => inEllipse(x, y, cx, EYE_Y, 4, 3.5), () => 'w');
  fill((x, y) => inEllipse(x, y, cx, EYE_Y, 3, 3.2), (x, y) => (y <= EYE_Y - 1 ? 'U' : 'u'));
  set(cx, EYE_Y, 'k');
  set(cx + 1, EYE_Y, 'k');
  set(cx - 1, EYE_Y - 2, 'w');
  set(cx - 2, EYE_Y - 1, 'w');
  for (let x = cx - 3; x <= cx + 3; x += 1) set(x, EYE_Y - 4, 'k');
  set(cx - 4, EYE_Y - 3, 'k');
  set(cx + 4, EYE_Y - 3, 'k');
}

// Óculos grandes e quadrados, lilás translúcido.
function frame(x0: number, x1: number): void {
  for (let x = x0; x <= x1; x += 1) {
    set(x, 42, 'L');
    set(x, 43, 'l');
    set(x, 57, 'l');
    set(x, 58, 'L');
  }
  for (let y = 42; y <= 58; y += 1) {
    set(x0, y, 'L');
    set(x0 + 1, y, 'l');
    set(x1 - 1, y, 'l');
    set(x1, y, 'L');
  }
}
frame(27, 46);
frame(50, 69);
for (let x = 47; x <= 49; x += 1) {
  set(x, 47, 'L');
  set(x, 48, 'l');
}
for (let x = 22; x <= 26; x += 1) set(x, 46, 'L');
for (let x = 70; x <= 74; x += 1) set(x, 46, 'L');

// Nariz.
set(47, 60, 'S');
set(49, 60, 'S');

// Sorriso aberto com a falha dos dois dentes da frente.
const mouthOpen = (x: number, y: number) => inEllipse(x, y, 48, 64, 8, 5) && y >= 64;
fill(mouthOpen, () => 'R');
fill((x, y) => mouthOpen(x, y) && y <= 65 && !(x >= 46 && x <= 50), () => 'w');
fill((x, y) => mouthOpen(x, y) && inEllipse(x, y, 48, 69, 4, 2), () => 'r');
for (let x = 40; x <= 56; x += 1) set(x, 64, 'R');
set(39, 63, 'R');
set(57, 63, 'R');

// Presilha de flor branca no cabelo.
for (const [dx, dy] of [
  [0, -3],
  [3, 0],
  [0, 3],
  [-3, 0],
]) {
  fill((x, y) => inEllipse(x, y, 74 + dx!, 30 + dy!, 2.2, 2.2), (x, y) => (y > 30 + dy! ? 'z' : 'w'));
}
fill((x, y) => inEllipse(x, y, 74, 30, 1.4, 1.4), () => 'Y');

// Contorno escuro de 1 px na silhueta.
const outline: [number, number][] = [];
for (let y = 0; y < SIZE; y += 1) {
  for (let x = 0; x < SIZE; x += 1) {
    if (get(x, y) === '.') continue;
    const edge = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dx, dy]) => {
      const nx = x + dx!;
      const ny = y + dy!;
      return nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && get(nx, ny) === '.';
    });
    if (edge) outline.push([x, y]);
  }
}
for (const [x, y] of outline) set(x, y, 'k');

const header = ['# Retrato da Princess Grace, expressão feliz', '# Gerado por tools/draw/grace-portrait.ts', '@size 96 96', '@frame'];
writeFileSync('art/sprites/grace-portrait.txt', `${[...header, ...grid.map((row) => row.join(''))].join('\n')}\n`);
console.log('art/sprites/grace-portrait.txt escrito');
