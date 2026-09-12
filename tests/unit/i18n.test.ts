import { describe, expect, it, vi } from 'vitest';
import { createI18n, interpolate } from '../../src/core/i18n';

const dicts = {
  pt: { hello: 'Oi, {name}!', onlyPt: 'só português' },
  en: { hello: 'Hi, {name}!' },
};

describe('interpolate', () => {
  it('troca variáveis conhecidas e mantém as desconhecidas', () => {
    expect(interpolate('{a} e {b}', { a: 1 })).toBe('1 e {b}');
  });
});

describe('createI18n', () => {
  it('traduz no idioma atual e troca de idioma', () => {
    const i18n = createI18n(dicts, 'pt');
    expect(i18n.t('hello', { name: 'Grace' })).toBe('Oi, Grace!');
    i18n.setLocale('en');
    expect(i18n.locale).toBe('en');
    expect(i18n.t('hello', { name: 'Grace' })).toBe('Hi, Grace!');
  });

  it('usa o outro idioma quando a chave falta e avisa', () => {
    const warn = vi.fn();
    const i18n = createI18n(dicts, 'en', warn);
    expect(i18n.t('onlyPt')).toBe('só português');
    expect(warn).toHaveBeenCalledWith('texto "onlyPt" ausente em en');
  });

  it('devolve a própria chave quando falta nos dois idiomas', () => {
    const i18n = createI18n(dicts, 'pt', () => undefined);
    expect(i18n.t('nada')).toBe('nada');
  });
});
