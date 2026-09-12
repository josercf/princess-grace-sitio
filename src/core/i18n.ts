import { otherLocale, type Locale } from './locale';

export type Dictionary = Record<string, string>;
export type Vars = Record<string, string | number>;

export interface I18n {
  readonly locale: Locale;
  setLocale(locale: Locale): void;
  t(key: string, vars?: Vars): string;
}

export function interpolate(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function createI18n(
  dictionaries: Record<Locale, Dictionary>,
  initial: Locale,
  warn: (message: string) => void = console.warn,
): I18n {
  let locale = initial;
  return {
    get locale() {
      return locale;
    },
    setLocale(next) {
      locale = next;
    },
    t(key, vars) {
      const own = dictionaries[locale][key];
      if (own !== undefined) return interpolate(own, vars);
      const fallback = dictionaries[otherLocale(locale)][key];
      if (fallback !== undefined) {
        warn(`texto "${key}" ausente em ${locale}`);
        return interpolate(fallback, vars);
      }
      warn(`texto "${key}" ausente em ${locale}`);
      return key;
    },
  };
}
