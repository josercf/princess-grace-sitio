export const TERRAIN: Readonly<Record<string, number>> = { '.': 0, ':': 1, '~': 2, '#': 3, T: 4 };
export const BLOCKING_TILES: ReadonlySet<number> = new Set([2, 3, 4]);

const NPC_MARKERS: Readonly<Record<string, string>> = { E: 'emilia', V: 'visconde', D: 'benta', S: 'saci' };

export interface MapObject {
  type: 'spawn' | 'npc' | 'hideout';
  name: string;
  x: number;
  y: number;
}

export interface ParsedMap {
  name: string;
  width: number;
  height: number;
  ground: number[];
  blocked: boolean[][];
  objects: MapObject[];
}

export class MapError extends Error {}

export function parseAsciiMap(name: string, text: string): ParsedMap {
  const hideoutNames = new Map<string, string>();
  const rows: string[] = [];

  text.replace(/\r\n/g, '\n').split('\n').forEach((raw, index) => {
    const line = raw.trimEnd();
    if (line === '') return;
    if (line.startsWith('@hideout')) {
      const match = /^@hideout\s+([1-9])\s+([a-z0-9-]+)$/.exec(line);
      if (!match) throw new MapError(`${name}:${index + 1}: @hideout inválido`);
      hideoutNames.set(match[1] as string, match[2] as string);
      return;
    }
    rows.push(line);
  });

  if (rows.length === 0) throw new MapError(`${name}: mapa vazio`);
  const width = (rows[0] as string).length;
  const ground: number[] = [];
  const blocked: boolean[][] = [];
  const objects: MapObject[] = [];

  rows.forEach((row, y) => {
    if (row.length !== width) throw new MapError(`${name}: linha ${y} tem largura ${row.length}, esperado ${width}`);
    const blockedRow: boolean[] = [];
    Array.from(row).forEach((ch, x) => {
      let tile = TERRAIN[ch];
      if (tile === undefined) {
        tile = 0;
        const npc = NPC_MARKERS[ch];
        if (ch === 'G') objects.push({ type: 'spawn', name: 'grace', x, y });
        else if (npc !== undefined) objects.push({ type: 'npc', name: npc, x, y });
        else if (/^[1-9]$/.test(ch)) {
          const hideout = hideoutNames.get(ch);
          if (hideout === undefined) throw new MapError(`${name}: esconderijo ${ch} sem @hideout`);
          objects.push({ type: 'hideout', name: hideout, x, y });
        } else throw new MapError(`${name}: caractere "${ch}" desconhecido em (${x}, ${y})`);
      }
      ground.push(tile);
      blockedRow.push(BLOCKING_TILES.has(tile));
    });
    blocked.push(blockedRow);
  });

  if (!objects.some((o) => o.type === 'spawn')) throw new MapError(`${name}: falta o ponto de partida G`);
  return { name, width, height: rows.length, ground, blocked, objects };
}
