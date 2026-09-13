export const BASE_WIDTH = 320;
export const BASE_HEIGHT = 180;

// A partir de 2x a ampliação é inteira; abaixo disso usa o fator exato para
// não cair para 1x em telas baixas, como o iPhone 13 na horizontal (ADR-005).
export function displayZoom(viewWidth: number, viewHeight: number): number {
  const exact = Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT);
  if (exact >= 2) return Math.floor(exact);
  return Math.max(1, exact);
}
