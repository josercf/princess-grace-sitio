import type { Level } from '../difficulty';
import { translate } from '../strings';
import type { Challenge } from './types';
import { lettersOf, VOCABULARY } from './vocabulary';

export interface WordBuildQuestion {
  word: string;
  letters: string[];
  clue: string;
  tiles: string[];
}

const DISTRACTOR_LETTERS = Array.from('ABCDEFGHIJLMNOPRSTUV');
export const DISTRACTORS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 0, 2: 2, 3: 3 };

export const wordBuild: Challenge<WordBuildQuestion, string[]> = {
  id: 'wordBuild',
  generate(level, rng) {
    const entry = rng.pick(VOCABULARY.filter((v) => v.level === level));
    const letters = lettersOf(entry.pt);
    const extras = Array.from({ length: DISTRACTORS_BY_LEVEL[level] }, () => rng.pick(DISTRACTOR_LETTERS));
    return { word: entry.pt, letters, clue: entry.en, tiles: rng.shuffle([...letters, ...extras]) };
  },
  check(question, answer) {
    return answer.join('') === question.letters.join('');
  },
  hint(question, locale) {
    return translate(locale, 'hint.wordBuild', { first: question.letters[0] ?? '', length: question.letters.length });
  },
};
