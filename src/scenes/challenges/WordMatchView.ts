import type Phaser from 'phaser';
import type { WordMatchAnswer, WordMatchQuestion } from '../../core/challenges/wordMatch';
import { addButton, addText, FILLS, setButtonFill } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

const PAIR_FILLS = [FILLS.green, FILLS.blue, FILLS.yellow, FILLS.orange, FILLS.lilac];

export class WordMatchView implements ChallengeView<WordMatchQuestion> {
  private question!: WordMatchQuestion;
  private api!: ChallengeViewApi;
  private leftButtons: Phaser.GameObjects.Container[] = [];
  private rightButtons: Phaser.GameObjects.Container[] = [];
  private selected: number | null = null;
  private links = new Map<number, number>();

  mount(scene: Phaser.Scene, question: WordMatchQuestion, api: ChallengeViewApi): void {
    this.question = question;
    this.api = api;
    addText(scene, 160, 16, api.t('challenge.wordMatch.prompt'), { size: 11, width: 280, align: 'center' }).setOrigin(0.5, 0);
    const rowY = (i: number) => 52 + i * 24;
    this.leftButtons = question.left.map((word, i) =>
      addButton(scene, { id: `wm-left-${i}`, x: 88, y: rowY(i), width: 136, height: 22, label: word, fill: FILLS.paper, onPress: () => this.pickLeft(i) }),
    );
    this.rightButtons = question.right.map((word, j) =>
      addButton(scene, { id: `wm-right-${j}`, x: 232, y: rowY(j), width: 136, height: 22, label: word, fill: FILLS.paper, onPress: () => this.pickRight(j) }),
    );
  }

  private pickLeft(index: number): void {
    this.selected = index;
    this.paint();
  }

  private pickRight(index: number): void {
    if (this.selected === null) return;
    for (const [left, right] of [...this.links]) {
      if (right === index || left === this.selected) this.links.delete(left);
    }
    this.links.set(this.selected, index);
    this.selected = null;
    this.paint();

    if (this.links.size === this.question.pairs.length) {
      const answer: WordMatchAnswer = {};
      for (const [left, right] of this.links) answer[this.question.left[left] ?? ''] = this.question.right[right] ?? '';
      this.api.submit(answer);
    }
  }

  private paint(): void {
    const order = [...this.links.keys()];
    this.leftButtons.forEach((button, i) => {
      const linkIndex = order.indexOf(i);
      const fill = i === this.selected ? FILLS.pinkDark : linkIndex >= 0 ? (PAIR_FILLS[linkIndex % PAIR_FILLS.length] ?? FILLS.paper) : FILLS.paper;
      setButtonFill(button, fill);
    });
    this.rightButtons.forEach((button, j) => {
      const linkIndex = order.findIndex((left) => this.links.get(left) === j);
      setButtonFill(button, linkIndex >= 0 ? (PAIR_FILLS[linkIndex % PAIR_FILLS.length] ?? FILLS.paper) : FILLS.paper);
    });
  }

  reset(): void {
    this.links.clear();
    this.selected = null;
    this.paint();
  }

  answerPlan(question: WordMatchQuestion): string[] {
    return question.pairs.flatMap((pair) => [`wm-left-${question.left.indexOf(pair.pt)}`, `wm-right-${question.right.indexOf(pair.en)}`]);
  }
}
