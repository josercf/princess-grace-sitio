import { describe, expect, it } from 'vitest';
import { displayZoom } from '../../src/core/scale';

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
