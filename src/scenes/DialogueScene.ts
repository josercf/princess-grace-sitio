import Phaser from 'phaser';
import type { SpeakerId } from '../core/phaseFlow';
import { ctx, type GameContext } from '../game/context';
import type { DialogueLine } from '../game/overlays';
import { useDeviceResolution } from '../game/resolution';
import { registerTappable } from '../game/testHook';
import { testState } from '../game/testState';
import { addText, COLORS, FILLS } from '../game/ui';

function speakerName(context: GameContext, speaker: SpeakerId): string {
  if (speaker === 'narrator') return '';
  if (speaker === 'companion') return context.progress.companionName ?? '';
  return context.i18n.t(`npc.${speaker}`);
}

export class DialogueScene extends Phaser.Scene {
  private lines: DialogueLine[] = [];
  private index = 0;
  private portrait!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;

  constructor() {
    super('DialogueScene');
  }

  create(data: { lines: DialogueLine[] }): void {
    useDeviceResolution(this);
    this.lines = data.lines;
    this.index = 0;

    this.add.rectangle(160, 146, 312, 60, FILLS.paper).setStrokeStyle(2, FILLS.ink);
    this.portrait = this.add.image(4, 176, '__DEFAULT').setOrigin(0, 1).setVisible(false);
    this.nameText = addText(this, 12, 120, '', { size: 10, color: COLORS.pinkDark });
    this.bodyText = addText(this, 12, 133, '', { size: 10 });
    addText(this, 306, 166, '▼', { size: 8, color: COLORS.pinkDark }).setOrigin(1, 0.5);

    const zone = this.add.zone(160, 90, 320, 180).setInteractive();
    zone.on('pointerup', () => this.advance());
    registerTappable('dlg-next', zone);

    this.show();
  }

  private show(): void {
    const line = this.lines[this.index];
    if (!line) return;
    const context = ctx(this);
    const portraitKey = `sprite-${line.speaker}-portrait`;
    const hasPortrait = this.textures.exists(portraitKey);
    this.portrait.setVisible(hasPortrait);
    if (hasPortrait) this.portrait.setTexture(portraitKey, 0);

    const textX = hasPortrait ? 104 : 12;
    const width = hasPortrait ? 206 : 296;
    this.nameText.setPosition(textX, 120).setText(speakerName(context, line.speaker));
    this.bodyText.setPosition(textX, 133).setWordWrapWidth(width, true).setText(line.text);
    testState.dialogueText = line.text;
  }

  private advance(): void {
    this.index += 1;
    if (this.index < this.lines.length) {
      this.show();
      return;
    }
    testState.dialogueText = null;
    this.scene.stop();
    this.game.events.emit('dialogue-done');
  }
}
