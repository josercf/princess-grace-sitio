import type Phaser from 'phaser';
import type { WordBuildQuestion } from '../../core/challenges/wordBuild';
import { addButton, addText, FILLS, setButtonEnabled } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

const MAX_COLUMNS = 10;
const CELL = 24;
const SLOT = 18;

export class WordBuildView implements ChallengeView<WordBuildQuestion> {
  private question!: WordBuildQuestion;
  private api!: ChallengeViewApi;
  private picked: number[] = [];
  private tiles: Phaser.GameObjects.Container[] = [];
  private slots: Phaser.GameObjects.Text[] = [];

  mount(scene: Phaser.Scene, question: WordBuildQuestion, api: ChallengeViewApi): void {
    this.question = question;
    this.api = api;
    addText(scene, 160, 16, api.t('challenge.wordBuild.prompt', { clue: question.clue }), { size: 11, width: 280, align: 'center' }).setOrigin(0.5, 0);

    const slotsX = 160 - (question.letters.length * SLOT) / 2 + SLOT / 2;
    this.slots = question.letters.map((_, i) => {
      scene.add.rectangle(slotsX + i * SLOT, 66, 16, 20, FILLS.pinkLight).setStrokeStyle(1, FILLS.ink);
      return addText(scene, slotsX + i * SLOT, 66, '', { size: 12, align: 'center' }).setOrigin(0.5);
    });

    const columns = Math.min(question.tiles.length, MAX_COLUMNS);
    const tilesX = 160 - (columns * CELL) / 2 + CELL / 2;
    this.tiles = question.tiles.map((letter, i) =>
      addButton(scene, { id: `wb-tile-${i}`, x: tilesX + (i % columns) * CELL, y: 100 + Math.floor(i / columns) * CELL, width: 22, height: 22, size: 12, label: letter, onPress: () => this.pick(i) }),
    );

    addButton(scene, { id: 'wb-erase', x: 90, y: 156, width: 90, height: 22, label: api.t('common.erase'), fill: FILLS.grey, onPress: () => this.erase() });
    addButton(scene, { id: 'wb-confirm', x: 230, y: 156, width: 90, height: 22, label: api.t('common.confirm'), onPress: () => this.confirm() });
  }

  private pick(index: number): void {
    if (this.picked.length >= this.question.letters.length || this.picked.includes(index)) return;
    this.picked.push(index);
    const tile = this.tiles[index];
    if (tile) setButtonEnabled(tile, false);
    this.refresh();
  }

  private erase(): void {
    const index = this.picked.pop();
    const tile = index === undefined ? undefined : this.tiles[index];
    if (tile) setButtonEnabled(tile, true);
    this.refresh();
  }

  private confirm(): void {
    if (this.picked.length !== this.question.letters.length) return;
    this.api.submit(this.picked.map((i) => this.question.tiles[i]));
  }

  private refresh(): void {
    this.slots.forEach((slot, i) => {
      const index = this.picked[i];
      slot.setText(index === undefined ? '' : (this.question.tiles[index] ?? ''));
    });
  }

  reset(): void {
    for (const index of this.picked) {
      const tile = this.tiles[index];
      if (tile) setButtonEnabled(tile, true);
    }
    this.picked = [];
    this.refresh();
  }

  answerPlan(question: WordBuildQuestion): string[] {
    const used = new Set<number>();
    const ids = question.letters.map((letter) => {
      const index = question.tiles.findIndex((tile, i) => tile === letter && !used.has(i));
      used.add(index);
      return `wb-tile-${index}`;
    });
    return [...ids, 'wb-confirm'];
  }
}
