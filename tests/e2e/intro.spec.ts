import { expect, test } from '@playwright/test';
import { finishDialogue, startGame, tap } from './helpers';

test('escolhe idioma, lê a abertura e dá nome à coelha', async ({ page }) => {
  await startGame(page);
  await tap(page, 'lang-en');
  await finishDialogue(page);
  for (const letter of ['M', 'E', 'L']) await tap(page, `kb-${letter}`);
  await tap(page, 'name-erase');
  await tap(page, 'kb-L');
  await tap(page, 'name-confirm');

  await expect
    .poll(() => page.evaluate(() => window.__GAME_TEST__!.progress().companionName))
    .toBe('Mel');
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.locale).toBe('en');
});

test('botão confirmar fica desabilitado sem nome', async ({ page }) => {
  await startGame(page);
  await tap(page, 'lang-pt');
  await finishDialogue(page);
  await tap(page, 'kb-A');
  await tap(page, 'name-erase');
  expect(await page.evaluate(() => window.__GAME_TEST__!.button('name-confirm'))).toBeNull();
});
