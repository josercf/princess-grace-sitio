import { expect, type Page } from '@playwright/test';

export async function startGame(page: Page, seed = 42): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`./?e2e=1&seed=${seed}`);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__ !== undefined)).toBe(true);
  return errors;
}

export async function tap(page: Page, id: string): Promise<void> {
  let point: { x: number; y: number } | null = null;
  await expect
    .poll(
      async () => {
        point = await page.evaluate((buttonId) => window.__GAME_TEST__!.button(buttonId), id);
        return point;
      },
      { message: `botão ${id}`, timeout: 15_000 },
    )
    .not.toBeNull();
  const { x, y } = point as unknown as { x: number; y: number };
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(80);
}

export async function dialogueText(page: Page): Promise<string | null> {
  return page.evaluate(() => window.__GAME_TEST__!.dialogueText());
}

export async function finishDialogue(page: Page): Promise<void> {
  await expect.poll(() => dialogueText(page), { message: 'diálogo aberto', timeout: 15_000 }).not.toBeNull();
  while ((await dialogueText(page)) !== null) await tap(page, 'dlg-next');
}

export async function activeScenes(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__GAME_TEST__!.activeScenes());
}

export async function seedProgress(page: Page, progress: { locale: 'pt' | 'en'; completed: string[]; level: 1 | 2 | 3 }): Promise<void> {
  const value = JSON.stringify({
    version: 1,
    locale: progress.locale,
    companionName: 'Mel',
    completed: progress.completed,
    difficulty: { level: progress.level, errorStreak: 0, successStreak: 0 },
  });
  await page.addInitScript((raw) => window.localStorage.setItem('princess-grace-sitio.progress', raw), value);
}
