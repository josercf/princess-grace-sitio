import en from '../content/en.json';
import pt from '../content/pt.json';
import { interpolate, type Dictionary, type Vars } from './i18n';
import type { Locale } from './locale';

export const DICTIONARIES: Record<Locale, Dictionary> = { pt, en };

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const template = DICTIONARIES[locale][key];
  return template === undefined ? key : interpolate(template, vars);
}
