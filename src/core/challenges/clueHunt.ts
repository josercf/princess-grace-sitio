import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

export interface HideoutEntry {
  id: string;
  clues: Record<Locale, string[]>;
}

export interface ClueHuntQuestion {
  targetId: string;
  clues: string[];
  candidates: string[];
}

export const HIDEOUTS = phase1.hideouts as readonly HideoutEntry[];
export const CANDIDATES_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 3, 2: 4, 3: 6 };

export const clueHunt: Challenge<ClueHuntQuestion, string> = {
  id: 'clueHunt',
  generate(level, rng, locale) {
    const target = rng.pick(HIDEOUTS);
    const others = rng.shuffle(HIDEOUTS.filter((h) => h.id !== target.id)).slice(0, CANDIDATES_BY_LEVEL[level] - 1);
    return {
      targetId: target.id,
      clues: [...target.clues[locale]],
      candidates: rng.shuffle([target, ...others].map((h) => h.id)),
    };
  },
  check(question, answer) {
    return answer === question.targetId;
  },
  hint(question, locale) {
    return translate(locale, 'hint.clueHunt', { clue: question.clues[question.clues.length - 1] ?? '' });
  },
};
