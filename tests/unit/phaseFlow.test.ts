import { describe, expect, it } from 'vitest';
import { CHALLENGES } from '../../src/core/challenges';
import { firstSceneFor } from '../../src/core/navigation';
import { isPhaseComplete, nextStep, PHASE1_STEPS } from '../../src/core/phaseFlow';
import { newProgress } from '../../src/core/progress';
import { DICTIONARIES } from '../../src/core/strings';

const allIds = PHASE1_STEPS.map((s) => s.id);

describe('sequência da fase 1', () => {
  it('tem cinco passos com ids únicos e desafios registrados', () => {
    expect(PHASE1_STEPS).toHaveLength(5);
    expect(new Set(allIds).size).toBe(5);
    for (const step of PHASE1_STEPS) expect(CHALLENGES[step.challenge]).toBeDefined();
  });

  it('todas as falas existem no dicionário', () => {
    for (const step of PHASE1_STEPS) {
      for (const line of [...step.intro, ...step.done]) expect(DICTIONARIES.pt[line.key], line.key).toBeDefined();
    }
  });

  it('nextStep segue a ordem e ignora ids desconhecidos', () => {
    expect(nextStep(PHASE1_STEPS, [])?.id).toBe('p1-word-build');
    expect(nextStep(PHASE1_STEPS, ['p1-word-build', 'outro'])?.id).toBe('p1-word-match');
    expect(nextStep(PHASE1_STEPS, allIds)).toBeNull();
  });

  it('isPhaseComplete só com todos os passos', () => {
    expect(isPhaseComplete(PHASE1_STEPS, allIds.slice(0, 4))).toBe(false);
    expect(isPhaseComplete(PHASE1_STEPS, allIds)).toBe(true);
  });
});

describe('firstSceneFor', () => {
  it('escolhe a cena pelo progresso', () => {
    expect(firstSceneFor(newProgress())).toBe('LanguageScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt' })).toBe('IntroScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt', companionName: 'Mel' })).toBe('MapScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt', companionName: 'Mel', completed: allIds })).toBe('PhaseCompleteScene');
  });
});
