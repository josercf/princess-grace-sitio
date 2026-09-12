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
