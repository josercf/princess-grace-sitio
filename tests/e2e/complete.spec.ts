import { expect, test } from '@playwright/test';
import { activeScenes, seedProgress, startGame, tap } from './helpers';

const ALL_STEPS = ['p1-word-build', 'p1-word-match', 'p1-fill-sentence', 'p1-clue-hunt', 'p1-comprehension'];

test('tela de conclusão troca o idioma sem apagar o progresso', async ({ page }) => {
  await seedProgress(page, { locale: 'pt', completed: ALL_STEPS, level: 2 });
  const errors = await startGame(page);
  await expect.poll(() => activeScenes(page)).toContain('PhaseCompleteScene');
  await tap(page, 'complete-language');
  await tap(page, 'lang-en');
  await expect.poll(() => activeScenes(page)).toContain('PhaseCompleteScene');
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.locale).toBe('en');
  expect(progress.completed).toEqual(ALL_STEPS);
  expect(errors).toEqual([]);
});
