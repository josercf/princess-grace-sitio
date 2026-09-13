import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { parseSprite, SpriteError, type Palette } from '../../tools/sprites/parse';
import { hexToRgba, renderSheet } from '../../tools/sprites/render';

const palette = JSON.parse(readFileSync('art/palette.json', 'utf8')) as Palette;
const tiny: Palette = { transparent: '.', colors: { a: '#ff0000', b: '#00ff00' } };

describe('paleta', () => {
  it('tem 32 cores de um caractere em hexadecimal', () => {
    const entries = Object.entries(palette.colors);
    expect(entries).toHaveLength(32);
    for (const [key, hex] of entries) {
      expect(key).toHaveLength(1);
      expect(key).not.toMatch(/[#@.]/);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('parseSprite', () => {
  it('lê tamanho e quadros', () => {
    const sheet = parseSprite('t', '@size 2 1\n@frame\nab\n@frame\n.a\n', tiny);
    expect(sheet).toEqual({ name: 't', width: 2, height: 1, frames: [['ab'], ['.a']] });
  });

  it('ignora comentários e linhas vazias', () => {
    const sheet = parseSprite('t', '# oi\n@size 1 1\n\n@frame\na\n', tiny);
    expect(sheet.frames).toEqual([['a']]);
  });

  it('rejeita linha com largura errada', () => {
    expect(() => parseSprite('t', '@size 2 1\n@frame\nabb\n', tiny)).toThrow(/t:3: largura 3, esperado 2/);
  });

  it('rejeita quadro com altura errada', () => {
    expect(() => parseSprite('t', '@size 1 2\n@frame\na\n', tiny)).toThrow(/frame 0 tem altura 1, esperado 2/);
  });

  it('rejeita cor fora da paleta', () => {
    expect(() => parseSprite('t', '@size 1 1\n@frame\nz\n', tiny)).toThrow(SpriteError);
  });

  it('rejeita arquivo sem quadros', () => {
    expect(() => parseSprite('t', '@size 1 1\n', tiny)).toThrow(/nenhum @frame/);
  });

  it('rejeita pixels antes de @frame', () => {
    expect(() => parseSprite('t', '@size 1 1\na\n', tiny)).toThrow(/pixels fora de @frame/);
  });
});

describe('renderSheet', () => {
  it('converte hexadecimal em RGBA', () => {
    expect(hexToRgba('#ff8000')).toEqual([255, 128, 0, 255]);
  });

  it('coloca os quadros lado a lado', () => {
    const png = PNG.sync.read(renderSheet({ name: 't', width: 2, height: 1, frames: [['ab'], ['.a']] }, tiny));
    expect(png.width).toBe(4);
    expect(png.height).toBe(1);
    expect([...png.data.subarray(0, 4)]).toEqual([255, 0, 0, 255]);
    expect([...png.data.subarray(4, 8)]).toEqual([0, 255, 0, 255]);
    expect(png.data[11]).toBe(0);
    expect([...png.data.subarray(12, 16)]).toEqual([255, 0, 0, 255]);
  });
});

describe('arquivos de arte', () => {
  for (const dir of ['art/sprites', 'art/tiles']) {
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.txt'));
    } catch {
      files = [];
    }
    for (const file of files) {
      it(`${dir}/${file} é válido`, () => {
        expect(() => parseSprite(file, readFileSync(join(dir, file), 'utf8'), palette)).not.toThrow();
      });
    }
  }

  it.each([
    ['grace', 24, 32, 16],
    ['companion', 16, 16, 8],
  ])('sprite %s do mapa tem quadros de %i×%i para as quatro direções (%i quadros)', (name, width, height, frames) => {
    const sheet = parseSprite(name, readFileSync(`art/sprites/${name}.txt`, 'utf8'), palette);
    expect([sheet.width, sheet.height, sheet.frames.length]).toEqual([width, height, frames]);
  });

  it('tileset do pomar tem 5 tiles de 16×16', () => {
    const sheet = parseSprite('pomar', readFileSync('art/tiles/pomar.txt', 'utf8'), palette);
    expect([sheet.width, sheet.height, sheet.frames.length]).toEqual([16, 16, 5]);
  });
});
