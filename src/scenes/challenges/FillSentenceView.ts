import type Phaser from 'phaser';
import type { FillSentenceQuestion } from '../../core/challenges/fillSentence';
import { addButton, addText } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

export class FillSentenceView implements ChallengeView<FillSentenceQuestion> {
  mount(scene: Phaser.Scene, question: FillSentenceQuestion, api: ChallengeViewApi): void {
    addText(scene, 160, 44, question.text, { size: 13, width: 280, align: 'center' }).setOrigin(0.5);
    question.options.forEach((option, i) => {
      addButton(scene, { id: `fs-opt-${i}`, x: 160, y: 96 + i * 28, width: 180, height: 24, size: 12, label: option, onPress: () => api.submit(option) });
    });
  }

  reset(): void {}

  answerPlan(question: FillSentenceQuestion): string[] {
    return [`fs-opt-${question.options.indexOf(question.answer)}`];
  }
}
