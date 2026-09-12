import { initialDifficulty, type DifficultyState } from './difficulty';
import { isLocale, type Locale } from './locale';
import { MAX_NAME_LENGTH } from './names';

export const PROGRESS_VERSION = 1;
export const PROGRESS_KEY = 'princess-grace-sitio.progress';

export interface Progress {
  version: typeof PROGRESS_VERSION;
  locale: Locale | null;
  companionName: string | null;
  completed: string[];
  difficulty: DifficultyState;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressStore {
  readonly available: boolean;
  load(): Progress;
  save(progress: Progress): void;
}

export function newProgress(): Progress {
  return { version: PROGRESS_VERSION, locale: null, companionName: null, completed: [], difficulty: initialDifficulty() };
}

export function serializeProgress(progress: Progress): string {
  return JSON.stringify(progress);
}

function isStreak(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isDifficulty(value: unknown): value is DifficultyState {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Record<string, unknown>;
  return (d.level === 1 || d.level === 2 || d.level === 3) && isStreak(d.errorStreak) && isStreak(d.successStreak);
}

export function parseProgress(raw: string | null): Progress {
  if (raw === null) return newProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return newProgress();
  }
  if (typeof data !== 'object' || data === null) return newProgress();
  const p = data as Record<string, unknown>;

  const validName =
    p.companionName === null ||
    (typeof p.companionName === 'string' && Array.from(p.companionName).length <= MAX_NAME_LENGTH);
  const valid =
    p.version === PROGRESS_VERSION &&
    (p.locale === null || isLocale(p.locale)) &&
    validName &&
    Array.isArray(p.completed) &&
    p.completed.every((id) => typeof id === 'string') &&
    isDifficulty(p.difficulty);

  if (!valid) return newProgress();
  return {
    version: PROGRESS_VERSION,
    locale: p.locale as Locale | null,
    companionName: p.companionName as string | null,
    completed: [...(p.completed as string[])],
    difficulty: { ...(p.difficulty as DifficultyState) },
  };
}

export function createProgressStore(storage: StorageLike | null): ProgressStore {
  let available = storage !== null;
  if (storage) {
    try {
      storage.setItem(`${PROGRESS_KEY}.probe`, '1');
      storage.getItem(`${PROGRESS_KEY}.probe`);
    } catch {
      available = false;
    }
  }

  return {
    get available() {
      return available;
    },
    load() {
      if (!available || !storage) return newProgress();
      try {
        return parseProgress(storage.getItem(PROGRESS_KEY));
      } catch {
        return newProgress();
      }
    },
    save(progress) {
      if (!available || !storage) return;
      try {
        storage.setItem(PROGRESS_KEY, serializeProgress(progress));
      } catch {
        available = false;
      }
    },
  };
}
