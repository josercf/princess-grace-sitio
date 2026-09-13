export const BASE_WIDTH = 320;
export const BASE_HEIGHT = 180;

// A partir de 2x a ampliação é inteira; abaixo disso usa o fator exato para
// não cair para 1x em telas baixas, como o iPhone 13 na horizontal (ADR-005).
export function displayZoom(viewWidth: number, viewHeight: number): number {
  const exact = Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT);
  if (exact >= 2) return Math.floor(exact);
  return Math.max(1, exact);
}

// Limite de pixels internos por pixel base; 8 gera um canvas de 2560×1440 (ADR-006).
export const MAX_RESOLUTION = 8;

export interface RenderScale {
  displayZoom: number;
  resolution: number;
}

// Tamanho CSS do jogo (displayZoom) e pixels internos por pixel base
// (resolution), para desenhar na densidade real da tela (ADR-006). A resolução
// usa sempre as medidas da tela deitada, porque o jogo só roda na horizontal:
// assim ela não muda quando o celular gira e os textos não perdem nitidez.
export function renderScale(viewWidth: number, viewHeight: number, devicePixelRatio: number): RenderScale {
  const zoom = displayZoom(viewWidth, viewHeight);
  const landscapeZoom = displayZoom(Math.max(viewWidth, viewHeight), Math.min(viewWidth, viewHeight));
  const resolution = Math.min(MAX_RESOLUTION, Math.max(1, Math.round(landscapeZoom * devicePixelRatio)));
  return { displayZoom: zoom, resolution };
}
