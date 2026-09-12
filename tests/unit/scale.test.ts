import { describe, expect, it } from 'vitest';
import { integerZoom } from '../../src/core/scale';

describe('integerZoom', () => {
  it.each([
    [844, 390, 2],
    [915, 412, 2],
    [320, 180, 1],
    [1280, 720, 4],
    [1920, 1080, 6],
  ])('%i×%i usa ampliação %i', (w, h, expected) => {
    expect(integerZoom(w, h)).toBe(expected);
  });

  it('nunca retorna menos que 1', () => {
    expect(integerZoom(200, 100)).toBe(1);
  });

  it('usa o menor eixo', () => {
    expect(integerZoom(2000, 200)).toBe(1);
  });
});
