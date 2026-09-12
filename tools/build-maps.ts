import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseAsciiMap } from './maps/parse';
import { toTiledJson } from './maps/tiled';

const OUT = join('public', 'assets', 'generated', 'maps');

try {
  mkdirSync(OUT, { recursive: true });
  const files = readdirSync('maps').filter((f) => f.endsWith('.txt'));
  for (const file of files) {
    const name = basename(file, '.txt');
    const map = parseAsciiMap(name, readFileSync(join('maps', file), 'utf8'));
    const tiled = toTiledJson(map, { name: 'pomar', image: '../sprites/pomar.png' });
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(tiled));
  }
  console.log(`${files.length} mapas gerados em ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
