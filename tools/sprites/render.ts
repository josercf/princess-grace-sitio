import { PNG } from 'pngjs';
import type { Palette, SpriteSheet } from './parse';

export function hexToRgba(hex: string): [number, number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

export function renderSheet(sheet: SpriteSheet, palette: Palette): Buffer {
  const png = new PNG({ width: sheet.width * sheet.frames.length, height: sheet.height });
  png.data.fill(0);

  sheet.frames.forEach((frame, frameIndex) => {
    frame.forEach((row, y) => {
      Array.from(row).forEach((ch, x) => {
        if (ch === palette.transparent) return;
        const color = palette.colors[ch];
        if (color === undefined) throw new Error(`cor "${ch}" fora da paleta`);
        const offset = (y * png.width + frameIndex * sheet.width + x) * 4;
        const [r, g, b, a] = hexToRgba(color);
        png.data[offset] = r;
        png.data[offset + 1] = g;
        png.data[offset + 2] = b;
        png.data[offset + 3] = a;
      });
    });
  });

  return PNG.sync.write(png);
}
