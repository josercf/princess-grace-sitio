import type { Level } from '../difficulty';
import { translate } from '../strings';
import type { Challenge } from './types';
import { VOCABULARY } from './vocabulary';

export interface WordMatchQuestion {
  pairs: { pt: string; en: string }[];
  left: string[];
  right: string[];
}

export type WordMatchAnswer = Record<string, string>;

export const PAIRS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 3, 2: 4, 3: 5 };
export const MAX_EN_LENGTH = 12;

export const wordMatch: Challenge<WordMatchQuestion, WordMatchAnswer> = {
  id: 'wordMatch',
  generate(level, rng) {
    const pool = VOCABULARY.filter((v) => v.level <= level && v.en.length <= MAX_EN_LENGTH);
    const pairs = rng.shuffle(pool).slice(0, PAIRS_BY_LEVEL[level]).map(({ pt, en }) => ({ pt, en }));
    return { pairs, left: rng.shuffle(pairs.map((p) => p.pt)), right: rng.shuffle(pairs.map((p) => p.en)) };
  },
  check(question, answer) {
    return Object.keys(answer).length === question.pairs.length && question.pairs.every((p) => answer[p.pt] === p.en);
  },
  hint(question, locale) {
    const first = question.pairs[0];
    return first ? translate(locale, 'hint.wordMatch', { pt: first.pt, en: first.en }) : '';
  },
};
