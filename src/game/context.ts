import type Phaser from 'phaser';
import { createI18n, type I18n } from '../core/i18n';
import type { Locale } from '../core/locale';
import { createProgressStore, newProgress, type Progress, type ProgressStore, type StorageLike } from '../core/progress';
import { createRng, type Rng } from '../core/rng';
import { DICTIONARIES } from '../core/strings';

export interface GameContext {
  i18n: I18n;
  store: ProgressStore;
  progress: Progress;
  rng: Rng;
  save(): void;
  setLocale(locale: Locale): void;
  resetProgress(): void;
}

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createContext(): GameContext {
  const store = createProgressStore(browserStorage());
  const seed = Number(new URLSearchParams(window.location.search).get('seed') ?? Date.now());
  const context: GameContext = {
    store,
    progress: store.load(),
    i18n: createI18n(DICTIONARIES, 'pt'),
    rng: createRng(Number.isFinite(seed) ? seed : Date.now()),
    save() {
      store.save(context.progress);
    },
    setLocale(locale) {
      context.i18n.setLocale(locale);
      context.progress.locale = locale;
      context.save();
    },
    resetProgress() {
      context.progress = newProgress();
      context.save();
    },
  };
  if (context.progress.locale !== null) context.i18n.setLocale(context.progress.locale);
  return context;
}

export function ctx(scene: Phaser.Scene): GameContext {
  return scene.registry.get('ctx') as GameContext;
}
