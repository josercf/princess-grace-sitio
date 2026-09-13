import { expect, test } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, finishHuntClues, seedProgress, startGame, tap } from './helpers';

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

test('gera capturas da caça ao Saci com seis esconderijos', async ({ page }, testInfo) => {
  await seedProgress(page, { locale: 'pt', completed: ['p1-word-build', 'p1-word-match', 'p1-fill-sentence'], level: 3 });
  const errors = await startGame(page);
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await page.evaluate(() => window.__GAME_TEST__!.interact('saci'));
  await finishHuntClues(page);

  const ids = ['jabuticabeira', 'ribeirao', 'cerca', 'milharal', 'pedra', 'toca'];
  for (const id of ids) {
    expect(await page.evaluate((buttonId) => window.__GAME_TEST__!.button(buttonId), `hideout-${id}`)).not.toBeNull();
  }
  expect(await page.evaluate(() => window.__GAME_TEST__!.button('hunt-clues'))).not.toBeNull();

  await page.waitForTimeout(400);
  await page.screenshot({ path: testInfo.outputPath('07a-caca-ao-saci.png') });
  await page.evaluate(() => window.__GAME_TEST__!.focus('hideout-milharal'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('07b-caca-ao-saci.png') });
  expect(errors).toEqual([]);
});
