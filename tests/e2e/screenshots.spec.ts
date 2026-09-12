import { expect, test } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

test('gera capturas das telas principais para conferência', async ({ page }, testInfo) => {
  const shot = async (name: string) => {
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  };

  await startGame(page);
  await shot('01-idioma');
  await tap(page, 'lang-pt');
  await expect.poll(() => dialogueText(page)).not.toBeNull();
  await shot('02-abertura');
  await finishDialogue(page);
  await shot('03-nome-da-coelha');
  await tap(page, 'name-suggestion-0');
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await shot('04-mapa-com-saudacao');
  await finishDialogue(page);

  await page.evaluate(() => window.__GAME_TEST__!.interact('emilia'));
  await expect.poll(() => dialogueText(page)).not.toBeNull();
  await tap(page, 'dlg-next');
  await tap(page, 'dlg-next');
  await shot('05-dialogo-com-retrato-da-grace');
  await finishDialogue(page);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__!.answerPlan().length)).toBeGreaterThan(0);
  await shot('06-desafio-montar-palavra');
});
