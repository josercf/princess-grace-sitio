import { expect, test, type Page } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

async function reachMap(page: Page, locale: 'pt' | 'en'): Promise<string[]> {
  const errors = await startGame(page);
  await tap(page, `lang-${locale}`);
  await finishDialogue(page);
  await tap(page, 'name-suggestion-0');
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await finishDialogue(page);
  return errors;
}

test('personagem fora de ordem pede para falar com outro primeiro', async ({ page }) => {
  const errors = await reachMap(page, 'pt');
  await page.evaluate(() => window.__GAME_TEST__!.interact('visconde'));
  await expect.poll(() => dialogueText(page)).toBe('Agora não posso. Fale primeiro com: Emília.');
  await finishDialogue(page);
  expect(errors).toEqual([]);
});

test('menu troca o idioma e volta ao mapa', async ({ page }) => {
  await reachMap(page, 'pt');
  await tap(page, 'menu');
  await tap(page, 'menu-language');
  await tap(page, 'lang-en');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  expect((await page.evaluate(() => window.__GAME_TEST__!.progress())).locale).toBe('en');
});

test('idioma e nome continuam depois de recarregar', async ({ page }) => {
  await reachMap(page, 'en');
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__?.activeScenes() ?? [])).toContain('MapScene');
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.locale).toBe('en');
  expect(progress.companionName).toBe('Honey');
});
