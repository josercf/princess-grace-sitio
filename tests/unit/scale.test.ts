import { describe, expect, it } from 'vitest';
import { displayZoom, MAX_RESOLUTION, renderScale } from '../../src/core/scale';

describe('renderScale', () => {
  it.each([
    ['iPhone 13 na horizontal', 750, 342, 3, 1.9, 6],
    ['Pixel 7 na horizontal', 915, 412, 2.625, 2, 5],
    ['desktop 1280×720', 1280, 720, 1, 4, 4],
    ['desktop 1920×1080 com dpr 2', 1920, 1080, 2, 6, 8],
    ['tela do tamanho da base', 320, 180, 1, 1, 1],
  ])('%s usa ampliação %d e resolução %i', (_name, w, h, dpr, zoom, resolution) => {
    const scale = renderScale(w, h, dpr);
    expect(scale.displayZoom).toBeCloseTo(zoom);
    expect(scale.resolution).toBe(resolution);
  });

  it('limita a resolução a MAX_RESOLUTION', () => {
    expect(MAX_RESOLUTION).toBe(8);
    expect(renderScale(3840, 2160, 3).resolution).toBe(MAX_RESOLUTION);
  });

  it('nunca usa resolução menor que 1', () => {
    expect(renderScale(200, 100, 0.5).resolution).toBe(1);
  });
});

describe('displayZoom', () => {
  it.each([
    [844, 390, 2],
    [915, 412, 2],
    [320, 180, 1],
    [1280, 720, 4],
    [1920, 1080, 6],
  ])('%i×%i usa ampliação %i', (w, h, expected) => {
    expect(displayZoom(w, h)).toBe(expected);
  });

  it('usa fator fracionário abaixo de 2x em telas baixas', () => {
    expect(displayZoom(750, 342)).toBeCloseTo(1.9);
  });

  it('nunca retorna menos que 1', () => {
    expect(displayZoom(200, 100)).toBe(1);
  });

  it('usa o menor eixo', () => {
    expect(displayZoom(2000, 200)).toBeCloseTo(200 / 180);
  });
});
