import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

interface LegendQuestionText {
  prompt: string;
  answer: string;
  distractors: string[];
  keyword: string;
}

export interface LegendData {
  pt: { title: string; paragraphs: string[] };
  en: { title: string; paragraphs: string[] };
  questions: Record<Locale, LegendQuestionText>[];
}

export interface ComprehensionItem {
  prompt: string;
  options: string[];
  answer: string;
  keyword: string;
}

export interface ComprehensionQuestion {
  title: string;
  paragraphs: string[];
  questions: ComprehensionItem[];
}

export const LEGEND = phase1.legend as LegendData;
export const QUESTIONS_PER_ROUND = 2;
const DISTRACTORS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 1, 2: 2, 3: 2 };

export const comprehension: Challenge<ComprehensionQuestion, string[]> = {
  id: 'comprehension',
  generate(level, rng, locale) {
    const chosen = rng.shuffle(LEGEND.questions).slice(0, QUESTIONS_PER_ROUND).map((q) => q[locale]);
    return {
      title: LEGEND[locale].title,
      paragraphs: [...LEGEND[locale].paragraphs],
      questions: chosen.map((q) => ({
        prompt: q.prompt,
        answer: q.answer,
        keyword: q.keyword,
        options: rng.shuffle([q.answer, ...q.distractors.slice(0, DISTRACTORS_BY_LEVEL[level])]),
      })),
    };
  },
  check(question, answer) {
    return answer.length === question.questions.length && question.questions.every((q, i) => answer[i] === q.answer);
  },
  hint(question, locale, answer) {
    const wrong = answer ? question.questions.find((q, i) => answer[i] !== q.answer) : undefined;
    const target = wrong ?? question.questions[0];
    return translate(locale, 'hint.comprehension', { keyword: target?.keyword ?? '' });
  },
};
