import Phaser from 'phaser';
import type { ComprehensionQuestion } from '../../core/challenges/comprehension';
import { addButton, addText, COLORS } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

export class ComprehensionView implements ChallengeView<ComprehensionQuestion> {
  private scene!: Phaser.Scene;
  private question!: ComprehensionQuestion;
  private api!: ChallengeViewApi;
  private page: Phaser.GameObjects.Container | null = null;
  private answers: string[] = [];

  mount(scene: Phaser.Scene, question: ComprehensionQuestion, api: ChallengeViewApi): void {
    this.scene = scene;
    this.question = question;
    this.api = api;
    this.showText();
  }

  private newPage(): Phaser.GameObjects.Container {
    this.page?.destroy();
    this.page = this.scene.add.container(0, 0);
    return this.page;
  }

  private later(action: () => void): void {
    this.scene.time.delayedCall(0, action);
  }

  private showText(): void {
    const page = this.newPage();
    page.add(addText(this.scene, 160, 12, this.question.title, { size: 13, align: 'center', color: COLORS.pinkDark }).setOrigin(0.5, 0));
    page.add(addText(this.scene, 16, 32, this.question.paragraphs.join('\n\n'), { size: 9, width: 288 }));
    page.add(
      addButton(this.scene, { id: 'cp-continue', x: 250, y: 158, width: 90, height: 22, label: this.api.t('common.continue'), onPress: () => this.later(() => this.showQuestion(0)) }),
    );
  }

  private showQuestion(index: number): void {
    const item = this.question.questions[index];
    if (!item) return;
    const page = this.newPage();
    page.add(
      addText(this.scene, 160, 16, this.api.t('challenge.comprehension.question', { n: index + 1, total: this.question.questions.length }), { size: 9, align: 'center' }).setOrigin(0.5, 0),
    );
    page.add(addText(this.scene, 160, 34, item.prompt, { size: 12, width: 280, align: 'center' }).setOrigin(0.5, 0));
    item.options.forEach((option, j) => {
      page.add(
        addButton(this.scene, { id: `cp-q${index}-opt-${j}`, x: 160, y: 88 + j * 28, width: 220, height: 24, label: option, onPress: () => this.later(() => this.answer(index, option)) }),
      );
    });
  }

  private answer(index: number, option: string): void {
    this.answers[index] = option;
    if (index + 1 < this.question.questions.length) this.showQuestion(index + 1);
    else this.api.submit([...this.answers]);
  }

  reset(): void {
    this.answers = [];
    this.showText();
  }

  answerPlan(question: ComprehensionQuestion): string[] {
    return ['cp-continue', ...question.questions.map((item, i) => `cp-q${i}-opt-${item.options.indexOf(item.answer)}`)];
  }
}
