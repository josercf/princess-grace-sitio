import { describe, expect, it } from 'vitest';
import { initialDifficulty, recordAttempt, type DifficultyState } from '../../src/core/difficulty';

const wrong = { correct: false, usedHint: false };
const right = { correct: true, usedHint: false };
const rightWithHint = { correct: true, usedHint: true };

function apply(state: DifficultyState, attempts: { correct: boolean; usedHint: boolean }[]): DifficultyState {
  return attempts.reduce(recordAttempt, state);
}

describe('dificuldade', () => {
  it('começa no nível 2', () => {
    expect(initialDifficulty()).toEqual({ level: 2, errorStreak: 0, successStreak: 0 });
  });

  it('dois erros seguidos baixam um nível e zeram as sequências', () => {
    expect(apply(initialDifficulty(), [wrong, wrong])).toEqual({ level: 1, errorStreak: 0, successStreak: 0 });
  });

  it('um acerto entre erros reinicia a contagem de erros', () => {
    expect(apply(initialDifficulty(), [wrong, right, wrong]).level).toBe(2);
  });

  it('três acertos seguidos sem dica sobem um nível', () => {
    expect(apply(initialDifficulty(), [right, right, right])).toEqual({ level: 3, errorStreak: 0, successStreak: 0 });
  });

  it('acerto com dica não conta para subir', () => {
    expect(apply(initialDifficulty(), [right, rightWithHint, right, right]).level).toBe(2);
  });

  it('não passa de 3 nem de 1', () => {
    expect(apply(initialDifficulty(), Array(9).fill(right)).level).toBe(3);
    expect(apply(initialDifficulty(), Array(8).fill(wrong)).level).toBe(1);
  });

  it('não altera o estado recebido', () => {
    const state = initialDifficulty();
    recordAttempt(state, wrong);
    expect(state.errorStreak).toBe(0);
  });
});
