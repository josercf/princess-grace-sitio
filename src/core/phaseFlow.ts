import type { ChallengeId } from './challenges';

export type NpcId = 'emilia' | 'visconde' | 'benta' | 'saci';
export type SpeakerId = NpcId | 'grace' | 'companion' | 'narrator';

export interface DialogueSpec {
  speaker: SpeakerId;
  key: string;
}

export interface PhaseStep {
  id: string;
  npc: NpcId;
  challenge: ChallengeId;
  intro: DialogueSpec[];
  done: DialogueSpec[];
}

export const PHASE1_STEPS: readonly PhaseStep[] = [
  {
    id: 'p1-word-build',
    npc: 'emilia',
    challenge: 'wordBuild',
    intro: [
      { speaker: 'emilia', key: 'emilia.intro' },
      { speaker: 'emilia', key: 'emilia.problem' },
      { speaker: 'grace', key: 'grace.accept' },
      { speaker: 'emilia', key: 'emilia.challenge' },
    ],
    done: [{ speaker: 'emilia', key: 'emilia.done' }],
  },
  {
    id: 'p1-word-match',
    npc: 'visconde',
    challenge: 'wordMatch',
    intro: [
      { speaker: 'visconde', key: 'visconde.intro' },
      { speaker: 'visconde', key: 'visconde.challenge' },
    ],
    done: [{ speaker: 'visconde', key: 'visconde.done' }],
  },
  {
    id: 'p1-fill-sentence',
    npc: 'benta',
    challenge: 'fillSentence',
    intro: [
      { speaker: 'benta', key: 'benta.intro' },
      { speaker: 'benta', key: 'benta.challenge' },
    ],
    done: [{ speaker: 'benta', key: 'benta.done' }],
  },
  {
    id: 'p1-clue-hunt',
    npc: 'saci',
    challenge: 'clueHunt',
    intro: [
      { speaker: 'saci', key: 'saci.intro' },
      { speaker: 'saci', key: 'saci.huntStart' },
    ],
    done: [{ speaker: 'saci', key: 'saci.found' }],
  },
  {
    id: 'p1-comprehension',
    npc: 'benta',
    challenge: 'comprehension',
    intro: [{ speaker: 'benta', key: 'benta.legendIntro' }],
    done: [{ speaker: 'benta', key: 'benta.legendDone' }],
  },
];

export function nextStep(steps: readonly PhaseStep[], completed: readonly string[]): PhaseStep | null {
  return steps.find((step) => !completed.includes(step.id)) ?? null;
}

export function isPhaseComplete(steps: readonly PhaseStep[], completed: readonly string[]): boolean {
  return nextStep(steps, completed) === null;
}
