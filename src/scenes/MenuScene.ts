import Phaser from 'phaser';
import { ctx } from '../game/context';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const context = ctx(this);
    this.add.rectangle(160, 90, 320, 180, FILLS.ink, 0.7).setInteractive();
    this.add.rectangle(160, 90, 200, 136, FILLS.paper).setStrokeStyle(2, FILLS.pinkDark);

    addButton(this, {
      id: 'menu-language', x: 160, y: 50, width: 160, height: 24, label: context.i18n.t('menu.language'),
      onPress: () => {
        this.scene.stop('MapScene');
        this.scene.start('LanguageScene', { returnTo: 'MapScene' });
      },
    });
    addButton(this, {
      id: 'menu-restart', x: 160, y: 82, width: 160, height: 24, label: context.i18n.t('menu.restart'), fill: FILLS.grey,
      onPress: () => {
        context.resetProgress();
        this.scene.stop('MapScene');
        this.scene.start('LanguageScene');
      },
    });
    addButton(this, {
      id: 'menu-close', x: 160, y: 114, width: 160, height: 24, label: context.i18n.t('menu.close'), fill: FILLS.lilac,
      onPress: () => {
        this.scene.stop();
        this.game.events.emit('menu-closed');
      },
    });

    if (!context.store.available) {
      addText(this, 160, 144, context.i18n.t('menu.noSave'), { size: 8, width: 180, align: 'center', color: COLORS.pinkDark }).setOrigin(0.5, 0);
    }
  }
}
