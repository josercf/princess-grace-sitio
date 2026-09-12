import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseSprite, SpriteError, type Palette } from './sprites/parse';
import { renderSheet } from './sprites/render';

const OUT = join('public', 'assets', 'generated');
const SOURCES = ['art/sprites', 'art/tiles'];

interface ManifestEntry {
  file: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
}

function listTxt(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.txt')).map((f) => join(dir, f));
  } catch {
    return [];
  }
}

try {
  const palette = JSON.parse(readFileSync('art/palette.json', 'utf8')) as Palette;
  mkdirSync(join(OUT, 'sprites'), { recursive: true });
  const sprites: Record<string, ManifestEntry> = {};

  for (const path of SOURCES.flatMap(listTxt)) {
    const name = basename(path, '.txt');
    if (sprites[name]) throw new SpriteError(`${name}: nome duplicado`);
    const sheet = parseSprite(name, readFileSync(path, 'utf8'), palette);
    const file = `sprites/${name}.png`;
    writeFileSync(join(OUT, file), renderSheet(sheet, palette));
    sprites[name] = { file, frameWidth: sheet.width, frameHeight: sheet.height, frames: sheet.frames.length };
  }

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ sprites }, null, 2));
  console.log(`${Object.keys(sprites).length} sprites gerados em ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
