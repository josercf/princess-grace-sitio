import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import type { Rng } from '../rng';

export interface Challenge<Q, A> {
  id: string;
  generate(level: Level, rng: Rng, locale: Locale): Q;
  check(question: Q, answer: A): boolean;
  hint(question: Q, locale: Locale, answer?: A): string;
}
