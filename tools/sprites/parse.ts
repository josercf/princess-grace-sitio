export interface Palette {
  transparent: string;
  colors: Record<string, string>;
}

export interface SpriteSheet {
  name: string;
  width: number;
  height: number;
  frames: string[][];
}

export class SpriteError extends Error {}

export function parseSprite(name: string, text: string, palette: Palette): SpriteSheet {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let width = 0;
  let height = 0;
  const frames: string[][] = [];
  let current: string[] | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = (lines[i] ?? '').trimEnd();
    const lineNumber = i + 1;
    if (line === '' || line.startsWith('#')) continue;

    if (line.startsWith('@size')) {
      const match = /^@size\s+(\d+)\s+(\d+)$/.exec(line);
      if (!match) throw new SpriteError(`${name}:${lineNumber}: @size inválido`);
      width = Number(match[1]);
      height = Number(match[2]);
      continue;
    }

    if (line === '@frame') {
      if (width === 0) throw new SpriteError(`${name}:${lineNumber}: @size deve vir antes de @frame`);
      current = [];
      frames.push(current);
      continue;
    }

    if (current === null) throw new SpriteError(`${name}:${lineNumber}: pixels fora de @frame`);
    if (line.length !== width) {
      throw new SpriteError(`${name}:${lineNumber}: largura ${line.length}, esperado ${width}`);
    }
    for (const ch of line) {
      if (ch !== palette.transparent && !(ch in palette.colors)) {
        throw new SpriteError(`${name}:${lineNumber}: cor "${ch}" fora da paleta`);
      }
    }
    current.push(line);
  }

  if (frames.length === 0) throw new SpriteError(`${name}: nenhum @frame`);
  frames.forEach((frame, index) => {
    if (frame.length !== height) {
      throw new SpriteError(`${name}: frame ${index} tem altura ${frame.length}, esperado ${height}`);
    }
  });

  return { name, width, height, frames };
}
