import type Phaser from 'phaser';
import type { Vars } from '../../core/i18n';

export interface ChallengeViewApi {
  t(key: string, vars?: Vars): string;
  submit(answer: unknown): void;
}

export interface ChallengeView<Q> {
  mount(scene: Phaser.Scene, question: Q, api: ChallengeViewApi): void;
  reset(): void;
  answerPlan(question: Q): string[];
}
