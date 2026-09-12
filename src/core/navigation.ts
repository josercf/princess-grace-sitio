import { isPhaseComplete, PHASE1_STEPS } from './phaseFlow';
import type { Progress } from './progress';

export type SceneKey = 'LanguageScene' | 'IntroScene' | 'MapScene' | 'PhaseCompleteScene';

export function firstSceneFor(progress: Progress): SceneKey {
  if (progress.locale === null) return 'LanguageScene';
  if (progress.companionName === null) return 'IntroScene';
  if (isPhaseComplete(PHASE1_STEPS, progress.completed)) return 'PhaseCompleteScene';
  return 'MapScene';
}
