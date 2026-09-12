export type Locale = 'pt' | 'en';

export const LOCALES: readonly Locale[] = ['pt', 'en'];

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

export function isLocale(value: unknown): value is Locale {
  return value === 'pt' || value === 'en';
}
