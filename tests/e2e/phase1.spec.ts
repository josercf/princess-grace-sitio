import { expect, test, type Page } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

const STEPS = [
  { npc: 'emilia', hunt: false },
  { npc: 'visconde', hunt: false },
  { npc: 'benta', hunt: false },
  { npc: 'saci', hunt: true },
  { npc: 'benta', hunt: false },
];

async function answerPlan(page: Page): Promise<string[]> {
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__!.answerPlan().length), { timeout: 15_000 }).toBeGreaterThan(0);
  return page.evaluate(() => window.__GAME_TEST__!.answerPlan());
}

async function solve(page: Page, hunt: boolean): Promise<void> {
  for (const id of await answerPlan(page)) {
    if (hunt) await page.evaluate((buttonId) => window.__GAME_TEST__!.focus(buttonId), id);
    await tap(page, id);
  }
}

async function completed(page: Page): Promise<number> {
  return page.evaluate(() => window.__GAME_TEST__!.progress().completed.length);
}

async function reachMap(page: Page, locale: 'pt' | 'en'): Promise<string[]> {
  const errors = await startGame(page);
  await tap(page, `lang-${locale}`);
  await finishDialogue(page);
  for (const letter of ['M', 'E', 'L']) await tap(page, `kb-${letter}`);
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await finishDialogue(page);
  return errors;
}

for (const locale of ['pt', 'en'] as const) {
  test(`conclui a fase 1 em ${locale}`, async ({ page }) => {
    const errors = await reachMap(page, locale);

    for (const [index, step] of STEPS.entries()) {
      await page.evaluate((npc) => window.__GAME_TEST__!.interact(npc), step.npc);
      await finishDialogue(page);
      await solve(page, step.hunt);
      await finishDialogue(page);
      await expect.poll(() => completed(page)).toBe(index + 1);
    }

    await expect.poll(() => activeScenes(page)).toContain('PhaseCompleteScene');
    const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
    expect(progress.locale).toBe(locale);
    expect(progress.companionName).toBe('Mel');
    expect(errors).toEqual([]);
  });
}

test('resposta errada mostra dica da coelha e permite tentar de novo', async ({ page }) => {
  await reachMap(page, 'pt');
  await page.evaluate(() => window.__GAME_TEST__!.interact('emilia'));
  await finishDialogue(page);

  const plan = await answerPlan(page);
  const letters = plan.slice(0, -1);
  const wrong = [letters[1]!, letters[0]!, ...letters.slice(2), 'wb-confirm'];
  for (const id of wrong) await tap(page, id);

  await expect.poll(() => dialogueText(page)).toBe('Quase! Vamos tentar de novo.');
  await tap(page, 'dlg-next');
  await expect.poll(() => dialogueText(page)).toMatch(/^Dica da Mel: A palavra começa com "/);
  await tap(page, 'dlg-next');

  await solve(page, false);
  await finishDialogue(page);
  await expect.poll(() => completed(page)).toBe(1);
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.difficulty.level).toBe(2);
});
