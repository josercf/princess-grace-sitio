export type Level = 1 | 2 | 3;

export interface DifficultyState {
  level: Level;
  errorStreak: number;
  successStreak: number;
}

export const ERRORS_TO_LOWER = 2;
export const SUCCESSES_TO_RAISE = 3;

export function initialDifficulty(): DifficultyState {
  return { level: 2, errorStreak: 0, successStreak: 0 };
}

function clampLevel(value: number): Level {
  return Math.min(3, Math.max(1, value)) as Level;
}

export function recordAttempt(
  state: DifficultyState,
  attempt: { correct: boolean; usedHint: boolean },
): DifficultyState {
  if (!attempt.correct) {
    const errorStreak = state.errorStreak + 1;
    if (errorStreak >= ERRORS_TO_LOWER) {
      return { level: clampLevel(state.level - 1), errorStreak: 0, successStreak: 0 };
    }
    return { ...state, errorStreak, successStreak: 0 };
  }

  if (attempt.usedHint) return { ...state, errorStreak: 0, successStreak: 0 };

  const successStreak = state.successStreak + 1;
  if (successStreak >= SUCCESSES_TO_RAISE) {
    return { level: clampLevel(state.level + 1), errorStreak: 0, successStreak: 0 };
  }
  return { ...state, errorStreak: 0, successStreak };
}
