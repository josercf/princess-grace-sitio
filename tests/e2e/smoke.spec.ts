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
