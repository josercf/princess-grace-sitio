import { expect, test } from '@playwright/test';

test('o jogo abre sem erros no console', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('./');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.waitForTimeout(1500);

  expect(errors).toEqual([]);
});

test('o canvas ocupa pelo menos 300 px de altura em celular na horizontal', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(300);
});

test('o canvas desenha na densidade real de pixels da tela', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  const size = await canvas.evaluate((element: HTMLCanvasElement) => ({
    internal: element.width,
    css: element.getBoundingClientRect().width,
    dpr: window.devicePixelRatio,
  }));
  expect(size.internal).toBeGreaterThanOrEqual(0.9 * size.css * size.dpr);
});

test('girar o celular de pé para deitado mantém a resolução e os botões respondendo', async ({ page }) => {
  const landscape = page.viewportSize()!;
  await page.setViewportSize({ width: landscape.height, height: landscape.width });
  await page.goto('./?e2e=1');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeAttached();
  const internalWidth = () => canvas.evaluate((element: HTMLCanvasElement) => element.width);
  const standing = await internalWidth();

  await page.setViewportSize(landscape);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__?.button('lang-pt') ?? null)).not.toBeNull();
  expect(await internalWidth()).toBe(standing);

  const point = await page.evaluate(() => window.__GAME_TEST__!.button('lang-pt'));
  await page.touchscreen.tap(point!.x, point!.y);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__!.progress().locale)).toBe('pt');
});
