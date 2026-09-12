export const BASE_WIDTH = 320;
export const BASE_HEIGHT = 180;

export function integerZoom(viewWidth: number, viewHeight: number): number {
  const zoom = Math.floor(Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT));
  return Math.max(1, zoom);
}
