import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findPath, pathToNeighbor } from '../../src/core/pathfinding';
import { MapError, parseAsciiMap } from '../../tools/maps/parse';
import { toTiledJson } from '../../tools/maps/tiled';

describe('parseAsciiMap', () => {
  const sample = '@hideout 1 toca\n#####\n#G.1#\n#E~T#\n#####\n';

  it('lê terreno, bloqueios e objetos', () => {
    const map = parseAsciiMap('amostra', sample);
    expect([map.width, map.height]).toEqual([5, 4]);
    expect(map.ground.slice(5, 10)).toEqual([3, 0, 0, 0, 3]);
    expect(map.blocked[2]).toEqual([true, false, true, true, true]);
    expect(map.objects).toEqual([
      { type: 'spawn', name: 'grace', x: 1, y: 1 },
      { type: 'hideout', name: 'toca', x: 3, y: 1 },
      { type: 'npc', name: 'emilia', x: 1, y: 2 },
    ]);
  });

  it.each([
    ['linhas de larguras diferentes', '##\n#G.\n', /largura/],
    ['caractere desconhecido', '#G?\n', /desconhecido/],
    ['esconderijo sem @hideout', '#G1\n', /sem @hideout/],
    ['sem ponto de partida', '#..\n', /ponto de partida/],
  ])('rejeita %s', (_label, text, message) => {
    expect(() => parseAsciiMap('x', text)).toThrow(MapError);
    expect(() => parseAsciiMap('x', text)).toThrow(message);
  });
});

describe('toTiledJson', () => {
  it('gera camadas e tileset no formato do Tiled', () => {
    const map = parseAsciiMap('amostra', '@hideout 1 toca\n#G1\n');
    const tiled = toTiledJson(map, { name: 'pomar', image: '../sprites/pomar.png' });
    expect(tiled.layers[0]).toMatchObject({ name: 'ground', type: 'tilelayer', data: [4, 1, 1] });
    expect(tiled.layers[1]).toMatchObject({ name: 'objects', type: 'objectgroup' });
    expect(tiled.layers[1].objects[1]).toMatchObject({ name: 'toca', type: 'hideout', x: 32, y: 0 });
    expect(tiled.tilesets[0].tiles.map((t) => t.id)).toEqual([2, 3, 4]);
  });
});

describe('maps/pomar.txt', () => {
  const map = parseAsciiMap('pomar', readFileSync('maps/pomar.txt', 'utf8'));
  const spawn = map.objects.find((o) => o.type === 'spawn');
  const grid = map.blocked.map((row) => [...row]);
  for (const npc of map.objects.filter((o) => o.type === 'npc')) grid[npc.y]![npc.x] = true;

  it('tem os quatro personagens e os seis esconderijos', () => {
    expect(map.objects.filter((o) => o.type === 'npc').map((o) => o.name).sort()).toEqual(['benta', 'emilia', 'saci', 'visconde']);
    expect(map.objects.filter((o) => o.type === 'hideout').map((o) => o.name).sort()).toEqual([
      'cerca', 'jabuticabeira', 'milharal', 'pedra', 'ribeirao', 'toca',
    ]);
  });

  it('todo personagem e esconderijo é alcançável a partir do início', () => {
    for (const obj of map.objects) {
      if (obj.type === 'spawn') continue;
      if (obj.type === 'npc') expect(pathToNeighbor(grid, spawn!, obj), obj.name).not.toBeNull();
      else expect(findPath(grid, spawn!, obj).length, obj.name).toBeGreaterThan(0);
    }
  });
});
