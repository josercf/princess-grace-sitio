import { clueHunt } from './clueHunt';
import { comprehension } from './comprehension';
import { fillSentence } from './fillSentence';
import type { Challenge } from './types';
import { wordBuild } from './wordBuild';
import { wordMatch } from './wordMatch';

export type ChallengeId = 'wordBuild' | 'wordMatch' | 'fillSentence' | 'clueHunt' | 'comprehension';

export const CHALLENGES: Record<ChallengeId, Challenge<unknown, unknown>> = {
  wordBuild,
  wordMatch,
  fillSentence,
  clueHunt,
  comprehension,
};
