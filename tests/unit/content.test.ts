import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '../../src/core/strings';

describe('textos', () => {
  it('pt e en têm exatamente as mesmas chaves', () => {
    expect(Object.keys(DICTIONARIES.en).sort()).toEqual(Object.keys(DICTIONARIES.pt).sort());
  });

  it('nenhum texto vazio', () => {
    for (const dict of Object.values(DICTIONARIES)) {
      for (const [key, value] of Object.entries(dict)) expect(value.trim(), key).not.toBe('');
    }
  });

  it('as mesmas variáveis aparecem nos dois idiomas', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(DICTIONARIES.pt)) {
      expect(vars(DICTIONARIES.en[key] ?? ''), key).toEqual(vars(DICTIONARIES.pt[key] ?? ''));
    }
  });

  it('nenhum arquivo de conteúdo usa travessão', () => {
    for (const file of readdirSync('src/content')) {
      expect(readFileSync(join('src/content', file), 'utf8'), file).not.toContain('\u2014');
    }
  });
});
