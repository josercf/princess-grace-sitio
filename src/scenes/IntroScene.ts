import Phaser from 'phaser';
import { formatCompanionName, MAX_NAME_LENGTH } from '../core/names';
import { ctx } from '../game/context';
import { showDialogue } from '../game/overlays';
import { useDeviceResolution } from '../game/resolution';
import { addButton, addText, COLORS, FILLS, setButtonEnabled } from '../game/ui';

const LETTERS = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export class IntroScene extends Phaser.Scene {
  private name = '';
  private nameText!: Phaser.GameObjects.Text;
  private confirmButton!: Phaser.GameObjects.Container;

  constructor() {
    super('IntroScene');
  }

  async create(): Promise<void> {
    useDeviceResolution(this);
    this.name = '';
    const context = ctx(this);
    this.cameras.main.setBackgroundColor('#4a1f5c');
    await showDialogue(
      this,
      ['intro.1', 'intro.2', 'intro.3', 'intro.4'].map((key) => ({ speaker: 'narrator' as const, text: context.i18n.t(key) })),
    );
    this.buildNameEntry();
  }

  private buildNameEntry(): void {
    const { i18n } = ctx(this);
    addText(this, 160, 8, i18n.t('intro.nameQuestion'), { size: 10, width: 290, align: 'center', color: COLORS.paper }).setOrigin(0.5, 0);
    this.add.rectangle(160, 52, 160, 22, FILLS.paper).setStrokeStyle(1, FILLS.pinkDark);
    this.nameText = addText(this, 160, 52, '', { size: 13, align: 'center' }).setOrigin(0.5);

    LETTERS.forEach((letter, i) => {
      addButton(this, { id: `kb-${letter}`, x: 22 + (i % 13) * 23, y: 82 + Math.floor(i / 13) * 25, width: 21, height: 22, label: letter, onPress: () => this.type(letter) });
    });

    [1, 2, 3].forEach((n, i) => {
      const suggestion = i18n.t(`intro.suggestion.${n}`);
      addButton(this, {
        id: `name-suggestion-${i}`, x: 60 + i * 100, y: 136, width: 90, height: 22, label: suggestion, fill: FILLS.lilac,
        onPress: () => {
          this.name = suggestion;
          this.refresh();
        },
      });
    });

    addButton(this, {
      id: 'name-erase', x: 90, y: 164, width: 90, height: 22, label: i18n.t('common.erase'), fill: FILLS.grey,
      onPress: () => {
        this.name = Array.from(this.name).slice(0, -1).join('');
        this.refresh();
      },
    });
    this.confirmButton = addButton(this, { id: 'name-confirm', x: 230, y: 164, width: 90, height: 22, label: i18n.t('common.confirm'), onPress: () => this.finish() });
    this.refresh();
  }

  private type(letter: string): void {
    if (Array.from(this.name).length >= MAX_NAME_LENGTH) return;
    this.name += letter;
    this.refresh();
  }

  private refresh(): void {
    this.nameText.setText(formatCompanionName(this.name));
    setButtonEnabled(this.confirmButton, formatCompanionName(this.name) !== '');
  }

  private finish(): void {
    const name = formatCompanionName(this.name);
    if (name === '') return;
    const context = ctx(this);
    context.progress.companionName = name;
    context.save();
    this.scene.start('MapScene');
  }
}
