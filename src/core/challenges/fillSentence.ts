import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

interface SentenceText {
  text: string;
  answer: string;
  options: string[];
}

export interface SentenceEntry {
  level: Level;
  pt: SentenceText;
  en: SentenceText;
}

export interface FillSentenceQuestion {
  text: string;
  answer: string;
  options: string[];
}

export const SENTENCES = phase1.sentences as readonly SentenceEntry[];

export const fillSentence: Challenge<FillSentenceQuestion, string> = {
  id: 'fillSentence',
  generate(level, rng, locale: Locale) {
    const entry = rng.pick(SENTENCES.filter((s) => s.level === level))[locale];
    return { text: entry.text, answer: entry.answer, options: rng.shuffle(entry.options) };
  },
  check(question, answer) {
    return answer === question.answer;
  },
  hint(question, locale) {
    const first = Array.from(question.answer)[0] ?? '';
    return translate(locale, 'hint.fillSentence', { first: first.toLocaleUpperCase('pt-BR') });
  },
};
