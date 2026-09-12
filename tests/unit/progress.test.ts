import { describe, expect, it } from 'vitest';
import {
  createProgressStore,
  newProgress,
  parseProgress,
  PROGRESS_KEY,
  serializeProgress,
  type StorageLike,
} from '../../src/core/progress';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe('progresso', () => {
  it('novo progresso tem valores iniciais', () => {
    expect(newProgress()).toEqual({
      version: 1,
      locale: null,
      companionName: null,
      completed: [],
      difficulty: { level: 2, errorStreak: 0, successStreak: 0 },
    });
  });

  it('ida e volta preserva os dados', () => {
    const progress = { ...newProgress(), locale: 'en' as const, companionName: 'Mel', completed: ['p1-word-build'] };
    expect(parseProgress(serializeProgress(progress))).toEqual(progress);
  });

  it.each([
    ['nulo', null],
    ['JSON corrompido', '{oi'],
    ['versão antiga', JSON.stringify({ ...newProgress(), version: 0 })],
    ['idioma inválido', JSON.stringify({ ...newProgress(), locale: 'fr' })],
    ['nível inválido', JSON.stringify({ ...newProgress(), difficulty: { level: 7, errorStreak: 0, successStreak: 0 } })],
    ['completed não é lista', JSON.stringify({ ...newProgress(), completed: 'x' })],
    ['nome longo demais', JSON.stringify({ ...newProgress(), companionName: 'A'.repeat(13) })],
  ])('%s gera progresso novo', (_label, raw) => {
    expect(parseProgress(raw)).toEqual(newProgress());
  });

  it('store salva e carrega', () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    store.save({ ...newProgress(), locale: 'pt' });
    expect(store.available).toBe(true);
    expect(JSON.parse(storage.data.get(PROGRESS_KEY) ?? '{}').locale).toBe('pt');
    expect(store.load().locale).toBe('pt');
  });

  it('sem storage o jogo funciona sem salvar', () => {
    const store = createProgressStore(null);
    expect(store.available).toBe(false);
    expect(() => store.save(newProgress())).not.toThrow();
    expect(store.load()).toEqual(newProgress());
  });

  it('storage que lança erro fica indisponível', () => {
    const store = createProgressStore({
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(store.available).toBe(false);
    expect(store.load()).toEqual(newProgress());
  });
});
