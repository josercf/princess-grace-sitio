import Phaser from 'phaser';
import { ctx } from '../game/context';
import { useDeviceResolution } from '../game/resolution';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class PhaseCompleteScene extends Phaser.Scene {
  constructor() {
    super('PhaseCompleteScene');
  }

  create(): void {
    useDeviceResolution(this);
    const context = ctx(this);
    this.cameras.main.setBackgroundColor('#4a1f5c');
    addText(this, 160, 50, context.i18n.t('phase1.complete'), { size: 20, color: COLORS.paper, align: 'center' }).setOrigin(0.5);
    addText(this, 160, 90, context.i18n.t('phase1.next'), { size: 11, width: 260, color: COLORS.lilac, align: 'center' }).setOrigin(0.5);
    addButton(this, {
      id: 'complete-language', x: 95, y: 140, width: 120, height: 24, label: context.i18n.t('menu.language'), fill: FILLS.lilac,
      onPress: () => this.scene.start('LanguageScene', { returnTo: 'PhaseCompleteScene' }),
    });
    addButton(this, {
      id: 'complete-restart', x: 225, y: 140, width: 120, height: 24, label: context.i18n.t('menu.restart'), fill: FILLS.pink,
      onPress: () => {
        context.resetProgress();
        this.scene.start('LanguageScene');
      },
    });
  }
}
